'use strict';

const {
  Controller,
} = require('egg');

class SessionController extends Controller {

  // 创建新的会话信息—— 登录
  async create() {
    const createRule = {
      userName: {
        type: 'string',
      },
      password: {
        type: 'string',
      },
      // captcha: {
      //   type: 'string',
      // },
    };
    // 验证参数
    const { ctx } = this;
    ctx.validate(createRule, ctx.request.body);
    // 創建登錄會話並進行校驗
    const data = await ctx.service.v1.sessionService.create(ctx.request);
    if (data) {
      ctx.status = 201;
      ctx.helper.HandleData(ctx, 1, 'login successfully', data);
    } else {
      ctx.status = 401;
      ctx.helper.HandleData(ctx, 0, 'message or password error', data);
    }
  }


  // 更改用户的密码
  async update() {
    const { ctx } = this;
    const updateRule = {
      oldPwd: {
        type: 'string',
      },
      newPwd: {
        type: 'string',
      },
    };
    ctx.validate(updateRule, ctx.request.body);
    ctx.request.headers.token;
    const params = {
      condition: ctx.state.tokenData,
      ...ctx.request.body,
    };
    const res = await ctx.service.v1.sessionService.update(params);
    if (res !== 0) {
      ctx.status = 201;
      ctx.helper.HandleData(ctx, 1, 'password changed successfully', { changedStatus: res });
    } else {
      ctx.status = 401;
      ctx.helper.HandleData(ctx, 0, 'password changed error', { changedStatus: res });
    }
  }

  // 销毁当前会话信息 —— 登出
  async destroy() {
    const { ctx } = this;
    const res = await ctx.service.v1.sessionService.destroy(ctx.state.tokenData);
    if (res !== 0) {
      ctx.status = 201;
      ctx.helper.HandleData(ctx, 1, 'logout successfully', { logoutStatus: res });
    } else {
      ctx.status = 401;
      ctx.helper.HandleData(ctx, 0, 'logout error', { logoutStatus: res });
    }
  }
}

module.exports = SessionController;
