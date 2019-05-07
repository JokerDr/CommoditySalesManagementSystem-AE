'use strict';

const Service = require('egg').Service;

class SupplierService extends Service {

  async index() {
    const { Supplier } = this.ctx.model;
    try {
      const res = await Supplier.find({}, { _id: 1, name: 1 });
      return res;
    } catch (e) {
      throw e;
    }
  }

  // 条件模糊搜索的结果
  async show(params) {
    const { noCondition, condition } = params;
    const { Supplier } = this.ctx.model;
    try {
      const Conditions = noCondition
        ? {}
        : {
          $or: {
            name: condition,
            liner: condition,
            companyName: condition,
            phone: condition,
            email: condition,
            qqWechat: condition,
            saleMan: condition,
          },
        };
      const doc = Supplier.find(Conditions);
      if (doc) {
        return doc;
      }
      return [];
    } catch (e) {
      return [];
    }
  }


  //   0: failed,
  //   1: SUCCESSED
  async create(params) {
    const { Supplier } = this.ctx.model;
    try {
      const {
        name,
        liner,
        companyName,
      } = params;
      const doc = await Supplier.findOne(
        { name, liner, companyName }
      );
      if (!doc) {
        const res = await new Supplier(params).save();
        if (res) { return 1; }
      }
      // 已经存在
      return 0;

    } catch (err) {
      return 0;
    }
  }

  // 更新供应商信息
  async update(params) {
    const { Supplier } = this.ctx.model;
    try {
      const { _id, ...res } = params;
      const result = await Supplier.update({ _id }, res);
      if (result.nModified === 1) {
        return 1;
      }
      return 0;
    } catch (e) {
      return 0;
    }
  }

  // 删除供应商
  async destroy(params) {

    const { ctx } = this;
    const { PurchaseShipment } = ctx.model;
    try {
      const res = PurchaseShipment.remove({ _id: { $in: [ ...params ] } });
      if (res.ok === params.length) {
        return 1;
      }
      return 0;
    } catch (e) {
      return 0;
    }

  }

}


module.exports = SupplierService;
