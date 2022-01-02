import {EventEmitter} from "events";
import { Frame } from "./frame";

export class Switch{
    deviceName:string;
    randNum: number[] = [0x00,0x00];
    peerIDs:string[] = ["","","","","","","",""]; // 交换机固定有 8 个口
    emitter:EventEmitter;
    forwardTable:Map<string,number> = new Map<string,number>();

    constructor(deviceName:string, emitter:EventEmitter){
        this.deviceName = deviceName;
        this.emitter = emitter;
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


    public forward(frame:Frame){
        console.log("[DEBUG] "+Date.now()+" "+this.deviceName+" is forwarding...");

        frame.check(this.randNum);
        let portID = this.forwardTable.get(frame.dst);

        if(typeof portID !== "undefined" ){
            this.emitter.emit(this.peerIDs[portID]+"recv",frame)
        }
        else{
            throw("[ERROR] "+this.deviceName+" forwardTable mis.");
        }


    }

}
