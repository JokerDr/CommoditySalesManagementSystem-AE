'use strict';

const Service = require('egg').Service;
const moment = require('moment');

class GoodsProfitService extends Service {
  async index(params) {
    const { saleSupply, SaleShipment, purchaseSupply, purchaseShipment, Goods, inventry } = this.ctx.model;
    const { tableConf, queryDate, ...res } = params;
    // const { timeType, time, tableConf, ...rest } = params;
    const { current, pageSize } = tableConf;
    const queryYear = moment(queryDate).year();
    const queryMonth = moment(queryDate).month();
    try {
      const conditions = res !== '' ? { ...res } : {};
      const goodsDocs = Goods.find(conditions).skip(current).limit(pageSize);
      const dataList = [];
      goodsDocs.forEach(goodsDoc => {
        const { _id, ...rest } = goodsDoc;
        const conditions2 = {
          _goodsId: _id,
          curtYear: queryYear,
          curtMonth: queryMonth,
        };
        const getSaleSupplyDocs = async () => {
          return await saleSupply.find(conditions2, {
            supplyCount: 1,
            totle: 1,
            saleSupplyDateQuery: 1,
            _id: 0,
          });
        };
        const getSaleShipmentDocs = async () => {
          return await SaleShipment.find(conditions2, {
            shipmentCount: 1,
            totle: 1,
            saleshipmentDateQuery: 1,
            _id: 0,
          });
        };
        const getPurchaseSupplyDocs = async () => {
          return await purchaseSupply.find(
            { _goodsId: _id },
            {
              supplyCount: 1,
              totle: 1,
              purSupplyDateQuery: 1,
              _id: 0,
            }
          );
        };
        const getPurchaseShipmentDocs = async () => {
          return await purchaseShipment.find(conditions2, {
            shipmentCount: 1,
            totle: 1,
            purShipmentDateQuery: 1,
            _id: 0,
          });
        };
        const getInventryDocs = async () => {
          return await inventry.find(conditions2, {
            shipmentCount: 1,
            totle: 1,
            purShipmentDateQuery: 1,
            _id: 0,
          });
        };
        const data = Promise.all([
          getSaleSupplyDocs,
          getSaleShipmentDocs,
          getPurchaseSupplyDocs,
          getPurchaseShipmentDocs,
          getInventryDocs,
        ]).then(async docsArr => {
          const saleSupplyDocs = docsArr[0];
          const saleShipmentDocs = docsArr[1];
          const purchaseSupplyDocs = docsArr[2];
          const purchaseShipmentDocs = docsArr[3];
          const inventryDocs = docsArr[4];
          const { saleSupplyDateQuery } = saleSupplyDocs;
          const { saleShipmentDateQuery } = saleShipmentDocs;
          const { purSupplyDateQuery } = purchaseSupplyDocs;
          const { purShipmentDateQuery } = purchaseShipmentDocs;
          const { inventryDateQuery } = inventryDocs;
          return {
            ...rest,
            saleSupplyDateQuery,
            saleShipmentDateQuery,
            purSupplyDateQuery,
            purShipmentDateQuery,
            inventryDateQuery,
          };
        });
        dataList.push(data);
      });


    } catch (e) {
      return [];
    }
  }
}

module.exports = GoodsProfitService;
