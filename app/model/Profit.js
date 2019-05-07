'use strict';

module.exports = app => {
  const { Schema, model } = app.mongoose;
  // const connect = app.mongooseDB.get('CSMS');
  const ProfitSchema = new Schema({
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
    eeProfit: {
      required: false,
      type: Number,
      default: 0,
    },
    profitDateQuery: {
      type: Number,
      required: true,
      default: 0,
    },
    referId: {
      type: String,
      required: true,
      default: '',
    },
    // 操作类型
    handleType: {
      type: String,
      required: true,
    },
    // name
    execcutor: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    _goodsId: {
      type: Schema.Types.ObjectId,
      ref: 'Goods',
    },
  });
  return model('Profit', ProfitSchema);
};
