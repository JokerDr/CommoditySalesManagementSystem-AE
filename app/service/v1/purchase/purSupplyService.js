'use strict';

const Service = require('egg').Service;
const moment = require('moment');
const InventryService = require('../inventry/inventryService');

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
      const res = PurchaseSupply.find(
        {
          supplier,
          curtYear: moment(supplyDate).year(),
          curtMonth: moment(supplyDate).month() + 1,
          curtDay: moment(supplyDate).date(),
        }
        // { _id: 0 }
      ).pupulate({
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
      // 拼接日期
      return res.map(item => {
        const { curtYear, curtMonth, curtDay, curtTime, ...rest } = item;
        return {
          ...rest,
          supplyDate: moment(
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
    const { Goods, PurchaseSupply } = ctx.model;
    const {
      goodsCategories,
      goodsName,
      specifications,
      goodsCode,
      supplyDate,
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
        purSupplyCumulative: 1,
        inventryCumulative: 1,
        purSyMyCumulative: 1,
        inventryMyCumulative: 1,
      });
      const goodsSave =
        !goodsfind && (await new Goods(goodsCondition).save());

      const {
        _id,
        purSupplyCumulative,


        inventryCumulative,
        purSyMyCumulative,
        inventryMyCumulative,
      } = goodsfind || goodsSave;
      const { supplyCount, totle } = res;

      // 创建订单后累计的进货数,累计库存数
      const purSupplyCurt = purSupplyCumulative + supplyCount;
      const restInventry = inventryCumulative + supplyCount;
      const purSyMyCurt = purSyMyCumulative + totle;
      const inventryMyCurt = inventryMyCumulative + totle;

      // 库存不足 或者 数量0
      if (supplyCount === 0 || restInventry < 0) {
        return 0;
      }
      // 更新goods的累计进货数,累计库存数
      const updateCumulativeV = async () =>
        await Goods.update(
          { _id },
          {
            purSupplyCumulative: purSupplyCurt,
            inventryCumulative: restInventry,
            purSyMyCumulative: purSyMyCurt,
            inventryMyCumulative: inventryMyCurt,
          }
        );

      // 新建库存操作记录
      const createInventryRecord = async () =>
        await InventryService.create({
          curtYear: moment(supplyDate).year(),
          curtMonth: moment(supplyDate).month() + 1,
          curtDay: moment(supplyDate).date(),
          curtTime: moment(supplyDate).format('HH:mm:ss'),
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
        // const {}
        // 创建采购出货记录
        await new PurchaseSupply({
          ...res,
          curtYear: moment(supplyDate).year(),
          curtMonth: moment(supplyDate).month() + 1,
          curtDay: moment(supplyDate).date(),
          curtTime: moment(supplyDate).format('HH:mm:ss'),
          purSupplyDateQuery: supplyCount,
          // supplyDate: moment(supplyDate).valueOf(),
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
    const { PurchaseSupply, Goods } = ctx.model;
    try {
      const {
        _id,
        goodsCategories,
        goodsName,
        specifications,
        goodsCode,
        supplyDate,
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
        purSupplyCumulative: 1,
        inventryCumulative: 1,
        purSyMyCumulative: 1,
        inventryMyCumulative: 1,
      });
      // 取出goods中准备操作的数据
      const {
        purSupplyCumulative,
        inventryCumulative,
        purSyMyCumulative,
        inventryMyCumulative,
      } = goodsfind;
      const { supplyCount, totle } = res;
      const _goodsId = goodsfind._id;
      // 取倒序记录的第一个， 最近的操作记录, 因为 更新操作是在有记录的情况才允许，所以取【0】
      // const oldRecord = await PurchaseSupply.find({ _id }, null, {sort: [['_id', -1]]})[0];
      const oldRecord = await PurchaseSupply.findById(_id);
      const oldTotle = oldRecord.totle;
      const oldSupplyCount = oldRecord.supplyCount;

      const absTotle = Math.abs(oldTotle - totle);
      const absSupplyCount = Math.abs(oldSupplyCount - supplyCount);

      const finalTotle = oldTotle > totle
        ? absTotle
        : -absTotle;

      const finalSupplyCount = oldSupplyCount > supplyCount
        ? absSupplyCount
        : -absSupplyCount;

      // update refer ~
      const purSupplyCurt = purSupplyCumulative + finalSupplyCount;
      const restInventry = inventryCumulative + finalSupplyCount;
      const purSyMyCurt = purSyMyCumulative + finalTotle;
      const inventryMyCurt = inventryMyCumulative + finalTotle;

      // 更新goods的累计退货数,累计库存数
      const updateCumulativeV = async () =>
        await Goods.update(
          { _goodsId },
          {
            purSupplyCumulative: purSupplyCurt,
            inventryCumulative: restInventry,
            purSyMyCumulative: purSyMyCurt,
            inventryMyCumulative: inventryMyCurt,
          }
        );
      const commonData = {
        curtYear: moment(supplyDate).year(),
        curtMonth: moment(supplyDate).month() + 1,
        curtDay: moment(supplyDate).date(),
        curtTime: moment(supplyDate).format('HH:mm:ss'),
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
        await new PurchaseSupply({
          ...res,
          curtYear: moment(supplyDate).year(),
          curtMonth: moment(supplyDate).month() + 1,
          curtDay: moment(supplyDate).date(),
          curtTime: moment(supplyDate).format('HH:mm:ss'),
          purSupplyDateQuery: supplyCount,
          // supplyDate: moment(supplyDate).valueOf(),
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
    const { PurchaseSupply, Goods } = ctx.model;
    try {
      let handles = [];
      params.forEach(async _id => {
        const oldRecord = await PurchaseSupply.findById(_id, { _id: 0 }).populate({
          path: '_goodsId', // 关联
          select: {
            _id: 0,
          }, // 去掉_id属性，选择name
        });
        const {
          _goodsId,
          supplyCount,
          totle,
          purSupplyCumulative,
          inventryCumulative,
          purSyMyCumulative,
          inventryMyCumulative,
        } = oldRecord;
        // 与创建相反
        const purSupplyCurt = purSupplyCumulative + supplyCount;
        const restInventry = inventryCumulative + supplyCount;
        const purSyMyCurt = purSyMyCumulative + totle;
        const inventryMyCurt = inventryMyCumulative + totle;

        // 更新goods的累计退货数,累计库存数
        const updateCumulativeV = async () =>
          await Goods.update(
            { _goodsId },
            {
              purSupplyCumulative: purSupplyCurt,
              inventryCumulative: restInventry,
              purSyMyCumulative: purSyMyCurt,
              inventryMyCumulative: inventryMyCurt,
            }
          );
        const commonData = {
          curtYear: moment().year(),
          curtMonth: moment().month() + 1,
          curtDay: moment().date(),
          curtTime: moment().format('HH:mm:ss'),
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
        handles = [ ...handles, updateCumulativeV, createInventryRecord ];
      });
      Promise.all(handles).then(() => PurchaseSupply.remove({ _id: { $in: [ ...params ] } }));
      return 1;
    } catch (e) {
      return 0;
    }

  }
}

module.exports = PurSupplyService;
