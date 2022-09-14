const app = require("./dist/router");
const router = require("./router");

exports.main = async (event, context) => {
  return await app.run(event, context);
  // return "Hello World";
};
