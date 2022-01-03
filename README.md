# 网络仿真环境
```
cnpm i --dependies
cnpm run build
cnpm run start
```

用浏览器访问  http://localhost:8080/

## Notice
为了避免时序混乱，交换机处理报文后，eventBus 需要睡眠 forwardTime 的时间后才能继续运行

