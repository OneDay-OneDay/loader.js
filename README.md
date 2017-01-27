# loader
符合AMD规范的简单模块化加载工具  
使用说明 ： 
1 在页面中引入loader.js
2 定义模块：
loader.define([ dependents ], function(  ){
    // your code
})
3 加载主模块：
loader.require([ dependents ], function(  ){
    // your code
})
