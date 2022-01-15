import {Switch} from './switch';
import {Host} from './host';

import {EventEmitter} from "events";
import { EventBus } from './eventbus';
import { Event } from "./eventbus";
import { CanvasTopo } from './CanvasTopo';
import { Controller } from './controller';
import { Frame } from './frame';


export enum deviceTypes {
    typeSwitch = "sw",
    typeHost = "h",
    typeEventBus = "EventBus",
    typeLine = "line",
}

export class Simulator{
    emitter = new EventEmitter();
    canvasTopo:CanvasTopo;
    swLists:Switch[] = [];
    hostLists:Host[] = [];
    controller:Controller;
    set = new Set<string>();
    eventBus:any = null; 

    swNum:number = 0;
    hostNum:number = 0;


    forwardTime:number; // 转发耗时默认为 5 ms
    arrivalMiu:number; // 1/指数分布参数，等价于到达时间间隔的期望
    dataLenMiu:number; // 1/指数分布参数，等价于平均包长度
    dstMAcs:string[] = [];
    updatePeriod:number;
    swUpdateDelay:number;

    constructor(forwardTime:number=5, arrivalMiu:number=1000,dataLenMiu:number=100, updatePeriod:number=5*1000,swUpdateDelay:number=500){
        document.getElementById("startButton")!.onclick = this.startSim.bind(this);
        this.forwardTime = forwardTime;
        this.arrivalMiu = arrivalMiu;
        this.dataLenMiu = dataLenMiu; 
        this.updatePeriod = updatePeriod;
        this.swUpdateDelay = swUpdateDelay;
        this.canvasTopo = new CanvasTopo(this);         

        this.controller = new Controller("controller",this.emitter,this.swLists,this.hostLists,this.updatePeriod,this.swUpdateDelay);

    };

    public inspect(){
        // 检查元素
        console.log("[DEBUG] inspect simulator");
        for(let i=0;i<this.swLists.length;++i){
            console.log(this.swLists[i]);
        }
        for(let i=0;i<this.hostLists.length;++i){
            console.log(this.hostLists[i]);
        }
    };

    public startSim(){
        this.eventBus = new EventBus(this,this.emitter,deviceTypes.typeEventBus,this.set,this.forwardTime);

        console.log("[INFO] "+Date.now()+" "+"Simulator start.");
        this.genFlowTables();

        this.inspect();

        this.hostLists.forEach(host => {
            host.dstMACs = [...this.dstMAcs];
            let frame = new Frame();
            frame.handler = host.deviceName;
            frame.preHandler = host.deviceName;
            let event = new Event(Date.now(),frame);
            this.emitter.emit(host.deviceName+"send",event); 
        });


        this.controller.swLists = this.swLists;
        this.controller.hostLists = this.hostLists;

        let frame = new Frame();
        frame.handler = "controller";
        frame.preHandler = "controllerupdateHostRandNum";
        let event = new Event(Date.now()+this.updatePeriod,frame);
        this.emitter.emit(frame.preHandler,event); 

    }

    public addHost(X:number,Y:number){
        let deviceName = deviceTypes.typeHost + this.hostNum;
        this.hostLists.push(new Host(deviceName, [], this.emitter,[X,Y],this.arrivalMiu,this.dataLenMiu)); // 之后需要补充 dstMacs
        this.set.add(deviceName);
        this.dstMAcs.push(deviceName);
    }

    public addSwitch(X:number,Y:number){
        let deviceName = deviceTypes.typeSwitch + this.swNum;
        this.swLists.push(new Switch(deviceName, this.emitter,[X,Y],this.forwardTime));
        this.set.add(deviceName);
    }


    public link(deviceID1:string, deviceID2:string){
        let device1:Switch|Host,device2:Switch|Host;

        device1 = this.getElement(deviceID1);
        device2 = this.getElement(deviceID2);


        let port1 = this.getUnusePort(device1), port2 = this.getUnusePort(device2);

        // console.log(port1,port2);
        // console.log(device1,device2);


        if(port1 >= 0 && port2 >= 0){
            device1.connect2(deviceID2, port1);
            device2.connect2(deviceID1, port2);
        }
        else{
            console.log(this);
            throw("无效的 port");
        }



    };

    private getUnusePort(device:Switch|Host){
        if(device instanceof Switch){
            for(let i = 0;i<device.peerIDs.length;++i){
                if (device.peerIDs[i].length === 0){
                    return i;
                }
            }
        }
        else{
            if(device.peerID.length === 0){
                return 0;
            }
        }

        return -1;
    }

    public getElement(deviceID:string){
        let split = deviceID.search("[0-9]");
        let type = deviceID.substring(0,split);
        let index = Number(deviceID.substring(split,deviceID.length));
        switch(type){
            case deviceTypes.typeSwitch:
                if(index<this.swLists.length)
                {
                    return this.swLists[index];
                }
                else{
                    throw("找不到这个元素 "+type+index);
                }

            case deviceTypes.typeHost:
                if(index<this.hostLists.length)
                {
                    return this.hostLists[index];
                }
                else{
                    throw("找不到这个元素 "+type+index);
                }
    

        }
        throw("找不到这个元素 "+type+index);
    };


    private dfsTopologyDiscovery(device:Switch,visited:Set<string>):string[]{
        let hostIDs:string[] = [];
        visited.add(device.deviceName);
        for(let i=0;i<device.peerIDs.length;++i){
            if(device.peerIDs[i].length !== 0 && !visited.has(device.peerIDs[i])){
                let peer:Switch|Host = this.getElement(device.peerIDs[i]);
                if(peer instanceof Host){
                    device.forwardTable.set(peer.deviceName,i);
                    hostIDs.push(peer.deviceName);
                }
                else{
                    this.dfsTopologyDiscovery(peer,visited).forEach(hostID => {
                        device.forwardTable.set(hostID,i);
                        hostIDs.push(hostID);
                        
                    });
                }
                
            }
        }
        return hostIDs;

    }

    public genFlowTables(){
        for(let i=0;i<this.swLists.length;++i){
            let visited = new Set<string>();
            this.dfsTopologyDiscovery(this.swLists[i],visited);
        }
    }

}
