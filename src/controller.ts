import {EventEmitter} from "events";
import { Event } from "./eventbus";
import {CRCCaler} from './crc';
import { Switch } from "./switch";
import { Host } from "./host";
import { Frame } from "./frame";

export class Controller{
    randNumHost: number[]=[0x00,0x00];
    randNumSwitch: number[]=[0x00,0x00];

    updatePeriod:number; //TODO: 5s 一次更新，需要和渲染时间等关联起来
    swUpdateDelay:number; // sw 更新延迟默认是 更新周期的 1/10
    emitter:EventEmitter;
    deviceName:string;
    swLists:Switch[];
    hostLists:Host[];


    constructor(deviceName:string,emitter:EventEmitter, swLists:Switch[], hostLists:Host[],updatePeriod:number=5*1000,swUpdateDelay:number=500){
        this.deviceName = deviceName;
        this.swLists = swLists;
        this.hostLists = hostLists;
        this.emitter = emitter;
        this.updatePeriod = updatePeriod;


        if (typeof swUpdateDelay !== "undefined"){
            this.swUpdateDelay = swUpdateDelay;
        }
        else{
            this.swUpdateDelay = updatePeriod/10;
        }
        this.emitter.on(this.deviceName+"updateSwitchRandNum",this.updateSwitchRandNum.bind(this));
        this.emitter.on(this.deviceName+"updateHostRandNum",this.updateHostRandNum.bind(this));
    }

    public updateHostRandNum(event:Event){
        // console.log(this);
        console.log("[DEBUG] "+event.time+" "+this.deviceName+" is updating host randNum...");
        // 预测网络最大流，生成新的随机码

        this.randNumHost[0] += 1;

        // 更新host终端随机码
        for(let i=0;i<this.hostLists.length;++i){
            this.hostLists[i].randNum = this.randNumHost;
        }


        // 传球给更新 sw 随机码
        let frame = new Frame();
        frame.handler = this.deviceName;
        frame.preHandler = this.deviceName+"updateSwitchRandNum";
        let eventNew:Event = new Event(event.time+this.swUpdateDelay,frame);
        this.emitter.emit("EventBusRecv",eventNew); // 通知 eventbus 自己 updatePeriod 之后还要继续更新随机码

    }

    public updateSwitchRandNum(event:Event){

        console.log("[DEBUG] "+event.time+" "+this.deviceName+" is updating sw randNum...");

        // 更新sw随机码
        this.randNumSwitch = [...this.randNumHost]; // 避免相互影响

        for(let i=0;i<this.swLists.length;++i){
            this.swLists[i].randNum = this.randNumSwitch;
        }


        // 传球给更新 host 随机码
        let frame = new Frame();
        frame.handler = this.deviceName;
        frame.preHandler = this.deviceName+"updateHostRandNum";
        let eventNew:Event = new Event(event.time+this.updatePeriod-this.swUpdateDelay,frame);
        this.emitter.emit("EventBusRecv",eventNew); // 通知 eventbus 自己 updatePeriod 之后还要继续更新随机码


    }

}