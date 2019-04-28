'use strict';

const Controller = require('egg').Controller;

class SaleSupplyController extends Controller {
   // 表单搜索， 返回搜索数据
  async index() {
    const indexRule = {
      goodsCategories: {
        type: 'string',
        required: false,
      },
      goodsName: {
        type: 'string',
        required: false,
      },
      specifications: {
        type: 'string',
        required: false,
      },
      goodsCode: {
        type: 'string',
        required: false,
      },
      supplier: {
        type: 'string',
        required: false,
      },
      supplyDate: {
        type: 'string',
        required: false,
      },
      tableConf: {
        type: 'object',
        required: false,
      },
    };
    const { ctx } = this;
    ctx.validate(indexRule, ctx.request.body);
    const params = !ctx.request.body.tableConf
      ? Object.assign(ctx.request.body, {
        tableConf: {
          current: 1,
          pageSize: 10,
        },
      })
      : ctx.request.body;
    const res = ctx.service.v1.saleSupplyService.index(params);
    const data = { list: res };
    if (res !== []) {
      ctx.status = 200;
      ctx.helper.HandleData(ctx, 1, 'ok', data);
    } else {
      ctx.status = 400;
      ctx.helper.HandleData(ctx, 0, 'false', data);
    }
  }
  // 新增记录
  async create() {
    const createRule = {
      id: {
        type: 'string',
        required: true,
      },
      goodsCategories: {
        type: 'string',
      },
      goodsName: {
        type: 'string',
      },
      specifications: {
        type: 'string',
      },
      goodsCode: {
        type: 'string',
      },
      supplyCount: {
        type: 'number',
      },
      supplyPrice: {
        type: 'number',
      },
      totle: {
        type: 'number',
      },
      paid: {
        type: 'number',
      },
      notPaid: {
        type: 'number',
      },
      supplier: {
        type: 'string',
      },
      supplyDate: {
        type: 'string',
      },
      Execcutor: {
        type: 'string',
      },
      Note: {
        type: 'string',
        required: false,
      },
    };
    const { ctx } = this;
    ctx.validate(createRule, ctx.request.body);
    // const { ctx } = this;
    const params = ctx.request.body;
    const res = await ctx.service.v1.saleSupplyService.create(params);
    const data = { isSuccess: Boolean(res) };
    if (res !== 0) {
      ctx.status = 200;
      ctx.helper.HandleData(ctx, 1, 'ok', data);
    } else {
      ctx.status = 400;
      ctx.helper.HandleData(ctx, 0, 'false', res);
    }
  }
  async update() {
    const updateRule = {
      goodsCategories: {
        type: 'string',
      },
      goodsName: {
        type: 'string',
      },
      specifications: {
        type: 'string',
      },
      goodsCode: {
        type: 'string',
      },
      supplyCount: {
        type: 'number',
      },
      supplyPrice: {
        type: 'number',
      },
      totle: {
        type: 'number',
      },
      paid: {
        type: 'number',
      },
      notPaid: {
        type: 'number',
      },
      supplier: {
        type: 'string',
      },
      supplyDate: {
        type: 'string',
      },
      Execcutor: {
        type: 'string',
      },
      Note: {
        type: 'string',
        required: false,
      },
    };
    const { ctx } = this;
    ctx.validate(updateRule, ctx.request.body);
    const res = ctx.service.v1.saleSupplyService.update(ctx.request.body);
    const data = { isSuccess: res };
    if (res !== 0) {
      ctx.status = 200;
      ctx.helper.HandleData(ctx, 1, 'ok', data);
    } else {
      ctx.status = 400;
      ctx.helper.HandleData(ctx, 0, 'false', data);
    }
  }

  async destroy() {
    const destroyRule = {
      idArr: {
        type: 'object',
      },
    };
    const { ctx } = this;
    ctx.validate(destroyRule, ctx.request.body);
    const res = ctx.service.v1.saleSupplyService.destroy(ctx.request.body);
    const data = { isSuccess: Boolean(res) };
    if (res === 1) {
      ctx.status = 201;
      ctx.helper.HandleData(ctx, 1, 'ok', data);
    } else {
      ctx.status = 400;
      ctx.helper.HandleData(ctx, 0, 'failed', data);
    }
  }
}

module.exports = SaleSupplyController;
