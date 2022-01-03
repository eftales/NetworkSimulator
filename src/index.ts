import {Simulator} from "./simulator";

console.log("===================测试==============");

const r1:number[] = [0xff,0xff];
const r2:number = 0x1234;
console.log(r1[0]&r2);

let l = [1,2,3,4];

function cl(l:number[]){
    l[0] = 11;
}


cl(l);
console.log(l)


console.log("===================测试Simulator==============");
let swNum:number = 2;
let hostNum:number = 2;
let forwardTime = 5;
let sim = new Simulator(swNum,forwardTime,hostNum); 



