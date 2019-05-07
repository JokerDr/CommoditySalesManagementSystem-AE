'use strict';

const { Controller } = require('egg');

class GoodsProfitController extends Controller {
  async index() {
    const { ctx } = this;
    const indexRule = {
      goodsCategories: {
        type: String,
        required: false,
      },
      goodsName: {
        type: String,
        required: false,
      },
      specifications: {
        type: String,
        required: false,
      },
      queryDate: {
        type: String,
        required: false,
      },
      goodsCode: {
        type: Number,
        required: false,
      },
      tableConf: {
        type: 'object',
        required: false,
      },
    };
    ctx.validate(indexRule, ctx.request.body);
    const res = await ctx.service.v1.profit.goodsProfitService.index(ctx.request.body);
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
module.exports = GoodsProfitController;
