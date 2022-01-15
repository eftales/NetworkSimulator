import {Simulator} from "./simulator";

console.log("===================测试==============");

import {CRCCaler} from './crc';

let crcCaler:CRCCaler = new CRCCaler();

console.log(crcCaler.compute([0x48, 0x65, 0x6c, 0x6c, 0x6f, 0x20, 0x77, 0x6f, 0x72, 0x6c, 0x64, 0x21],[1,2]))
console.log("===================测试Simulator==============");
let swNum:number = 2;
let hostNum:number = 2;
let forwardTime = 5;
let sim = new Simulator(swNum,forwardTime,hostNum); 



