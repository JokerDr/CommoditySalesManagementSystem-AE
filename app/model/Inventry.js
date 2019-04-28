'use strict';

module.exports = app => {
  const { Schema, model } = app.mongoose;
  // const connect = app.mongooseDB.get('CSMS');
  const InventrySchema = new Schema({
    // 采购进货累计
    purSupplyStatistics: {
      type: Number,
      required: true,
      default: 0,
    },
    purShipmentStatistics: {
      type: Number,
      required: true,
      default: 0,
    },
    saleShipmentStatistics: {
      type: Number,
      required: true,
      default: 0,
    },
    saleSupplyStatistics: {
      type: Number,
      required: true,
      default: 0,
    },
    inventryStatistics: {
      type: Number,
      required: true,
      default: 0,
    },
    _goodsId: {
      type: Schema.Types.ObjectId,
      ref: 'Goods',
    },
  });
  return model('Inventry', InventrySchema);
};
