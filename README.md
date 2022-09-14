

刚学js、ts，根据个人使用习惯改写了 simple-cloudbase-router
```
https://www.npmjs.com/package/simple-cloudbase-router
https://github.com/sonofmagic/simple-cloudbase-router
```

```javascript
// 云函数的 index.js
const app = require("./src/index");
const router = app.compose([
  // 全局中间件处理
  async (ctx, next) => {
    ctx.body = "Hello router!";
    await next();
  },
]);
exports.main = async (event, context) => {
  return await app.run(event, context,router);
};


```