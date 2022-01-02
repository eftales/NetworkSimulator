import {EventEmitter} from "events";

export class EventBus{
    emitter:EventEmitter;
    toEventBus:string;

    constructor(emitter_:EventEmitter,toEventBus_:string){
        this.emitter = emitter_;
        this.toEventBus = toEventBus_;
    }

}
