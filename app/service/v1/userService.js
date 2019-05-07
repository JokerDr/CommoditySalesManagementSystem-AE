'use strict';

const Service = require('egg').Service;
const defaultPower = require('../../public/utils/defaultPower');
const userPower = require('./personnel/employeeService');

class UserService extends Service {

  // 获取当前登录的author的信息
  async show(params) {
    const { User } = this.ctx.model;
    const { _id } = params;
    try {
      const doc = await User.findOne({ _authorId: _id }, { _id: 0, __v: 0, _authorId: 0 });
      if (!doc) { return 0; }
      return doc;
    } catch (err) {
      throw err;
    }
  }

  // 注册用户
  // {
  //   0: 验证码校验失败,
  //   1: 注册成功，
  //   2: 已经注册过，
  // }
  async create(params) {
    const { User, Authorization } = this.ctx.model;
    // 1. captcha check
    // const isCaptcha = params.captcha === this.ctx.session.captchaCode;
    // if (!isCaptcha) { return 0; }

    // 查询是否已经注册
    const isRegister = await User.findOne({ email: params.email });
    if (!isRegister) {
      // 注册
      // 插入到 mongo中
      // const _now = Date.now();
      await new Authorization({
        email: params.email,
        password: params.password,
        // created_at: _now,
        // updated_at: _now,
        provider: 'local',
      }).save(async (err, doc) => {
        if (err) {
          console.log('------- Authrization 表插入失敗--------\n', err);
        }
        await new User(Object.assign(params, { _authorId: doc._id })).save(
          err => {
            if (err) {
              console.log('------- User 表插入失敗 表插入失敗--------\n', err);
            }
          }
        );
        await userPower.create(
          Object.assign(defaultPower, { _authorId: doc._id })
        );
      });
      return 1;
    }
    return 2;
  }
}

module.exports = UserService;
