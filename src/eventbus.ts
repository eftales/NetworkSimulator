import {EventEmitter} from "events";
import { Frame } from "./frame";
import MinHeap from './heap';
import PacketRender from "./packetrender";
import { deviceTypes, Simulator } from "./simulator";

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
    sim:Simulator;
    packetRender:PacketRender;
    emitter:EventEmitter;
    heap:MinHeap<Event> = new MinHeap(Event.compair);
    set:Set<string> = new Set();
    forwardTime:number;


    constructor(sim:Simulator, emitter:EventEmitter,deviceName:string,set:Set<string>,forwardTime:number){
        this.sim = sim;
        this.emitter = emitter;
        this.deviceName = deviceName;
        this.set = set;
        this.forwardTime = forwardTime;
        this.packetRender = new PacketRender(sim);



        this.emitter.on("EventBusRecv",this.recv.bind(this));
        this.dispatch();

    }

    private recv(event:Event){
        // console.log("[DEBUG] "+ this.deviceName+" recived.");
        this.heap.add(event);
    }




    public dispatch(){
        // console.log("[DEBUG] " +this.deviceName+" is dispatch...");
        
        if(this.heap.size != 0 && (this.heap.peek().time<=Date.now()) ){
            let event = this.heap.pop();
            if(this.set.has(event.frame.handler)){
                if(event.frame.renderStep<=PacketRender.MaxRenderStep){
                    // 具体的渲染工作交给 PacketRender 来做
                    this.emitter.emit("PacketRender",event);
                    setTimeout(this.dispatch.bind(this),PacketRender.RenderGap);// TODO:这里的时间需要好好设置一下
                }
                else{
                    // 渲染完成，进行转发操作 | 处理 host 预约的发送事件
                    if(event.frame.handler===event.frame.preHandler){
                        // host 预约的发送事件
                        this.emitter.emit(event.frame.handler+"send",event);
                    }
                    else{
                        // 包转发事件
                        this.emitter.emit(event.frame.handler+"recv",event); // 因为这里是阻塞执行的，所以当返回时交换机一定完成了转发
                    }

                }


        
            }
            else if(event.frame.handler==="controller"){
                this.emitter.emit(event.frame.preHandler,event);

            }
            
            else{
                
                throw("[ERROR] "+this.deviceName+" handler mis. "+event.frame.handler);
                
            }
        }
        else{
            // 堆栈中没有事件或事件尚未发生，继续等待
            // console.log("堆栈中没有事件或事件尚未发生，继续等待");

        }

        setTimeout(this.dispatch.bind(this),5);//放弃时间片

    }

}
