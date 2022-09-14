const { compose, route } = require("./dist/router");

const router = compose([
  // 全局中间件处理
  async (ctx, next) => {
    ctx.body = "Hello router!";
    await next();
  },
]);

module.exports = router;
