'use strict';

const { Controller } = require('egg');
class UserController extends Controller {

  // 获取 author的信息
  async show() {
    const { ctx, service } = this;
    const res = await service.v1.userService.show(ctx.state.tokenData);
    // 设置响应内容和响应状态码
    if (res) {
      ctx.status = 200;
      ctx.helper.HandleData(ctx, 1, 'ok', res._doc);
    } else {
      ctx.status = 400;
      ctx.helper.HandleData(ctx, 0, 'false', res);
    }
  }

  // 注册用户
  async create() {
    const createRule = {
      name: {
        type: 'string',
        required: true,
      },
      phone: {
        type: 'string',
        required: true,
      },
      email: {
        type: 'string',
        required: true,
      },
      address: {
        type: 'string',
        required: true,
      },
      password: {
        type: 'string',
        required: true,
      },
      // captcha: {
      //   type: 'string',
      // },
    };
    const { ctx, service } = this;
    ctx.validate(createRule, ctx.request.body);
    const res = await service.v1.userService.create(ctx.request.body);

    // 设置响应内容和响应状态码
    if (res === 1) {
      ctx.status = 201;
      ctx.helper.HandleData(ctx, 1, 'ok', { regStatus: res });
    } else {
      ctx.status = 400;
      ctx.helper.HandleData(ctx, 0, 'false', { regStatus: res });
    }
  }

  // // 更新指定用户信息
  // async update() {
  //   const updateRule = {};
  //   const { ctx, service } = this;
  //   ctx.validate(createRule, ctx.request.body);
  //   // const res = await service.v1.user.create(ctx.request.body);
  //   // ctx.body = { id: res.id };
  //   // ctx.status = 200;
  // }

  // // 注销指定用户信息
  // async destory() {
  //   const { ctx, service } = this;
  //   ctx.validate(createRule);
  //   // const res = await service.v1.user.create(ctx.request.body);
  //   // ctx.body = { id: res.id };
  //   // ctx.status = 200;
  // }
}

module.exports = UserController;
