'use strict';

const { Controller } = require('egg');

class SupplierController extends Controller {
//   获得供应商目录
  async index() {
    const { ctx } = this;
    const res = await ctx.service.v1.personnel.supplierService.index();
    const data = { suppliers: res };
    if (res !== []) {
      ctx.status = 200;
      ctx.helper.HandleData(ctx, 1, 'ok', data);
    } else {
      ctx.status = 400;
      ctx.helper.HandleData(ctx, 0, 'false', res);
    }
  }

  // 新增记录
  async create() {
    const createRule = {
      name: {
        type: 'string',
        required: true,
      },
      // 联系人
      liner: {
        type: 'string',
        required: true,
      },
      companyName: {
        type: 'string',
        required: true,
      },
      phone: {
        type: 'number',
        required: true,
      },
      tel: {
        type: 'number',
        required: true,
      },
      email: {
        type: 'string',
        required: true,
      },
      fax: {
        type: 'number',
        required: true,
      },
      address: {
        type: 'string',
        required: true,
      },
      zip: {
        type: 'number',
        required: true,
      },
      sex: {
        type: 'string',
        required: true,
      },
      duties: {
        type: 'string',
        required: true,
      },
      qqWechat: {
        type: 'string',
        required: true,
      },
      netAddress: {
        type: 'string',
        required: true,
      },
      saleMan: {
        type: 'string',
        required: true,
      },
      note: {
        type: 'string',
        required: true,
      },
    };
    const { ctx } = this;
    ctx.validate(createRule, ctx.request.body);
    // const { ctx } = this;
    const params = ctx.request.body;
    const res = await ctx.service.v1.personnel.supplierService.create(params);
    const data = { isSuccess: Boolean(res) };
    if (res !== 0) {
      ctx.status = 200;
      ctx.helper.HandleData(ctx, 1, 'ok', data);
    } else {
      ctx.status = 400;
      ctx.helper.HandleData(ctx, 0, 'false', res);
    }
  }

  async show() {
    const showRule = {
      noCondition: {
        type: 'boolean',
        required: true,
      },
      condition: {
        type: 'number' || 'string',
        required: false,
      },
      tableConf: {
        type: 'object',
        required: false,
      },
    };
    const { ctx } = this;
    const params = !ctx.request.body.hasOwnProperty('tableConf')
      ? Object.assign(ctx.request.body, {
          tableConf: {
            current: 1,
            pageSize: 10,
          },
        })
      : ctx.request.body;
    ctx.validate(showRule, ctx.request.body);
    const res = ctx.service.v1.personnel.supplierService.show(params);
    const data = { isSuccess: res };
    if (res !== 0) {
      ctx.status = 200;
      ctx.helper.HandleData(ctx, 1, 'ok', data);
    } else {
      ctx.status = 400;
      ctx.helper.HandleData(ctx, 0, 'false', data);
    }
  }

  async update() {
    const updateRule = {
      name: {
        type: 'string',
        required: true,
      },
      // 联系人
      liner: {
        type: 'string',
        required: true,
      },
      companyName: {
        type: 'string',
        required: true,
      },
      phone: {
        type: 'number',
        required: true,
      },
      tel: {
        type: 'number',
        required: true,
      },
      email: {
        type: 'string',
        required: true,
      },
      fax: {
        type: 'number',
        required: true,
      },
      address: {
        type: 'string',
        required: true,
      },
      zip: {
        type: 'number',
        required: true,
      },
      sex: {
        type: 'string',
        required: true,
      },
      duties: {
        type: 'string',
        required: true,
      },
      qqWechat: {
        type: 'string',
        required: true,
      },
      netAddress: {
        type: 'string',
        required: true,
      },
      saleMan: {
        type: 'string',
        required: true,
      },
      note: {
        type: 'string',
        required: true,
      },
    };
    const { ctx } = this;
    ctx.validate(updateRule, ctx.request.body);
    const res = ctx.service.v1.personnel.supplierService.update(ctx.request.body);
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
    const res = ctx.service.v1.personnel.supplierService.destroy(ctx.request.body);
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

module.exports = SupplierController;
