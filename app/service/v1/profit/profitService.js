'use strict';

const Service = require('egg').Service;
const moment = require('moment');

class ProfitService extends Service {
  async index(params) {
    const { Profit } = this.ctx.model;
    const { timeType, time, tableConf, ...rest } = params;
    const { current, pageSize } = tableConf;
    const timeMap = {
      year: moment(time).year(),
      month: moment(time).month() + 1, // 0 -11
      day: moment(time).date(),
    };
    const timeConditionType = {
      year: {
        curtYear: timeMap.year,
      },
      month: {
        curtYear: timeMap.year,
        curtMonth: timeMap.month,
      },
      day: {
        curtYear: timeMap.year,
        curtMonth: timeMap.month,
        curtDay: timeMap.day,
      },
    };
    const timeCondition = timeConditionType[timeType];
    try {
      return Profit.find(timeCondition, { _id: 0 }).pupulate({
        path: '_goodsId', // 关联
        match: {
          ...rest,
        }, // 条件
        select: {
          // _id: 0,
        }, // 去掉_id属性，选择name
        options: {
          page: current,
          limit: pageSize,
        }, // 分页
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