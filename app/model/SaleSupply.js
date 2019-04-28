'use strict';

module.exports = app => {
  const { Schema, model } = app.mongoose;
  // const connect = app.mongooseDB.get('CSMS');
  const SaleSupplySchema = new Schema({
    // supplyDate: {
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
    supplyCount: {
      type: String,
      required: true,
    },
    supplyPrice: {
      type: String,
      required: true,
    },
    totle: {
      type: Number,
      required: true,
    },
    paid: {
      type: Number,
      required: true,
    },
    notPaid: {
      type: Number,
      required: false,
      default: 0,
    },
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
  return model('SaleSupply', SaleSupplySchema);
};
