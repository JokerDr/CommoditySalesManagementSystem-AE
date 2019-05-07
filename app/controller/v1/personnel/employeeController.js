'use strict';

const { Controller } = require('egg');

class EmployeeController extends Controller {
  async index() {
    const { ctx } = this;
    const res = await ctx.service.v1.personnel.employeeService.index();
    const data = { list: res };
    if (res !== 0) {
      ctx.status = 200;
      ctx.helper.HandleData(ctx, 1, 'ok', data);
    } else {
      ctx.status = 400;
      ctx.helper.HandleData(ctx, 0, 'false', res);
    }
  }

  async update() {
    const udpateRule = {
      uid: {
        type: 'string',
        required: true,
      },
      purchase: {
        type: 'string',
        required: false,
      },
      sale: {
        type: 'string',
        required: false,
      },
      inventry: {
        type: 'string',
        required: false,
      },
      profit: {
        type: 'string',
        required: false,
      },
      personnel_Manage: {
        type: 'string',
        required: false,
      },
      day_sale_stats: {
        type: 'string',
        required: false,
      },
      month_sale_stats: {
        type: 'string',
        required: false,
      },
    };
    const { ctx } = this;
    ctx.validate(udpateRule, ctx.request.body);
    const res = await ctx.service.v1.personnel.employeeService.update(ctx.request.body);
    const data = { updateStatus: res };
    if (res !== 0) {
      ctx.status = 200;
      ctx.helper.HandleData(ctx, 1, 'ok', data);
    } else {
      ctx.status = 400;
      ctx.helper.HandleData(ctx, 0, 'false', res);
    }
  }
}

module.exports = EmployeeController;
