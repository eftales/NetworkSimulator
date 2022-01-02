export class Frame{
    src:string;
    dst:string;
    dataLen:number;
    checkcode:number[] = [0x00,0x00];
    checkData:number[] = [];


    constructor( src:string, dst:string, randNum:number[],dataLen:number){
        this.src = src;
        this.dst = dst;
        this.dataLen = dataLen;


        

        // src|dst 不可能是交换机，而 host 又不会重名，所以用 hostID 代表 mac
        let mac = this.getMAC(dst);
        mac.forEach(element => {
            this.checkData.push(element);
        });
        mac = this.getMAC(src);
        mac.forEach(element => {
            this.checkData.push(element);
        });


        this.check(randNum);
        
    }

    private getMAC(deviceID:string){
        let mac:number[] = [];
        let index = deviceID.search("[0-9]");
        let id = deviceID.substring(index,deviceID.length);
        for(let i = 0;i<6;++i){
            if(i<id.length){
                mac.push(Number(id[i])); // 插入 0
            }
            else{
                mac.push(0); // 插入 0
            }
        }
        return mac;
    }

    public check(randNum:number[]){
        this.checkcode = [0x11,0x22];
    }

}
