const path = require('path');
const HTMLWebpackPlugin = require('html-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

module.exports = {
    mode: 'development',
    // 入口文件
    entry: "./src/index.ts",
    
    // 打包文件所在的目录
    output:{
        path: path.resolve(__dirname,'dist'),
        filename: "bundle.js"
    },

    // webpack 打包时用使用的模块
    module:{
        // 指定loader规则
        rules:[{
            test: /\.ts$/,
            use: 'ts-loader',
            exclude: /node_modules/
        }]
    },
    plugins:[
        new CleanWebpackPlugin(),
        new HTMLWebpackPlugin({
            title:"Network Simulation",
            template:"./src/index.html"
        }),

    ],
    resolve:{
        extensions:['.ts','.js']
    }
};
