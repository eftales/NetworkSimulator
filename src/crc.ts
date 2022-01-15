import {CRC} from 'crc-full'

export class CRCCaler{
    crc16_arc:CRC =  CRC.default("CRC16_ARC") as CRC;
    public compute(checkData:number[],randNum:number[]):number{
        let crcData:number[] = [...checkData];
        for(let i=0;i<randNum.length;++i){
            crcData.push(randNum[i]);
        }
        return this.crc16_arc.compute(crcData).valueOf();
    }
}
