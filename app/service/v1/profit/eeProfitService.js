'use strict';

const Service = require('egg').Service;

class ProfitService extends Service {
  async index(params) {
    const { Profit, SaleShipment } = this.ctx.model;
    const { employee, tableConf } = params;
    // const { timeType, time, tableConf, ...rest } = params;
    const { current, pageSize } = tableConf;
    try {
      // 数量，金额
      const doc1 = SaleShipment.find(
        {},
        {
          _id: 0,
          saleCount: 1,
          totle: 1,
        }
      ).pupulate({
        path: 'execcutor', // 关联
        match: {
          name: employee,
        }, // 条件
        select: {
          _id: 0,
        }, // 去掉_id属性，选择name
        options: {
          page: current,
          limit: pageSize,
        }, // 分页
      });
      const data = {};
      doc1.forEach(item => {
        const { saleCount, totle, execcutor } = item;
        data[execcutor].total += totle;
        data[execcutor].saleCount += saleCount;
      });
      return Reflect.ownKeys(data).map(key => {
        return {
          employee: key,
          saleCount: key.saleCount,
          saleProfit: key.total,
        };
      });
    } catch (e) {
      return [];
    }
  }

  async create(params) {
    const { Profit } = this.ctx.model;
    try {
      const doc = await new Profit({ ...params }).save();
      if (!doc) {
        return 0;
      }
      return doc;
    } catch (e) {
      return 0;
    }
  }

  async show(params) {
    const { Profit } = this.ctx.model;
    const { _goodsId } = params;
    try {
      const doc = await Profit.findOne({ _goodsId });
      if (!doc) {
        return 0;
      }
      return doc;
    } catch (e) {
      return 0;
    }
  }

  // async update(params) {
  //   const { Profit } = this.ctx.model;
  //   const { _goodsId, inventryStatistics } = params;
  //   try {
  //     const effect = Profit.update(
  //       { _goodsId },
  //       { inventryStatistics }
  //     );
  //     if (!effect.ok) {
  //       return 0;
  //     }
  //     return 1;
  //   } catch (e) {
  //     return 0;
  //   }
  // }
}

module.exports = ProfitService;
