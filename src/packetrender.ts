import { Simulator } from "./simulator";
import { Event } from "./eventbus";
import { CanvasTopo } from "./CanvasTopo";


export default class PacketRender{
    sim:Simulator;
    canvas:HTMLCanvasElement;
    ctx:CanvasRenderingContext2D;

    static MaxRenderStep = 10;
    static RenderTime = 1;
    static RenderGap = 10;

    static PacketHigh = 10;
    static PacketWidth = 10;


    constructor(sim:Simulator){
        this.sim = sim; // 在 sim 中获取设备的位置信息
        this.canvas = <HTMLCanvasElement> document.getElementById('packet'); // typecast
        this.ctx = this.canvas.getContext('2d')!; // ! 排除 null 和 undefined

        sim.emitter.on("PacketRender",this.render.bind(this));
    }


    public getCenterPoint(deviceID:string){
        let deviceObj = this.sim.getElement(deviceID);
        return [deviceObj.loc[0]+CanvasTopo.devicePlotSize[0]/2,deviceObj.loc[1]+CanvasTopo.devicePlotSize[1]/2];
    }


    public render(event:Event){
        // console.log("[DEBUG] Rendering...");
        if(event.frame.renderStep<0){
            // 填写 renderStep renderRate loc
            event.frame.loc = this.getCenterPoint(event.frame.preHandler);
            let dstLoc = this.getCenterPoint(event.frame.handler);
            event.frame.renderStep = 0;
            let renderDistenceX = dstLoc[0] - event.frame.loc[0];
            let renderDistenceY = dstLoc[1] - event.frame.loc[1];
            event.frame.renderRate = [renderDistenceX/PacketRender.MaxRenderStep,renderDistenceY/PacketRender.MaxRenderStep];
        }
        else if(event.frame.renderStep<PacketRender.MaxRenderStep){
            let safeRange = 5;
            this.ctx.clearRect(event.frame.loc[0]-safeRange,event.frame.loc[1]-safeRange,PacketRender.PacketWidth+2*safeRange,PacketRender.PacketHigh+2*safeRange);
            event.frame.loc[0] += event.frame.renderRate[0];
            event.frame.loc[1] += event.frame.renderRate[1];
            this.ctx.strokeRect(event.frame.loc[0],event.frame.loc[1],PacketRender.PacketWidth,PacketRender.PacketHigh);
            event.frame.renderStep += 1;
        }
        else{
            // 清除痕迹
            let safeRange = 5;
            this.ctx.clearRect(event.frame.loc[0]-safeRange,event.frame.loc[1]-safeRange,PacketRender.PacketWidth+2*safeRange,PacketRender.PacketHigh+2*safeRange);
            event.frame.renderStep += 1;
        }

        event.time += PacketRender.RenderTime; // TODO:这里的时间需要好好设置一下
        

        this.sim.emitter.emit("EventBusRecv",event);
    }

};