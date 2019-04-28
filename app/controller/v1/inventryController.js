'use strict';

const Controller = require('egg').Controller;

class InventryController extends Controller {

  async index() {
    const indexRule = {
      timeType: {
        type: String, // year, month, day, all
        required: true,
      },
      time: {
        type: String,
        required: true,
      },
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
      goodsCode: {
        type: Number,
        required: false,
      },
      supplier: {
        type: String,
        required: false,
      },
      // 执行人 (退货人)
      execcutor: {
        type: String,
        required: false,
      },
    };
    const { ctx } = this;
    ctx.validate(indexRule, ctx.request.body);
    const res = ctx.service.v1.supplierService.index(ctx.request.body);
    const data = { isSuccess: res };
    if (res !== 0) {
      ctx.status = 200;
      ctx.helper.HandleData(ctx, 1, 'ok', data);
    } else {
      ctx.status = 400;
      ctx.helper.HandleData(ctx, 0, 'false', data);
    }
  }
}

module.exports = InventryController;
