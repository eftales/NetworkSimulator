import MinHeap from './heap';
import {Simulator} from "./simulator";

/**
 * 由于浏览器性能和调度的原因，本项目最小的时间间隔是 10ms，因此 Host.miu 的最小值为 10
 */


const r1:number[] = [0xff,0xff];
const r2:number = 0x1234;
console.log(r1[0]&r2);

console.log("===================测试heap==============");
let ArrNum:number[] = [];
let heap = new MinHeap((a:number,b:number)=>{return a<b;}, ArrNum);

for(let i=1;i<10;++i){
    heap.add(Math.round(Math.random()*1000));

}

while(heap.size!==0){
    console.log(heap.pop());
}


console.log("===================测试Event==============");

import {EventEmitter} from "events";
import { Frame } from './frame';


let frame = new Frame();
console.log(frame)


const emitter = new EventEmitter();

// // Listen
// emitter.on('foo', foo => console.log(foo));
// emitter.on('bar', bar => console.log(bar));


// // Emit
// emitter.emit('foo', 1);
// emitter.emit('bar', "asdasdasd");


class reciver{
    et:EventEmitter; 
    constructor(et_:EventEmitter){
        this.et = et_;
        emitter.on('foo', foo => console.log(foo));
        emitter.on('bar', bar => console.log(bar));
    };
};

class sender{
    et:EventEmitter; 
    constructor(et_:EventEmitter){
        this.et = et_;
    };
    public send(){
        this.et.emit("foo",233);
    }
};


let re = new reciver(emitter);
let sd = new sender(emitter);

sd.send();

console.log("===================测试Map==============");
let myMap = new Map([
    ["key1", 1],
    ["key2", 2]
]); 

myMap.set("k3",3);
console.log(myMap);
console.log("===================测试Simulator==============");
let swNum:number = 2;
let hostNum:number = 2;
let forwardTime = 5;
let sim = new Simulator(swNum,forwardTime,hostNum); 


/*
    创建拓扑
    H0 - SW0 - SW1 - H1
*/

sim.link("sw0",0,"h0",0);
sim.link("sw0",7,"sw1",7);
sim.link("sw1",1,"h1",0);
sim.genFlowTables();
sim.inspect();

// let sw0 = sim.swLists[0],sw1 = sim.swLists[1];


sim.hostLists[0].sendFlow();
sim.hostLists[1].sendFlow();

