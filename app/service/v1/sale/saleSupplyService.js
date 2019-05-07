'use strict';

const Service = require('egg').Service;
const moment = require('moment');
const InventryService = require('../inventry/inventryService');
const ProfitService = require('../profit/profitService');

class SaleSupplyService extends Service {

  async index(params) {
    const { ctx } = this;
    const { SaleSupply } = ctx.model;
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
      const res = SaleSupply.find(
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
      return res.map(item => {
        const { curtYear, curtMonth, curtDay, curtTime, ...rest } = item;
        return {
          ...rest,
          saleDate: moment(
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
    const { Goods, SaleSupply } = ctx.model;
    const {
      goodsCategories,
      goodsName,
      specifications,
      goodsCode,
      saleDate,
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
        saleSupplyCumulative: 1,
        inventryCumulative: 1,
      });
      const goodsSave = !goodsfind && await new Goods(goodsCondition).save();

      const {
        _id,
        saleSupplyCumulative,
        inventryCumulative,
        saleSyMyCumulative,
        inventryMyCumulative,
        profitCumulative,
      } = goodsfind || goodsSave;
      const { supplyCount, totle } = res;

      // 创建订单后累计的退货数,累计库存数
      const saleSupplyCurt = saleSupplyCumulative + supplyCount;
      const restInventry = inventryCumulative + supplyCount;
      const saleSyMyCurt = saleSyMyCumulative + totle;
      const inventryMyCurt = inventryMyCumulative + totle;
      const profitCurt = profitCumulative - totle;


      // 库存不足 或者 数量0
      if (inventryCumulative === 0 || supplyCount === 0 || restInventry < 0) {
        return 0;
      }

      // 更新goods的累计退货数,累计库存数
      const updateCumulativeV = async () =>
        await Goods.update(
          { _id },
          {
            saleSupplyCumulative: saleSupplyCurt,
            inventryCumulative: restInventry,
            saleSyMyCumulative: saleSyMyCurt,
            inventryMyCumulative: inventryMyCurt,
            profitCumulative: profitCurt,
          }
        );

      const commonData = {
        curtYear: moment(saleDate).year(),
        curtMonth: moment(saleDate).month() + 1,
        curtDay: moment(saleDate).date(),
        curtTime: moment(saleDate).format('HH:mm:ss'),
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

      // 新建利润表操作记录
      const createProfitRecord = async () =>
        await ProfitService.create({
          ...commonData,
          execcutor: uname,
          profitDateQuery: totle,
        });


      // 更新库存数据成功后
      return Promise.all([
        updateCumulativeV,
        createInventryRecord,
        createProfitRecord,
      ]).then(async () => {
        // const {}
        // 创建销售退货记录
        await new SaleSupply({
          ...res,
          curtYear: moment(saleDate).year(),
          curtMonth: moment(saleDate).month() + 1,
          curtDay: moment(saleDate).date(),
          curtTime: moment(saleDate).format('HH:mm:ss'),
          saleSupplyDateQuery: supplyCount,
          // saleDate: moment(saleDate).valueOf(),
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
    const { SaleSupply, Goods } = ctx.model;
    try {
      const {
        _id,
        goodsCategories,
        goodsName,
        specifications,
        goodsCode,
        supplyDate,
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
        saleSupplyCumulative: 1,
        inventryCumulative: 1,
        saleSyMyCumulative: 1,
        inventryMyCumulative: 1,
        profitCumulative: 1,
      });
      // 取出goods中准备操作的数据
      const {
        saleSupplyCumulative,
        inventryCumulative,
        saleSyMyCumulative,
        inventryMyCumulative,
        profitCumulative,
      } = goodsfind;
      const { supplyCount, totle } = res;
      const _goodsId = goodsfind._id;
      // 取倒序记录的第一个， 最近的操作记录, 因为 更新操作是在有记录的情况才允许，所以取【0】
      // const oldRecord = await SaleSupply.find({ _id }, null, {sort: [['_id', -1]]})[0];
      const oldRecord = await SaleSupply.findById(_id);
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
      const saleSupplyCurt = saleSupplyCumulative + finalSupplyCount;
      const restInventry = inventryCumulative + finalSupplyCount;
      const saleSyMyCurt = saleSyMyCumulative + finalTotle;
      const inventryMyCurt = inventryMyCumulative + finalTotle;
      const profitCurt = profitCumulative + finalTotle;

      // 更新goods的累计退货数,累计库存数
      const updateCumulativeV = async () =>
        await Goods.update(
          { _goodsId },
          {
            saleSupplyCumulative: saleSupplyCurt,
            inventryCumulative: restInventry,
            saleSyMyCumulative: saleSyMyCurt,
            inventryMyCumulative: inventryMyCurt,
            profitCumulative: profitCurt,
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
          execcutor: uname,
          inventryDateQuery: restInventry,
        });

      // 新建利润表操作记录
      const createProfitRecord = async () =>
        await ProfitService.create({
          ...commonData,
          profitDateQuery: totle,
        });

      // 更新库存数据成功后
      return Promise.all([
        updateCumulativeV,
        createInventryRecord,
        createProfitRecord,
      ]).then(async () => {
        // const {}
        // 创建采购出货记录
        await new SaleSupply({
          ...res,
          curtYear: moment(supplyDate).year(),
          curtMonth: moment(supplyDate).month() + 1,
          curtDay: moment(supplyDate).date(),
          curtTime: moment(supplyDate).format('HH:mm:ss'),
          saleSupplyDateQuery: supplyCount,
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
    const { SaleSupply, Goods } = ctx.model;
    try {
      const { idArr, uid } = params;
      const uname = await ctx.model.User.findOne(
        { _authorId: uid },
        { _id: 0, name: 1 }
      );
      let handles = [];
      idArr.forEach(async _id => {
        const oldRecord = await SaleSupply.findById(_id, { _id: 0 }).populate({
          path: '_goodsId', // 关联
          select: {
            _id: 0,
          }, // 去掉_id属性，选择name
        });
        const {
          _goodsId,
          supplyCount,
          totle,
          saleSupplyCumulative,
          inventryCumulative,
          saleSyMyCumulative,
          inventryMyCumulative,
          profitCumulative,
        } = oldRecord;
        // 与创建相反
        const saleSupplyCurt = saleSupplyCumulative + supplyCount;
        const restInventry = inventryCumulative + supplyCount;
        const saleSyMyCurt = saleSyMyCumulative + totle;
        const inventryMyCurt = inventryMyCumulative + totle;
        const profitCurt = profitCumulative - totle;

        // 更新goods的累计退货数,累计库存数
        const updateCumulativeV = async () =>
          await Goods.update(
            { _goodsId },
            {
              saleSupplyCumulative: saleSupplyCurt,
              inventryCumulative: restInventry,
              saleSyMyCumulative: saleSyMyCurt,
              inventryMyCumulative: inventryMyCurt,
              profitCumulative: profitCurt,
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

        // 新建利润表操作记录
        const createProfitRecord = async () =>
          await ProfitService.create({
            ...commonData,
            execcutor: uname,
            profitDateQuery: totle,
          });

        handles = [ ...handles, updateCumulativeV, createInventryRecord, createProfitRecord ];
      });
      Promise.all(handles).then(() => SaleSupply.remove({ _id: { $in: [ ...params ] } }));
      return 1;
    } catch (e) {
      return 0;
    }

  }
}

module.exports = SaleSupplyService;
