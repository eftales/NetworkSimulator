import {deviceTypes, Simulator} from './simulator';


export class CanvasTopo{
    sim:Simulator;
    canvas:HTMLCanvasElement;
    ctx:CanvasRenderingContext2D;
    devicePlotSize=[100,100];


    curDeviceType:deviceTypes = deviceTypes.typeSwitch;


    beginX:number=0;
    beginY:number=0;

    constructor(sim:Simulator){
        this.sim = sim; // 为 Simulator 添加节点
        this.canvas = <HTMLCanvasElement> document.getElementById('canvas'); // typecast
        this.ctx = this.canvas.getContext('2d')!; // ! 排除 null 和 undefined
        
        this.canvas.addEventListener('mousedown', this.mousedownHandler.bind(this))
        this.canvas.addEventListener('mouseup', this.mouseupHandler.bind(this));

        // 切换绘制类型
        document.getElementById("switchButton")!.onclick = this.turn2Switch.bind(this);
        document.getElementById("hostButton")!.onclick = this.turn2Host.bind(this);
        document.getElementById("lineButton")!.onclick = this.turn2Line.bind(this);


    }

    public turn2Switch(){
        this.curDeviceType = deviceTypes.typeSwitch;
    }

    public turn2Host(){
        this.curDeviceType = deviceTypes.typeHost;
    }

    public turn2Line(){
        this.curDeviceType = deviceTypes.typeLine;
    }


    private mousedownHandler(e:any){
        this.beginX = e.clientX;
        this.beginY = e.clientY;

        // 将网页绝对坐标改为 canvas 内坐标
        let cavsRect = this.canvas.getBoundingClientRect();
        this.beginX -= cavsRect.left * (this.canvas.width/cavsRect.width);
        this.beginY -= cavsRect.top * (this.canvas.height/cavsRect.height);

    }

    private mouseupHandler(e:any){
        let endX = e.clientX;
        let endY = e.clientY;

        // 将网页绝对坐标改为 canvas 内坐标
        let cavsRect = this.canvas.getBoundingClientRect();
        endX -= cavsRect.left * (this.canvas.width/cavsRect.width);
        endY -= cavsRect.top * (this.canvas.height/cavsRect.height);


        switch(this.curDeviceType){
            case deviceTypes.typeLine:
                this.makeLink(endX,endY);
                break;

            case deviceTypes.typeHost:
            case deviceTypes.typeSwitch:
                this.plotDevice(endX,endY);
                break;

        }

    }


    public dotMulti(x:number,y:number){
        return x*y ; // 输入是叉乘后的结果，所以一维就够了
    }

    public crossMulti(x:number[],y:number[]){
        return x[0]*y[1] - x[1]*y[0]; // 叉乘本质上是向量，但是因为二维向量叉乘之后原先的两维会变成0，所以显得和 1 维一样
    }

    public getVector(start:number[],end:number[]){
        return [end[0]-start[0],end[1]-start[1]];

    }

    public inOneRect(X:number,Y:number){
        // console.log("======X,Y===",X,Y)
        // 算法参考 https://www.cnblogs.com/fangsmile/p/9306510.html
        for(let i=0;i<this.sim.swLists.length;++i){
            let A = this.sim.swLists[i].loc, B = [A[0]+this.devicePlotSize[0],A[1]],
                 C = [A[0]+this.devicePlotSize[0],A[1]+this.devicePlotSize[1]],
                 D = [A[0],A[1]+this.devicePlotSize[1]],
                 E = [X,Y];
            let AB = this.getVector(A,B),AE=this.getVector(A,E),
                CD=this.getVector(C,D),CE=this.getVector(C,E);
            

            let DA = this.getVector(D,A),DE=this.getVector(D,E),
                BC=this.getVector(B,C),BE=this.getVector(B,E);

            if (this.dotMulti(this.crossMulti(AB,AE), this.crossMulti(CD,CE)) >= 0 &&
                 this.dotMulti(this.crossMulti(DA,DE), this.crossMulti(BC,BE)) >= 0 ){
                     return [deviceTypes.typeSwitch,this.sim.swLists[i].deviceName];
                 }
        }

        for(let i=0;i<this.sim.hostLists.length;++i){
            // console.log(this.sim.hostLists[i]);

            let A = this.sim.hostLists[i].loc, B = [A[0]+this.devicePlotSize[0],A[1]],
                 C = [A[0]+this.devicePlotSize[0],A[1]+this.devicePlotSize[1]],
                 D = [A[0],A[1]+this.devicePlotSize[1]],
                 E = [X,Y];
            let AB = this.getVector(A,B),AE=this.getVector(A,E),
                CD=this.getVector(C,D),CE=this.getVector(C,E);
            

            let DA = this.getVector(D,A),DE=this.getVector(D,E),
                BC=this.getVector(B,C),BE=this.getVector(B,E);

            if (this.dotMulti(this.crossMulti(AB,AE), this.crossMulti(CD,CE)) >= 0 &&
                 this.dotMulti(this.crossMulti(DA,DE), this.crossMulti(BC,BE)) >= 0 ){
                     return [deviceTypes.typeHost,this.sim.hostLists[i].deviceName];
                 }
        }
        return [];
    }

    public makeLink(endX:number,endY:number){

        let deviceMSG1 =  this.inOneRect(this.beginX,this.beginY),deviceMSG2 =  this.inOneRect(endX,endY);
        if(deviceMSG1.length !== 0 && deviceMSG2.length !== 0){
            this.ctx.beginPath();
            this.ctx.moveTo(this.beginX, this.beginY);
            this.ctx.lineTo(endX, endY);
            this.ctx.closePath();
            this.ctx.stroke();
            this.sim.link(deviceMSG1[1],deviceMSG2[1]);

        }
        else{
            alert("线的两端必须是两个设备");
        }

    }

    public plotDevice(X:number,Y:number){
        let deviceName:string=this.curDeviceType;
        switch (this.curDeviceType){
            case deviceTypes.typeHost:
                deviceName += this.sim.hostNum;
                this.sim.addHost(X,Y);
                this.sim.hostNum += 1;
                break;

            case deviceTypes.typeSwitch:
                deviceName += this.sim.swNum;
                this.sim.addSwitch(X,Y);
                this.sim.swNum += 1;
                break;
        }

        this.ctx.strokeRect(X, Y, this.devicePlotSize[0], this.devicePlotSize[1]);
        this.ctx.font="30px Verdana";
        this.ctx.fillText(deviceName,X+this.devicePlotSize[0]/5,Y+this.devicePlotSize[1]/2);
    }


};
