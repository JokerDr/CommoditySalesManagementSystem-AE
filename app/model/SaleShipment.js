'use strict';

module.exports = app => {
  const { Schema, model } = app.mongoose;
  const SaleShipmentSchema = new Schema({
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
    // 客户
    supplier: {
      type: String,
      required: true,
    },
    // 执行人 (退货人)
    execcutor: {
      type: String,
      required: true,
    },
    note: {
      type: String,
      required: false,
      default: '',
    },
    _goodsId: {
      type: Schema.Types.ObjectId,
      ref: 'Goods',
    },
  });
  return model('SaleShipment', SaleShipmentSchema);
};
