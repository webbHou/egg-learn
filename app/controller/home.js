'use strict';

const Controller = require('egg').Controller;

class HomeController extends Controller {
  async index() {
    const { ctx } = this;

    const req = ctx.request.body;
    console.log(req, 777);
    ctx.body = 'hi, egg';
    // ctx.body = reply;
    // ctx.set('Content-Type', 'application/json');
  }

  async sendMsg() { // 主动触发
    const { ctx, app } = this;
    const reply = await ctx.service.sendMsg.sendMsg();
    ctx.logger.info('主动触发，发送模板消息 结果: %j', reply);
    ctx.body = reply;
    ctx.set('Content-Type', 'application/json');
  }
}

module.exports = HomeController;
