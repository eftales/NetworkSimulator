import {Simulator} from "./simulator";

console.log("===================测试==============");

import {CRCCaler} from './crc';

let crcCaler:CRCCaler = new CRCCaler();

console.log(crcCaler.compute([0x48, 0x65, 0x6c, 0x6c, 0x6f, 0x20, 0x77, 0x6f, 0x72, 0x6c, 0x64, 0x21],[1,2]));



class Greeter {
    greeting: number;
    constructor(message: number) {
        this.greeting = message;
    }
    greet() {

        console.log(this.greeting);
        this.greeting += 1;
        setTimeout(this.greet.bind(this),5*100);
    }
}

let g1 = new Greeter(0);
// g1.greet();


import {Switch} from './switch';
import {Host} from './host';
import {Controller} from './controller';

// let con =  new Controller("c",[],[]);
// con.updateHostRandNum();

console.log("===================测试Simulator==============");

let sim = new Simulator(); 



