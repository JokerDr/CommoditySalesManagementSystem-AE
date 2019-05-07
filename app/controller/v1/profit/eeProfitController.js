'use strict';

const { Controller } = require('egg');

class EeProfitController extends Controller {
  async index() {
    const { ctx } = this;
    const indexRule = {
      employee: {
        type: String,
        required: false,
      },
      tableConf: {
        type: 'object',
        required: false,
      },
    };
    ctx.validate(indexRule, ctx.request.body);
    const res = await ctx.service.v1.profit.eeProfitService.index(ctx.request.body);
    const data = { list: res };
    if (res !== []) {
      ctx.status = 200;
      ctx.helper.HandleData(ctx, 1, 'ok', data);
    } else {
      ctx.status = 400;
      ctx.helper.HandleData(ctx, 0, 'false', res);
    }
  }
}
module.exports = EeProfitController;
