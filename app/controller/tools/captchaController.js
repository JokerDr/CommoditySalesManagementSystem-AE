'use strict';

const { Controller } = require('egg');

class CaptchaController extends Controller {
  // 生成验证码
  async create() {
    const captchaData = await this.service.tools.captchaService.create();
    this.ctx.response.type = 'svg';
    this.ctx.status = 200;
    this.ctx.body = captchaData;
  }
  // 销毁session的验证码
  async destory() {
    this.ctx.session.capctcha = null;
  }
}

module.exports = CaptchaController;
