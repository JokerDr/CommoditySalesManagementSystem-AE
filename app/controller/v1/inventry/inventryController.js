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
      tableConf: {
        type: 'object',
        required: false,
      },
    };
    const { ctx } = this;
    ctx.validate(indexRule, ctx.request.body);
    const params = !ctx.request.body.hasOwnProperty('tableConf')
      ? Object.assign(ctx.request.body, {
        tableConf: {
          current: 1,
          pageSize: 10,
        },
      })
      : ctx.request.body;
    const res = ctx.service.v1.InventryController.index(params);
    const data = { list: res };
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
