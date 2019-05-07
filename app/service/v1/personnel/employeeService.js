'use strict';

const Service = require('egg').Service;

class EmployeeService extends Service {
  async index() {
    const { UserPower } = this.ctx.model;
    try {
      const res = await UserPower.find({});
      return res;
    } catch (e) {
      return [];
    }
  }

  async create(params) {
    const { UserPower } = this.ctx.model;
    return new UserPower(params).save()
      .then(() => {
        return 1;
      })
      .catch(() => {
        return 0;
      });
  }

  async show(param) {
    const { _id } = param;
    const { UserPower } = this.ctx.model;
    try {
      const res = await UserPower.find({ _id }, { _id: 0 });
      return res;
    } catch (e) {
      return [];
    }
  }

  async update(params) {
    const { uid, ...res } = params;
    const { UserPower } = this.ctx.model;
    try {
      const effect = await UserPower.update({ _id: uid }, { ...res });
      if (effect.ok) {
        return 1;
      }
      return 0;
    } catch (e) {
      return 0;
    }
  }
}
module.exports = EmployeeService;
