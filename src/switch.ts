import {EventEmitter} from "events";
import { Event } from "./eventbus";
import {CRCCaler} from './crc';

export class Switch{
    crcCaler:CRCCaler = new CRCCaler();

    deviceName:string;
    randNum: number[] = [0x00,0x00];
    peerIDs:string[] = ["","","","","","","",""]; // 交换机固定有 8 个口
    emitter:EventEmitter;
    forwardTable:Map<string,number> = new Map<string,number>();
    forwardTime:number=5; // 转发耗时默认为 5 ms

    loc:number[] = [0,0];

    constructor(deviceName:string, emitter:EventEmitter, loc:number[],forwardTime?:number){
        this.deviceName = deviceName;
        this.emitter = emitter;
        this.loc = [...loc];

        if (typeof forwardTime !== "undefined"){
            this.forwardTime = forwardTime;
        }
        emitter.on(this.deviceName+"recv",this.forward.bind(this));
        
    }

    public connect2(peerID_:string, port:number,){
        if(port>this.peerIDs.length){
            throw(this.deviceName+"没有这个端口"+port);
        }

        if(this.peerIDs[port].length != 0){
            // 终端只允许有一个 peer
            throw(this.deviceName+"多重连接");
        }
        this.peerIDs[port] = peerID_;
    }


    public forward(event:Event){
        console.log("[DEBUG] "+event.time+" "+this.deviceName+" is forwarding...");
        
        let checkCode = this.crcCaler.compute(event.frame.checkData,this.randNum);
        if(checkCode!==event.frame.checkcode){
            console.log("[DEBUG] "+event.time+" "+this.deviceName+" drop a frame. Messages are as follows:",event)
            return;

        }
        let portID = this.forwardTable.get(event.frame.dst);
        // console.log(this,event);

        if(typeof portID !== "undefined" ){
            event.time = event.time + this.forwardTime;
            event.frame.preHandler = this.deviceName;
            event.frame.renderStep = -1; // 重新开始渲染
            event.frame.handler = this.peerIDs[portID];
            this.emitter.emit("EventBusRecv",event);
        }
        else{
            throw("[ERROR] "+this.deviceName+" forwardTable mis.");
        }

    }
}
