# 网络仿真环境
```
cnpm i --dependies
cnpm run build
cnpm run start
```

用浏览器访问  http://localhost:8080/

## Notice
1. 为了避免时序混乱，交换机处理报文后，eventBus 需要睡眠 forwardTime 的时间后才能继续运行

2. 还没有搞清楚 渲染间隔(RenderGap)/转发时间(forwardTime)/发包时间(arrivalMiu)/包渲染耗时(RenderTime)/仿真速率 之间的关系

    最小时间的思想：最小的时间间隔为 20ms，包到达间隔、转发时间都必须是这个时间的整数倍？渲染时间可以小于这个时间，这样渲染就不会打乱逻辑时间。


