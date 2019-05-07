'use strict';

module.exports = app => {
  const { Schema, model } = app.mongoose;
  // const connect = app.mongooseDB.get('CSMS');
  const GoodsSchema = new Schema({
    goodsCategories: {
      type: String,
      required: false,
    },
    goodsName: {
      type: String,
      required: false,
    },
    specifications: {
      type: String,
      required: false,
    },
    goodsCode: {
      type: Number,
      required: false,
    },
    purSupplyCumulative: {
      type: Number,
      required: false,
      default: 0,
    },
    purSyMyCumulative: {
      type: Number,
      required: false,
      default: 0,
    },
    purShipmentCumulative: {
      type: Number,
      required: false,
      default: 0,
    },
    purStMyCumulative: {
      type: Number,
      required: false,
      default: 0,
    },
    saleSupplyCumulative: {
      type: Number,
      required: false,
      default: 0,
    },
    saleSyMyCumulative: {
      type: Number,
      required: false,
      default: 0,
    },
    saleShipmentCumulative: {
      type: Number,
      required: false,
      default: 0,
    },
    saleStMyCumulative: {
      type: Number,
      required: false,
      default: 0,
    },
    profitCumulative: {
      type: Number,
      required: false,
      default: 0,
    },
    inventryCumulative: {
      type: Number,
      required: false,
      default: 0,
    },
    // 库存商品数量*库存商品单位成本=库存商品金额，
    // 所有入库存的商品都是结转过成本的，所以直接算就行的。 算 进货金额
    inventryMyCumulative: {
      type: Number,
      required: false,
      default: 0,
    },
  });
  return model('Goods', GoodsSchema);
};
