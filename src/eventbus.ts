import {EventEmitter} from "events";
import { Frame } from "./frame";
import MinHeap from './heap';
import { deviceTypes } from "./simulator";

export class Event{
    time:number;
    frame:Frame = new Frame();

    constructor(time:number,frame:Frame){
        this.time = time;
        Object.assign(this.frame, frame);
    }

    public static compair(e1:Event,e2:Event){
        return e1.time<e2.time;
    }

};

export class EventBus{
    deviceName:string;
    emitter:EventEmitter;
    heap:MinHeap<Event> = new MinHeap(Event.compair);
    set:Set<string> = new Set();
    forwardTime:number;


    constructor(emitter:EventEmitter,deviceName:string,set:Set<string>,forwardTime:number){
        this.emitter = emitter;
        this.deviceName = deviceName;
        this.set = set;
        this.forwardTime = forwardTime;




        this.emitter.on("EventBusRecv",this.recv.bind(this));
        this.dispatch();

    }

    private recv(event:Event){
        // console.log("[DEBUG] "+ this.deviceName+" recived.");
        this.heap.add(event);
    }

    public dispatch(){
        // console.log("[DEBUG] " +this.deviceName+" is dispatch...");
        if(this.heap.size != 0){
            let event = this.heap.pop();

            if(this.set.has(event.frame.handler)){
                this.emitter.emit(event.frame.handler+"recv",event); // 因为这里是阻塞执行的，所以当返回时交换机一定完成了转发
                if(event.frame.handler.search(deviceTypes.typeSwitch)){
                    // 因为交换机有转发时延，为保证时序正确，必须在交换机转发后睡眠 forwardTime 这么长的时间
                    setTimeout(this.dispatch.bind(this),this.forwardTime);
                }
                else{
                    // 终端则可以直接苏醒，因为终端发送报文没有时延
                    setTimeout(this.dispatch.bind(this),0);// 放弃时间片，让交换机进行处理
                }
        
            }
            else{
                throw("[ERROR] "+this.deviceName+" handler mis. "+event.frame.handler);
            }
        }
        else{
            // 堆栈中没有事件，继续等待
            setTimeout(this.dispatch.bind(this),this.forwardTime);
        }

        

    }

}
