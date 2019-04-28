'use strict';

module.exports = {
  /**
   * 调用正常情况的返回数据封装
   * @param {Object} ctx - context
   * @param {*} msg  - message
   * @param {*} data - 数据
   * @param {number} code - 0:失败|1:成功|2:未登录
   */

  HandleData(ctx, code, msg, data) {
    ctx.body = {
      code,
      msg,
      data: {
        ...data || data,
      },
    };
  },

  /**
   * 处理失败，处理传入的失败原因
   * @param {*} ctx - context
   * @param {Object} res - 返回的状态数据
   */

  fail(ctx, res) {
    ctx.body = {
      code: res.code,
      msg: res.msg,
      data: res.data,
    };
  },
};
