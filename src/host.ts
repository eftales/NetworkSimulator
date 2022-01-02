import {EventEmitter} from "events";
import { Frame } from "./frame";
const jStat = require('jstat');

export class Host{
    deviceName:string;
    randNum: number[] = [0x11,0x22];
    peerID:string = "";
    emitter:EventEmitter;
    dstMACs:string[];

    arrivalMiu:number = 1000; // 1/指数分布参数，等价于到达时间间隔的期望
    dataLenMiu:number = 100; // 1/指数分布参数，等价于平均包长度

    recvedDataLen:number = 0;
    recvedDataCount:number = 0;
    sendedDataLen:number = 0;
    sendedDataCount:number = 0;


    constructor(deviceName:string, dstMACs:string[],emitter:EventEmitter){
        this.deviceName = deviceName;
        this.emitter = emitter;
        this.dstMACs = [...dstMACs]; 

        emitter.on(deviceName+"recv",this.recvFlow.bind(this));

    }

    public connect2(peerID_:string){
        if(this.peerID.length!=0){
            // 终端只允许有一个 peer
            throw(this.deviceName+"多重连接."+this.peerID);
        }
        this.peerID = peerID_;
    }

    public recvFlow(frame:Frame){
        let p = 11;
        for(let i=0;i<1000;++i){
            p = Math.random();
            p += 1;
        }

        // 统计收到报文的大小和数目
        this.recvedDataLen += frame.dataLen + frame.dst.length + frame.src.length + frame.checkcode.length;
        this.recvedDataCount += 1;

        console.log("[DEBUG] "+Date.now()+" "+this.deviceName+" recvedDataLen = "+this.recvedDataLen+" recvedDataCount = "+this.recvedDataCount);

    }

    public sendFlow(){

        let lambda = 1/this.arrivalMiu;
        let sendTime = jStat.exponential.sample(lambda);

        setTimeout(this.sendFlow.bind(this),sendTime); // 先异步

        // 再crc
        let dataLen = jStat.exponential.sample(1/this.dataLenMiu);
        let frame = new Frame(this.deviceName,this.genDst(),this.randNum,dataLen);
        this.emitter.emit(this.peerID+"recv",frame); // 只能发给交换机，在这里会阻塞
        this.sendedDataLen += dataLen + frame.dst.length + frame.src.length + frame.checkcode.length;
        this.sendedDataCount += 1;
        // 因为 emit 是阻塞的，所以在数据包被接受|丢弃后，这里才会输出。对事件处理时序没有影响

        console.log("[DEBUG] "+Date.now()+" "+this.deviceName+" sendedDataLen = "+this.sendedDataLen+" sendedDataCount = "+this.sendedDataCount);


    }


    public genDst():string{
        // 默认第一个设备有 80% 的概率，且自己不能发给自己
        if(this.deviceName!==this.dstMACs[0] && Math.random()<0.8){
            return this.dstMACs[0];
        }
        else{
            // 在其他的里面随便选一个
            let index:number = Math.round(Math.random()*(this.dstMACs.length-2))+1;
            return this.dstMACs[index];
        }
    }


}
