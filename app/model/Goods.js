'use strict';

module.exports = app => {
  const { Schema, model } = app.mongoose;
  // const connect = app.mongooseDB.get('CSMS');
  const GoodsSchema = new Schema({
    goodsCategories: {
      type: String,
      required: true,
    },
    goodsName: {
      type: String,
      required: true,
    },
    specifications: {
      type: String,
      required: true,
    },
    goodsCode: {
      type: Number,
      required: false,
    },
  });
  return model('Goods', GoodsSchema);
};
