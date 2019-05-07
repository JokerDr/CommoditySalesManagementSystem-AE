'use strict';

const Service = require('egg').Service;
const moment = require('moment');

class CustomerStatisticsService extends Service {
  async index(params) {
    const { SaleShipment, SaleSupply } = this.ctx.model;
    const { date, tableConf } = params;
    const { current, pageSize } = tableConf;
    try {
      const shipmentDocs = SaleShipment.find({
        curtYear: moment(date).year(),
        curtMonth: moment(date).month() + 1,
      }, { _id: 0 }, {
        page: current,
        limit: pageSize,
      });
      const supplyDocs = SaleSupply.find({
        curtYear: moment(date).year(),
        curtMonth: moment(date).month() + 1,
      }, { _id: 0 }, {
        page: current,
        limit: pageSize,
      });
      const shipmentdata = {},
        supplydata = {};
      //   拿到每日销售出货的金额
      shipmentDocs.forEach(item => {
        const { curtDay } = item;
        shipmentdata[item[String(curtDay)]] += Number(item.totle);
      });
      //   拿到每日销售退货的金额
      supplyDocs.forEach(item => {
        const { curtDay } = item;
        supplydata[item[String(curtDay)]] += Number(item.totle);
      });
      return Reflect.ownKeys(shipmentdata).map(item => {
        return {
          day: item,
          abs: shipmentdata[item] - supplydata[item],
          shipment: shipmentdata[item],
          supplydata: supplydata[item],
        };
      });
    } catch (e) {
      return [];
    }
  }
}
module.exports = CustomerStatisticsService;
