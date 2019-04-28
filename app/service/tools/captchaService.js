'use strict';

const Service = require('egg').Service;
const svgCaptcha = require('svg-captcha');


class CaptchaService extends Service {
  // 生成验证码
  async create() {
    this.destory();
    const capctcha = await svgCaptcha.create({
      size: 4, // size of random string
      ignoreChars: '0o1i', // filter out some characters like 0o1i
      noise: 1, // number of noise lines
      color: true, // characters will have distinct colors instead of grey, true if background option is set
      background: '#cc9966', // background color of the svg image
    });
    this.ctx.session.captchaCode = capctcha.text;
    return capctcha.data;
  }
  // 销毁session的验证码
  async destory() {
    delete this.ctx.session.captchaCode;
  }
}
module.exports = CaptchaService;

