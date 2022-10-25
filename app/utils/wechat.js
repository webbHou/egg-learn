
'use strict';
console.log(333);
const { Wechaty } = require('wechaty');


console.log(Wechaty, 2222);

const bot = new Wechaty();

function init() {
  bot.on('scan', (qrcode, status) => console.log(`Scan QR Code to login: ${status}\nhttps://wechaty.js.org/qrcode/${encodeURIComponent(qrcode)}`));
  bot.on('login', login);
}

async function login(user) {
  this.logger.info(`${user}登录成功`);
  this.logger.info(`${user}开始发送消息`);
  await main();
  this.logger.info(`${user}发送消息成功`);
}

// 自动发消息功能
async function main() {
  const { ctx, app } = this;
  const name = app.config.wechat.NAME;
  const niceName = app.config.wechat.NICKNAME;
  const contact = await bot.Contact.find({ name: niceName }) || await bot.Contact.find({ alias: name }); // 获取你要发送的联系人
  const one = await ctx.service.home.getOneSentence(); // 获取每日一句
  const weather = await ctx.service.home.getWeather(); // 获取天气信息
  const today = await ctx.service.home.getDate();// 获取今天的日期
  const memorialDay = ctx.service.home.getLoveDay();// 获取纪念日天数
  const str = today + '<br>' + '今天是我们在一起的第' + memorialDay + '天'
            + '<br><br>今日天气早知道<br><br>' + weather.weatherTips + '<br><br>' + weather.todayWeather + '每日一句:<br><br>' + one + '<br><br>' + '------来自最爱你的我';
  await contact.say(str);// 发送消息
}


bot.start();


module.exports = init;
