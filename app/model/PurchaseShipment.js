'use strict';

module.exports = app => {
  const { Schema, model } = app.mongoose;
  const PurchaseShipmentSchema = new Schema({
    // shipmentDate: {
    //   type: String,
    //   required: true,
    // },
    curtYear: {
      type: Number,
      required: true,
    },
    curtMonth: {
      type: Number,
      required: true,
    },
    curtDay: {
      type: Number,
      required: true,
    },
    curtTime: {
      type: String,
      required: true,
    },
    shipmentCount: {
      type: String,
      required: true,
    },
    shipmentPrice: {
      type: String,
      required: true,
    },
    totle: {
      type: Number,
      required: true,
    },
    supplier: {
      type: String,
      required: true,
    },
    // 执行人 (退货人)
    execcutor: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    note: {
      type: String,
      required: false,
      default: '',
    },
    purShipmentDateQuery: {
      type: Number,
      required: true,
      default: 0,
    },
    _goodsId: {
      type: Schema.Types.ObjectId,
      ref: 'Goods',
    },
  });
  return model('PurchaseShipment', PurchaseShipmentSchema);
};
