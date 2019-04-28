'use strict';

const Service = require('egg').Service;
const moment = require('moment');

class PurSupplyService extends Service {
  async index(params) {
    const { ctx } = this;
    const { PurchaseSupply } = ctx.model;
    try {
      const {
        supplier,
        supplyDate,
        goodsCategories,
        goodsName,
        goodsCode,
        specifications,
        tableConf,
      } = params;
      const { current, pageSize } = tableConf;
      const res = PurchaseSupply.find({ supplier, supplyDate }, { _id: 0 }).pupulate({
        path: '_goodsId', // 关联
        match: {
          goodsCategories,
          goodsName,
          specifications,
          goodsCode,
        }, // 条件
        select: {
          // _id: 0,
        }, // 去掉_id属性，选择name
        options: {
          page: current,
          limit: pageSize,
        }, // 分页
      });
      // 拼接日期
      return res;
    } catch (e) {
      return [];
    }
  }

  //   0: failed,
  //   1: SUCCESSED
  async create(params) {
    const { ctx } = this;
    const { Goods, PurchaseSupply } = ctx.model;
    const {
      goodsCategories,
      goodsName,
      specifications,
      goodsCode,
      ...res
    } = params;
    try {
      const goodsCondition = {
        goodsCategories,
        goodsName,
        specifications,
        goodsCode,
      };
      const goodsfind = await Goods.findOne(goodsCondition, { _id: 1 });
      const goodsSave = !goodsfind && await new Goods(goodsCondition).save();
      const _goodsId = (goodsfind && goodsfind._id) || (goodsSave && goodsSave._id);

      // 更新库存
      const { shipmentDate, supplyCount } = res;
      const InventryService = ctx.service.v1.InventryService;
      const inventryDoc = InventryService.show({ _goodsId });
      // 计算要更新的数量
      const restInventry = inventryDoc.inventryStatistics + supplyCount;

      // 没有这这条记录（没有采购进货记录）

      const changeInventry = async () => (!inventryDoc
        ? await new InventryService({
          _goodsId,
          inventryStatistics: restInventry,
        }).save()
        : await InventryService.update({
          _goodsId,
        }, {
          inventryStatistics: restInventry,
        }));

      const result = changeInventry();
      // 更新库存数据成功后
      if (result.ok || result) {
        // 创建采购进货记录
        await new PurchaseSupply({
          ...res,
          shipmentDate: moment(shipmentDate).valueOf(),
          _goodsId,
        }).save();
        return 1;
      }
      return 0;
    } catch (err) {
      return 0;
    }
  }

  async update(params) {
    const { ctx } = this;
    const { PurchaseSupply } = ctx.model;
    try {
      const { id, ...res } = params;
      const result = await PurchaseSupply.update({ _id: id }, res);
      if (result.nModified === 1) {
        return 1;
      }
      return 0;
    } catch (e) {
      return 0;
    }
  }

  async delete(params) {

    const { ctx } = this;
    const { PurchaseSupply } = ctx.model;
    try {
      const res = PurchaseSupply.remove({ _id: { $in: [ ...params ] } });
      if (res.ok === params.length) {
        return 1;
      }
      return 0;
    } catch (e) {
      return 0;
    }

  }
}

module.exports = PurSupplyService;
