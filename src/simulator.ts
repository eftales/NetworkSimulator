import {Switch} from './switch';
import {Host} from './host';

import {EventEmitter} from "events";
import { EventBus } from './eventbus';


export enum deviceTypes {
    typeSwitch = "sw",
    typeHost = "h",
    typeEventBus = "EventBus",
}

export class Simulator{
    emitter = new EventEmitter();
    swLists:Switch[] = [];
    hostLists:Host[] = [];
    eventBus:EventBus;


    constructor(swNum:number, forwardTime:number=5, hostNum:number,arrivalMiu:number=1000,dataLenMiu:number=100){
        let set = new Set<string>();
        // 创建设备
        for(let i=0;i<swNum;++i){
            let deviceName = deviceTypes.typeSwitch + i;
            this.swLists.push(new Switch(deviceName, this.emitter,forwardTime));
            set.add(deviceName);
        }

        let dstMacs:string[] = [];
        for(let i=0;i<hostNum;++i){
            let deviceName = deviceTypes.typeHost + i;
            dstMacs.push(deviceName);
        }

        for(let i=0;i<hostNum;++i){
            let deviceName = deviceTypes.typeHost + i;
            this.hostLists.push(new Host(deviceName, dstMacs, this.emitter,arrivalMiu,dataLenMiu));
            set.add(deviceName);
        }

        this.eventBus = new EventBus(this.emitter,deviceTypes.typeEventBus,set,forwardTime);
        
    };

    public inspect(){
        // 检查元素
        for(let i=0;i<this.swLists.length;++i){
            console.log(this.swLists[i]);
        }
        for(let i=0;i<this.hostLists.length;++i){
            console.log(this.hostLists[i]);
        }
    };


    public link(deviceID1:string, port1:number, deviceID2:string, port2:number){
        let device1:Switch|Host,device2:Switch|Host;

        device1 = this.getElement(deviceID1);
        device2 = this.getElement(deviceID2);

        device1.connect2(deviceID2, port1);
        device2.connect2(deviceID1, port2);

    };

    private getElement(deviceID:string){
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


    private dfsTopologyDiscovery(device:Switch,prePort:number):string[]{
        let hostIDs:string[] = [];
        for(let i=0;i<device.peerIDs.length;++i){
            if(device.peerIDs[i].length !== 0 && i!==prePort){
                let peer:Switch|Host = this.getElement(device.peerIDs[i]);
                if(peer instanceof Host){
                    device.forwardTable.set(peer.deviceName,i);
                    hostIDs.push(peer.deviceName);
                }
                else{
                    this.dfsTopologyDiscovery(peer,i).forEach(hostID => {
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
            this.dfsTopologyDiscovery(this.swLists[i],-1);
        }
    }

}
