'use strict';

const Service = require('egg').Service;
const moment = require('moment');
const InventryService = require('../inventry/inventryService');

class PurShipmentService extends Service {

  async index(params) {
    const { ctx } = this;
    const { PurchaseShipment } = ctx.model;
    try {
      const {
        supplier,
        shipmentDate,
        goodsCategories,
        goodsName,
        goodsCode,
        specifications,
        tableConf,
      } = params;
      const { current, pageSize } = tableConf;
      const res = PurchaseShipment.find({
        supplier,
        curtYear: moment(shipmentDate).year(),
        curtMonth: moment(shipmentDate).month() + 1,
        curtDay: moment(shipmentDate).date(),
      }).pupulate({
        path: '_goodsId', // 关联
        match: {
          goodsCategories,
          goodsName,
          specifications,
          goodsCode,
        }, // 条件
        select: {
          _id: 0,
        }, // 去掉_id属性，选择name
        options: {
          page: current,
          limit: pageSize,
        }, // 分页
      });
      return res.map(item => {
        const { curtYear, curtMonth, curtDay, curtTime, ...rest } = item;
        return {
          ...rest,
          shipmentDate: moment(
            `${curtYear}-${curtMonth}-${curtDay} ${curtTime}`
          ).format('YYYY-MM-DD HH:mm:ss'),
        };
      });

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
      shipmentDate,
      ...res
    } = params;
    try {
      const goodsCondition = {
        goodsCategories,
        goodsName,
        specifications,
        goodsCode,
      };
      const goodsfind = await Goods.findOne(goodsCondition, {
        _id: 1,
        purShipmentCumulative: 1,
        inventryCumulative: 1,
        purStMyCumulative: 1,
        inventryMyCumulative: 1,
      });
      const goodsSave = !goodsfind && await new Goods(goodsCondition).save();

      const {
        _id,
        purShipmentCumulative,
        inventryCumulative,
        purStMyCumulative,
        inventryMyCumulative,
      } = goodsfind || goodsSave;
      const { shipmentCount, totle } = res;

      // 创建订单后的 累计的退货数,累计退货金额，累计库存数,累计库存金额数, 累计利润
      const purShipmentCurt = purShipmentCumulative + shipmentCount;
      const restInventry = inventryCumulative - shipmentCount;
      const purStMyCurt = purStMyCumulative + totle;
      const inventryMyCurt = inventryMyCumulative - totle;

      // 库存不足 或者 数量0
      if (inventryCumulative === 0 || shipmentCount === 0 || restInventry < 0) {
        return 0;
      }

      // 更新goods的累计退货数,累计库存数
      const updateCumulativeV = async () =>
        await Goods.update(
          { _id },
          {
            purShipmentCumulative: purShipmentCurt,
            inventryCumulative: restInventry,
            purStMyCumulative: purStMyCurt,
            inventryMyCumulative: inventryMyCurt,
          }
        );
      // 新建库存操作记录
      const createInventryRecord = async () =>
        await InventryService.create({
          curtYear: moment(shipmentDate).year(),
          curtMonth: moment(shipmentDate).month() + 1,
          curtDay: moment(shipmentDate).date(),
          curtTime: moment(shipmentDate).format('HH:mm:ss'),
          inventryDateQuery: restInventry,
          referId: '',
          handleType: 'create',
          _goodsId: _id,
        });
      // 更新库存数据成功后
      return Promise.all([
        updateCumulativeV,
        createInventryRecord,
      ]).then(async () => {
        // 创建采购出货记录
        await new PurchaseShipment({
          ...res,
          curtYear: moment(shipmentDate).year(),
          curtMonth: moment(shipmentDate).month() + 1,
          curtDay: moment(shipmentDate).date(),
          curtTime: moment(shipmentDate).format('HH:mm:ss'),
          purShipmentDateQuery: shipmentCount,
          // shipmentDate: moment(shipmentDate).valueOf(),
          _goodsId: _id,
        }).save();
        return 1;
      });
    } catch (err) {
      return 0;
    }
  }

  async update(params) {
    const { ctx } = this;
    const { PurchaseShipment, Goods } = ctx.model;
    try {
      const {
        _id,
        goodsCategories,
        goodsName,
        specifications,
        goodsCode,
        shipmentDate,
        ...res
      } = params;

      const goodsCondition = {
        _id,
        goodsCategories,
        goodsName,
        specifications,
        goodsCode,
      };
      const goodsfind = await Goods.findOne(goodsCondition, {
        _id: 1,
        purShipmentCumulative: 1,
        inventryCumulative: 1,
        purStMyCumulative: 1,
        inventryMyCumulative: 1,
      });
      // 取出goods中准备操作的数据
      const {
        purShipmentCumulative,
        inventryCumulative,
        purStMyCumulative,
        inventryMyCumulative,
      } = goodsfind;
      const _goodsId = goodsfind._id;
      const { shipmentCount, totle } = res;

      // 取倒序记录的第一个， 最近的操作记录, 因为 更新操作是在有记录的情况才允许，所以取【0】
      // const oldRecord = await PurchaseShipment.find({ _id }, null, {sort: [['_id', -1]]})[0];
      const oldRecord = await PurchaseShipment.findById(_id);
      const oldTotle = oldRecord.totle;
      const oldShipmentCount = oldRecord.shipmentCount;

      const absTotle = Math.abs(oldTotle - totle);
      const absShipmentCount = Math.abs(oldShipmentCount - shipmentCount);

      const finalTotle = oldTotle > totle
        ? absTotle
        : -absTotle;

      const finalShipmentCount = oldShipmentCount > shipmentCount
        ? absShipmentCount
        : -absShipmentCount;

      // update refer ~
      const purShipmentCurt = purShipmentCumulative + finalShipmentCount;
      const restInventry = inventryCumulative + finalShipmentCount;
      const purStMyCurt = purStMyCumulative + finalTotle;
      const inventryMyCurt = inventryMyCumulative + finalTotle;

      // 更新goods的累计退货数,累计库存数
      const updateCumulativeV = async () =>
        await Goods.update(
          { _goodsId },
          {
            purShipmentCumulative: purShipmentCurt,
            inventryCumulative: restInventry,
            purStMyCumulative: purStMyCurt,
            inventryMyCumulative: inventryMyCurt,
          }
        );
      const commonData = {
        curtYear: moment(shipmentDate).year(),
        curtMonth: moment(shipmentDate).month() + 1,
        curtDay: moment(shipmentDate).date(),
        curtTime: moment(shipmentDate).format('HH:mm:ss'),
        referId: oldRecord._id,
        handleType: 'update',
        _goodsId,
      };
      // 新建库存操作记录
      const createInventryRecord = async () =>
        await InventryService.create({
          ...commonData,
          inventryDateQuery: restInventry,
        });

      // 更新库存数据成功后
      return Promise.all([
        updateCumulativeV,
        createInventryRecord,
      ]).then(async () => {
        // const {}
        // 创建采购出货记录
        await new PurchaseShipment({
          ...res,
          curtYear: moment(shipmentDate).year(),
          curtMonth: moment(shipmentDate).month() + 1,
          curtDay: moment(shipmentDate).date(),
          curtTime: moment(shipmentDate).format('HH:mm:ss'),
          purShipmentDateQuery: shipmentCount,
          // shipmentDate: moment(shipmentDate).valueOf(),
          _goodsId,
        }).save();
        return 1;
      });
    } catch (e) {
      return 0;
    }
  }

  async delete(params) {
    const { ctx } = this;
    const { PurchaseShipment, Goods } = ctx.model;
    try {
      let handles = [];
      params.forEach(async _id => {
        const oldRecord = await PurchaseShipment.findById(_id, { _id: 0 }).populate({
          path: '_goodsId', // 关联
          select: {
            _id: 0,
          }, // 去掉_id属性，选择name
        });
        const {
          _goodsId,
          shipmentCount,
          totle,
          purShipmentCumulative,
          inventryCumulative,
          purStMyCumulative,
          inventryMyCumulative,
        } = oldRecord;
        // 与创建相反
        const purShipmentCurt = purShipmentCumulative - shipmentCount;
        const restInventry = inventryCumulative + shipmentCount;
        const purStMyCurt = purStMyCumulative - totle;
        const inventryMyCurt = inventryMyCumulative + totle;

        // 更新goods的累计退货数,累计库存数
        const updateCumulativeV = async () =>
          await Goods.update(
            { _goodsId },
            {
              purShipmentCumulative: purShipmentCurt,
              inventryCumulative: restInventry,
              purStMyCumulative: purStMyCurt,
              inventryMyCumulative: inventryMyCurt,
            }
          );
        const commonData = {
          curtYear: moment().year(),
          curtMonth: moment().month() + 1,
          curtDay: moment().date(),
          curtTime: moment().format('HH:mm:ss'),
          referId: oldRecord._id,
          handleType: 'delete',
          _goodsId,
        };
        // 新建库存操作记录
        const createInventryRecord = async () =>
          await InventryService.create({
            ...commonData,
            inventryDateQuery: restInventry,
          });
        handles = [ ...handles, updateCumulativeV, createInventryRecord ];
      });
      Promise.all(handles).then(() => PurchaseShipment.remove({ _id: { $in: [ ...params ] } }));
      return 1;
    } catch (e) {
      return 0;
    }

  }
}

module.exports = PurShipmentService;
