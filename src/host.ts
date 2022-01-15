import {EventEmitter} from "events";
import { Frame } from "./frame";
import { Event } from "./eventbus";
import {CRCCaler} from './crc';

const jStat = require('jstat');

export class Host{
    crcCaler:CRCCaler = new CRCCaler();

    deviceName:string;
    randNum: number[] = [0x00,0x00];
    peerID:string = "";
    emitter:EventEmitter;
    dstMACs:string[];

    arrivalMiu:number = 1000; // 1/指数分布参数，等价于到达时间间隔的期望
    dataLenMiu:number = 100; // 1/指数分布参数，等价于平均包长度

    recvedDataLen:number = 0;
    recvedDataCount:number = 0;
    sendedDataLen:number = 0;
    sendedDataCount:number = 0;

    loc:number[] = [0,0];




    constructor(deviceName:string, dstMACs:string[],emitter:EventEmitter,loc:number[],arrivalMiu?:number,dataLenMiu?:number){
        this.deviceName = deviceName;
        this.emitter = emitter;
        this.dstMACs = [...dstMACs]; 
        this.loc = [...loc];

        if (typeof arrivalMiu !== "undefined"){
            this.arrivalMiu = arrivalMiu;
        }

        if (typeof dataLenMiu !== "undefined"){
            this.dataLenMiu = dataLenMiu;
        }

        emitter.on(deviceName+"recv",this.recvFlow.bind(this));

    }


    public connect2(peerID_:string){
        if(this.peerID.length!=0){
            // 终端只允许有一个 peer
            throw(this.deviceName+"多重连接."+this.peerID);
        }
        this.peerID = peerID_;
    }

    public recvFlow(event:Event){
        // 统计收到报文的大小和数目
        this.recvedDataLen += event.frame.dataLen + event.frame.dst.length + event.frame.src.length + 2; // 2 是 checkcode 的长度
        this.recvedDataCount += 1;

        console.log("[DEBUG] "+event.time +" "+this.deviceName+" recvedDataLen = "+this.recvedDataLen+" recvedDataCount = "+this.recvedDataCount);

    }

    public sendFlow(){
        let lambda = 1/this.arrivalMiu;
        let nextSendTime = jStat.exponential.sample(lambda); // 下一个报文的发送时间
 

        setTimeout(this.sendFlow.bind(this),nextSendTime); // 先异步

        // 再crc
        let dataLen = jStat.exponential.sample(1/this.dataLenMiu);
        let frame = new Frame(this.deviceName ,this.peerID,this.deviceName,this.genDst(),dataLen);
        frame.checkcode = this.crcCaler.compute(frame.checkData,this.randNum);
        console.log("host randnum is ",this.randNum);
        let event:Event = new Event(Date.now(),frame);

        // console.log(event);
        this.emitter.emit("EventBusRecv",event); // 因为 emit 是阻塞的，所以用 EventBus 将终端发送和交换机转发解耦
        this.sendedDataLen += dataLen + frame.dst.length + frame.src.length + 2; // 2 是 checkcode 的长度
        this.sendedDataCount += 1;
        console.log("[DEBUG] "+event.time+" "+this.deviceName+" sendedDataLen = "+this.sendedDataLen+" sendedDataCount = "+this.sendedDataCount);


    }


    public genDst():string{
        // 默认第一个设备有 80% 的概率，且自己不能发给自己
        if(this.deviceName!==this.dstMACs[0] && Math.random()<0.8){
            return this.dstMACs[0];
        }
        else{
            // 在其他的里面随便选一个，当然不能是自己
            let index:number = Math.round(Math.random()*(this.dstMACs.length-2))+1;
            if(this.deviceName===this.dstMACs[index]){
                index = (index+1)%this.dstMACs.length;
            }

            return this.dstMACs[index];
        }
    }


}
