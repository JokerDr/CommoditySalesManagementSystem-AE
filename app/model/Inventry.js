'use strict';

module.exports = app => {
  const { Schema, model } = app.mongoose;
  // const connect = app.mongooseDB.get('CSMS');
  const InventrySchema = new Schema({
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
    inventryDateQuery: {
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
    _goodsId: {
      type: Schema.Types.ObjectId,
      ref: 'Goods',
    },
  });
  return model('Inventry', InventrySchema);
};
