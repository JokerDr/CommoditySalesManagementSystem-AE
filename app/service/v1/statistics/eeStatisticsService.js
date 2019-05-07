'use strict';

const Service = require('egg').Service;
const moment = require('moment');

class CustomerStatisticsService extends Service {
  async index(params) {
    const { SaleShipment } = this.ctx.model;
    const { date, tableConf } = params;
    const { current, pageSize } = tableConf;
    try {
      const docs = SaleShipment.find({
        curtYear: moment(date).year(),
        curtMonth: moment(date).month() + 1,
      }, { _id: 0 }, {
        page: current,
        limit: pageSize,
      });
      const data = {};
      let totalMoney = 0;
      docs.forEach(item => {
        const { execcutor } = item;
        totalMoney += Number(item.totle);
        data[item[execcutor]] += Number(item.totle);
      });
      return Reflect.ownKeys(data).map(item => {
        return {
          employee: item,
          saleCount: data[item],
          percent: String((data[item] / totalMoney) / 100) + '%',
        };
      });
    } catch (e) {
      return [];
    }
  }
}
module.exports = CustomerStatisticsService;
