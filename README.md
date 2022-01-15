# 网络仿真环境
```
cnpm i --dependies
cnpm run build
cnpm run start
```

用浏览器访问  http://localhost:8080/

## Notice
1. 参数建议

    debug: 
    Simulator.arrivalMiu = 1000 或更高
    PacketRender.RenderTime = 100 或更高

    run:
    Simulator.arrivalMiu = 100 或更低
    PacketRender.RenderTime = 10 或更低
