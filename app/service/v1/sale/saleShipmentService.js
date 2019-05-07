'use strict';

const Service = require('egg').Service;
const moment = require('moment');
const InventryService = require('../inventry/inventryService');
const ProfitService = require('../profit/profitService');
const DPP = require('../../../public/utils/defaultProfitPercent');

class SaleShipmentService extends Service {
  async index(params) {
    const { ctx } = this;
    const { SaleShipment } = ctx.model;
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
      const res = SaleShipment.find(
        {
          supplier,
          curtYear: moment(shipmentDate).year(),
          curtMonth: moment(shipmentDate).month() + 1,
          curtDay: moment(shipmentDate).date(),
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
    const { Goods, SaleShipment, User } = ctx.model;
    const {
      goodsCategories,
      goodsName,
      specifications,
      goodsCode,
      shipmentDate,
      uData,
      ...res
    } = params;
    const uid = uData._id;
    const uname = await ctx.model.User.findOne(
      { _authorId: uid },
      { _id: 0, name: 1 }
    );

    try {
      const goodsCondition = {
        goodsCategories,
        goodsName,
        specifications,
        goodsCode,
      };
      const goodsfind = await Goods.findOne(goodsCondition, {
        _id: 1,
        saleShipmentCumulative: 1,
        inventryCumulative: 1,
        saleStMyCumulative: 1,
        inventryMyCumulative: 1,
        profitCumulative: 1,
      });
      const goodsSave = !goodsfind && await new Goods(goodsCondition).save();

      const {
        _id,
        saleShipmentCumulative,
        inventryCumulative,
        saleStMyCumulative,
        inventryMyCumulative,
        profitCumulative,
      } = goodsfind || goodsSave;
      const { shipmentCount, totle } = res;

      // 创建订单后累计的出货数,累计库存数
      const saleShipmentCurt = saleShipmentCumulative + shipmentCount;
      const restInventry = inventryCumulative - shipmentCount;
      const saleStMyCurt = saleStMyCumulative + totle;
      const inventryMyCurt = inventryMyCumulative - totle;
      const profitCurt = profitCumulative + totle;


      // 库存不足 或者 数量0
      if (inventryCumulative === 0 || shipmentCount === 0 || restInventry < 0) {
        return 0;
      }

      // 更新goods的累计退货数,累计库存数
      const updateCumulativeV = async () =>
        await Goods.update(
          { _id },
          {
            saleShipmentCumulative: saleShipmentCurt,
            inventryCumulative: restInventry,
            saleStMyCumulative: saleStMyCurt,
            inventryMyCumulative: inventryMyCurt,
            profitCumulative: profitCurt,
          }
        );

      const commonData = {
        curtYear: moment(shipmentDate).year(),
        curtMonth: moment(shipmentDate).month() + 1,
        curtDay: moment(shipmentDate).date(),
        curtTime: moment(shipmentDate).format('HH:mm:ss'),
        referId: '',
        handleType: 'create',
        _goodsId: _id,
      };

      // 新建库存操作记录
      const createInventryRecord = async () =>
        await InventryService.create({
          ...commonData,
          inventryDateQuery: restInventry,
        });
      const account_type = await ctx.model.Authorization.findById(uid, {
        account_type: 1,
        _id: 0,
      });

      const rate = DPP[account_type];

      const createEeprofit = async () => {
        await User.update({ _authorId: uid }, { eeProfit: totle * rate });
      };
      // 新建利润表操作记录
      const createProfitRecord = async () =>
        await ProfitService.create({
          ...commonData,
          execcutor: uname,
          eeProfit: totle * rate,
          profitDateQuery: totle,
        });

      // 更新库存数据成功后
      return Promise.all([
        updateCumulativeV,
        createInventryRecord,
        createProfitRecord,
        createEeprofit,
      ]).then(async () => {
        // const {}
        // 创建采购出货记录
        await new SaleShipment({
          ...res,
          curtYear: moment(shipmentDate).year(),
          curtMonth: moment(shipmentDate).month() + 1,
          curtDay: moment(shipmentDate).date(),
          curtTime: moment(shipmentDate).format('HH:mm:ss'),
          saleShipmentDateQuery: shipmentCount,
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
    const { SaleShipment, Goods, User } = ctx.model;
    try {
      const {
        _id,
        goodsCategories,
        goodsName,
        specifications,
        goodsCode,
        shipmentDate,
        uData,
        ...res
      } = params;
      const uid = uData._id;
      const uname = await ctx.model.User.findOne(
        { _authorId: uid },
        { _id: 0, name: 1 }
      );
      const goodsCondition = {
        _id,
        goodsCategories,
        goodsName,
        specifications,
        goodsCode,
      };

      const goodsfind = await Goods.findOne(goodsCondition, {
        _id: 1,
        saleShipmentCumulative: 1,
        inventryCumulative: 1,
        saleStMyCumulative: 1,
        inventryMyCumulative: 1,
        profitCumulative: 1,
      });
      // 取出goods中准备操作的数据
      const {
        saleShipmentCumulative,
        inventryCumulative,
        saleStMyCumulative,
        inventryMyCumulative,
        profitCumulative,
      } = goodsfind;
      const { shipmentCount, totle } = res;
      const _goodsId = goodsfind._id;
      // 取出已记录的利润
      const userDoc = User.findOne(
        { _authorId: uid },
        { eeProfit: 1, _id: 0 }
      );
      // 用户累计获得的提成
      const { eeProfit } = userDoc;
      const account_type = await ctx.model.Authorization.findById(uid, {
        account_type: 1,
        _id: 0,
      });
      const rate = DPP[account_type];
      // 取倒序记录的第一个， 最近的操作记录, 因为 更新操作是在有记录的情况才允许，所以取【0】
      // const oldRecord = await SaleShipment.find({ _id }, null, {sort: [['_id', -1]]})[0];
      const oldRecord = await SaleShipment.findById(_id);
      const oldTotle = oldRecord.totle;
      const oldShipmentCount = oldRecord.shipmentCount;
      // const oldEeprofit = oldRecord.eeProfit;
      const absTotle = Math.abs(oldTotle - totle);
      const absShipmentCount = Math.abs(oldShipmentCount - shipmentCount);
      const absEeprofit = Math.abs(eeProfit - totle * rate);
      const finalTotle = oldTotle > totle
        ? absTotle
        : -absTotle;

      const finalShipmentCount = oldShipmentCount > shipmentCount
        ? absShipmentCount
        : -absShipmentCount;
      const finalEeprofit =
        eeProfit > totle * rate ? -absEeprofit : absEeprofit;
      // update refer ~finalEeprofit
      const saleShipmentCurt = saleShipmentCumulative + finalShipmentCount;
      const restInventry = inventryCumulative + finalShipmentCount;
      const saleStMyCurt = saleStMyCumulative + finalTotle;
      const inventryMyCurt = inventryMyCumulative + finalTotle;
      const profitCurt = profitCumulative + finalTotle;

      // 更新goods的累计退货数,累计库存数
      const updateCumulativeV = async () =>
        await Goods.update(
          { _goodsId },
          {
            saleShipmentCumulative: saleShipmentCurt,
            inventryCumulative: restInventry,
            saleStMyCumulative: saleStMyCurt,
            inventryMyCumulative: inventryMyCurt,
            profitCumulative: profitCurt,
          }
        );
      const commonData = {
        curtYear: moment(shipmentDate).year(),
        curtMonth: moment(shipmentDate).month() + 1,
        curtDay: moment(shipmentDate).date(),
        curtTime: moment(shipmentDate).format('HH:mm:ss'),
        referId: oldRecord._goodsId,
        handleType: 'update',
        _goodsId,
      };
      // 更新员工所获得的的提成
      const updateEeprofit = async () => {
        await User.update(
          { _authorId: uid },
          { eeProfit: finalEeprofit }
        );
      };
      // 新建库存操作记录
      const createInventryRecord = async () =>
        await InventryService.create({
          ...commonData,
          inventryDateQuery: restInventry,
        });

      // 新建利润表操作记录
      const createProfitRecord = async () =>
        await ProfitService.create({
          ...commonData,
          execcutor: uname,
          eeProfit: totle * rate,
          profitDateQuery: totle,
        });

      // 更新库存数据成功后
      return Promise.all([
        updateCumulativeV,
        createInventryRecord,
        createProfitRecord,
        updateEeprofit,
      ]).then(async () => {
        // const {}
        // 创建采购出货记录
        await new SaleShipment({
          ...res,
          curtYear: moment(shipmentDate).year(),
          curtMonth: moment(shipmentDate).month() + 1,
          curtDay: moment(shipmentDate).date(),
          curtTime: moment(shipmentDate).format('HH:mm:ss'),
          saleShipmentDateQuery: shipmentCount,
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
    const { SaleShipment, Goods, User } = ctx.model;
    try {
      const { idArr, uid } = params;
      const uname = await ctx.model.User.findOne(
        { _authorId: uid },
        { _id: 0, name: 1 }
      );
      let handles = [];
      idArr.forEach(async _id => {
        const oldRecord = await SaleShipment.findById(_id, { _id: 0 }).populate({
          path: '_goodsId', // 关联
          select: {
            _id: 0,
          }, // 去掉_id属性，选择name
        });
        const {
          _goodsId,
          shipmentCount,
          totle,
          saleShipmentCumulative,
          inventryCumulative,
          saleStMyCumulative,
          inventryMyCumulative,
          profitCumulative,
        } = oldRecord;
        // 与创建相反
        const saleShipmentCurt = saleShipmentCumulative + shipmentCount;
        const restInventry = inventryCumulative + shipmentCount;
        const saleStMyCurt = saleStMyCumulative + totle;
        const inventryMyCurt = inventryMyCumulative + totle;
        const profitCurt = profitCumulative - totle;

        // 更新goods的累计退货数,累计库存数
        const updateCumulativeV = async () =>
          await Goods.update(
            { _goodsId },
            {
              saleShipmentCumulative: saleShipmentCurt,
              inventryCumulative: restInventry,
              saleStMyCumulative: saleStMyCurt,
              inventryMyCumulative: inventryMyCurt,
              profitCumulative: profitCurt,
            }
          );
          // 更新员工所获得的的提成
        const oldUserRecord = await User.findOne({ _authorId: uid }, { _id: 0, eeProfit: 1 });
        const newUserEeProfit = oldUserRecord.eeProfit - totle;
        const updateEeprofit = async () => {
          await User.update(
            { _authorId: uid },
            { eeProfit: newUserEeProfit }
          );
        };
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

        // 新建利润表操作记录
        const createProfitRecord = async () =>
          await ProfitService.create({
            ...commonData,
            execcutor: uname,
            eeProfit: 0,
            profitDateQuery: totle,
          });

        handles = [
          ...handles,
          updateCumulativeV,
          createInventryRecord,
          createProfitRecord,
          updateEeprofit,
        ];
      });
      Promise.all(handles).then(() => SaleShipment.remove({ _id: { $in: [ ...params ] } }));
      return 1;
    } catch (e) {
      return 0;
    }

  }
}

module.exports = SaleShipmentService;
