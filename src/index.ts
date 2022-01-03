import {Simulator} from "./simulator";

const r1:number[] = [0xff,0xff];
const r2:number = 0x1234;
console.log(r1[0]&r2);





console.log("===================测试Simulator==============");
let swNum:number = 2;
let hostNum:number = 2;
let forwardTime = 5;
let sim = new Simulator(swNum,forwardTime,hostNum); 



