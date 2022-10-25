'use strict';

const Service = require('egg').Service;
const moment = require('moment');

class HomeService extends Service {

  async sendMsg(data) {

    const { ctx, app } = this;

    const token = await this.getToken();

    const users = app.config.weChat.users;

    const promiseList = users.map(user => {
      data.touser = user;
      this.logger.info('开始发送消息:', data);
      return this.toWeChat(token, data);
    });

    const result = await Promise.all(promiseList);

    this.logger.info('发送消息结果:', result);

    return result;
  }

  // 发送每日提醒
  async sendDailyTips() {
    const data = await this.getMsgData();
    this.sendMsg(data);
  }

  // 喝水提醒
  async sendResetTips() {
    const { app } = this;
    const hours = moment().hour();
    if (hours < 9 || hours > 18) return;
    const data = {
      topcolor: '#FF0000',
      template_id: app.config.weChat.reset,
    };
    this.sendMsg(data);
  }

  // 通知微信接口
  async toWeChat(token, data) {
    // 模板消息接口文档
    const url = 'https://api.weixin.qq.com/cgi-bin/message/template/send?access_token=' + token;
    const result = await this.ctx.curl(url, {
      method: 'POST',
      data,
      dataType: 'json',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return result;
  }

  // 获取token
  async getToken() {
    const { app } = this;
    const url = 'https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=' + app.config.weChat.appId + '&secret=' + app.config.weChat.appSecret;
    const result = await this.ctx.curl(url, {
      method: 'get',
      dataType: 'json',
    });
    if (result.status === 200) {
      return result.data.access_token;
    }
  }

  // 获取data
  async getMsgData() {
    const { app } = this;

    // 纪念日模板 remainLoverDay == 0  love
    // 生日 模板 remainBirthday == 0  birthday
    // 正常模板                        daily

    const date = this.getDate();
    const oneSentence = await this.getOneSentence();
    const weather = await this.getWeather();
    const loveDay = this.getLoveDay();
    const loverYear = this.getLoveYear();
    const birthdayNum = this.getBirthdayNum();
    const remainBirthday = this.getRemainDay(app.config.time.birthday);
    const remainLoverDay = this.getRemainDay(app.config.time.love);

    const data = {
      topcolor: '#FF0000',
      data: {},
    };

    if (!remainBirthday) {
      data.template_id = app.config.weChat.birthday;
      data.data = {
        dateTime: {
          value: date,
          color: '#cc33cc',
        },
        birthdayYear: {
          value: birthdayNum,
          color: '#cc33cc',
        },
      };
    } else if (!remainLoverDay) {
      data.template_id = app.config.weChat.love;
      data.data = {
        dateTime: {
          value: date,
          color: '#cc33cc',
        },
        loveDay: {
          value: loveDay,
          color: '#ff3399',
        },
        loverYear: {
          value: loverYear,
          color: '#ff3399',
        },
      };
    } else {
      data.template_id = app.config.weChat.normal;
      data.data = {
        dateTime: {
          value: date,
          color: '#cc33cc',
        },
        oneSentence: {
          value: oneSentence,
          color: '#ff3399',
        },
        birthday: {
          value: remainBirthday,
          color: '#ff0033',
        },
        remainDay: {
          value: remainLoverDay,
          color: '#ff0033',
        },
        loveDay: {
          value: loveDay,
          color: '#ff0033',
        },
        wea: {
          value: weather.wea,
          color: '#33ff33',
        },
        tem: {
          value: weather.tem,
          color: '#0066ff',
        },
        airLevel: {
          value: weather.air_level,
          color: '#ff0033',
        },
        tem1: {
          value: weather.tem1,
          color: '#ff0000',
        },
        tem2: {
          value: weather.tem2,
          color: '#33ff33',
        },
        win: {
          value: weather.win,
          color: '#3399ff',
        },
        tips: {
          value: weather.air_tips,
          color: '#3399ff',
        },
      };
    }
    return data;
  }

  // 获取每日一句
  async getOneSentence() {
    const url = 'https://v1.hitokoto.cn/';
    const result = await this.ctx.curl(url, {
      method: 'get',
      dataType: 'json',
    });
    if (result && result.status === 200) {
      return result.data.hitokoto;
    }
    return '今日只有我最爱你！';
  }

  // 获取天气
  async getWeather(city = '北京') {
    const { app } = this;
    const url = 'https://www.tianqiapi.com/api?unescape=1&version=v6&appid=' + app.config.weather.appId + '&appsecret=' + app.config.weather.appSecret + '&city=' + city;
    const result = await this.ctx.curl(url, {
      method: 'get',
      dataType: 'json',
    });
    if (result && result.status === 200) {
      return result.data;
    }
    return {
      city,
      wea: '未知',
      tem: '未知',
      tem1: '未知',
      tem2: '未知',
      win: '未知',
      win_speed: '未知',
      air_level: '未知',
      air_tips: '未知',
    };
  }

  // 获取天数
  getLoveDay() {
    const { app } = this;
    const loveDay = app.config.time.love;
    return moment(moment().format('YYYY-MM-DD')).diff(loveDay, 'day');
  }

  // 获取年
  getLoveYear() {
    const { app } = this;
    const loveDay = app.config.time.love;
    return moment(moment().format('YYYY-MM-DD')).diff(loveDay, 'year');
  }

  // 获取第几个生日
  getBirthdayNum() {
    const { app } = this;
    const birthday = app.config.time.birthday;
    return moment(birthday).diff(moment(), 'year');
  }

  // 获取下次纪念日天数
  getRemainDay(date) {
    // 获取当前时间戳
    const now = moment(moment().format('YYYY-MM-DD')).valueOf();
    // 获取纪念日 月-日
    const mmdd = moment(date).format('-MM-DD');
    // 获取当年
    const y = moment().year();
    // 获取今年结婚纪念日时间戳
    const nowTimeNumber = moment(y + mmdd).valueOf();
    // 判断 今天的结婚纪念日 有没有过，如果已经过去（now>nowTimeNumber），resultMarry日期为明年的结婚纪念日
    // 如果还没到，则 结束日期为今年的结婚纪念日
    let resultDay = nowTimeNumber;
    if (now > nowTimeNumber) {
      // 获取明年纪念日
      resultDay = moment((y + 1) + mmdd).valueOf();
    }
    return moment(resultDay).diff(moment(), 'day');
  }

  // 获取日期
  getDate() {
    const weekDay = moment().weekday();
    const week = [ '星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六' ];
    return moment().format('YYYY年MM月DD日') + week[weekDay];
  }

}

module.exports = HomeService;
