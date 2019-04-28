'use strict';

const Service = require('egg').Service;
const moment = require('moment');

class PurShipmentService extends Service {

  async index(params) {
    const { ctx } = this;
    const { PurchaseShipment } = ctx.model;
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
      const res = PurchaseShipment.find({ supplier, supplyDate }, { _id: 0 }).pupulate({
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
      return res;
    } catch (e) {
      return [];
    }
  }

  //   0: failed,
  //   1: SUCCESSED
  async create(params) {
    const { ctx } = this;
    const { Goods, PurchaseShipment } = ctx.model;
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
      const { shipmentDate, shipmentCount } = res;
      const InventryService = ctx.service.v1.inventryService;
      const inventryDoc = await InventryService.show({ _goodsId });
      // 没有这这条记录（没有采购进货记录）
      if (!inventryDoc) {
        return 0;
      }
      // 计算要更新的数量
      const restInventry = inventryDoc.inventryStatistics - shipmentCount;
      // 库存不足
      if (restInventry <= 0) {
        return 0;
      }
      const effect = await InventryService.update({
        _goodsId,
      }, {
        inventryStatistics: restInventry,
      });
      // 更新库存数据成功后
      if (effect.ok) {

        // 创建采购出货记录
        await new PurchaseShipment({
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
    const { PurchaseShipment } = ctx.model;
    try {
      const { _id, ...res } = params;
      const result = await PurchaseShipment.update({ _id }, res);
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

module.exports = PurShipmentService;
