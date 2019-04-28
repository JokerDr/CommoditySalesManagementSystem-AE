'use strict';

const Service = require('egg').Service;
const moment = require('moment');

class InventryService extends Service {
  async index(params) {
    const { Inventry } = this.ctx.model;
    const { timeType, time } = params;
    const ti = moment(time);
    const timeMap = {
      year: ti.year(),
      month: ti.month(), // 0 -11
      day: ti.date(),
      all: ti.format('YYYY-MM-DD'),
    };
    const timeCondition = timeMap[timeType];
    try {
      const doc = Inventry.find({});
      if (!doc) {
        return 0;
      }
      return doc;
    } catch (e) {
      return 0;
    }
  }

  async create(params) {
    const { Inventry } = this.ctx.model;
    const { _goodsId, inventryStatistics } = params;
    try {
      const doc = await new Inventry({ _goodsId, inventryStatistics }).save();
      if (!doc) {
        return 0;
      }
      return doc;
    } catch (e) {
      return 0;
    }

  }

  async show(params) {
    const { Inventry } = this.ctx.model;
    const { _goodsId } = params;
    try {
      const doc = await Inventry.findOne({ _goodsId });
      if (!doc) {
        return 0;
      }
      return doc;
    } catch (e) {
      return 0;
    }
  }

  async update(params) {
    const { Inventry } = this.ctx.model;
    const { _goodsId, inventryStatistics } = params;
    try {
      const effect = Inventry.update(
        { _goodsId },
        { inventryStatistics }
      );
      if (!effect.ok) {
        return 0;
      }
      return 1;
    } catch (e) {
      return 0;
    }
  }
}

module.exports = InventryService;
