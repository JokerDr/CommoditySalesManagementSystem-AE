'use strict';

module.exports = app => {
  const { Schema, model } = app.mongoose;
  // const connect = app.mongooseDB.get('CSMS');
  const SuppliersSchema = new Schema({
    name: {
      type: String,
      required: true,
    },
    // 联系人
    liner: {
      type: String,
      required: true,
    },
    companyName: {
      type: String,
      required: true,
    },
    phone: {
      type: Number,
      required: true,
    },
    tel: {
      type: Number,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    fax: {
      type: Number,
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
    zip: {
      type: Number,
      required: true,
    },
    sex: {
      type: String,
      required: true,
    },
    duties: {
      type: String,
      required: true,
    },
    qqWechat: {
      type: String,
      required: true,
    },
    netAddress: {
      type: String,
      required: true,
    },
    saleMan: {
      type: String,
    },
    note: {
      type: String,
    },
  });
  return model('Supplier', SuppliersSchema);
};
