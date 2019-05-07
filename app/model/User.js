'use strict';

module.exports = app => {
  const { Schema, model } = app.mongoose;
  // const connect = get('CSMS');
  const UsersSchema = new Schema({
    name: {
      type: String,
      required: true,
    },
    phone: {
      type: Number,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
    eeProfit: {
      type: Number,
      required: false,
      default: 0,
    },
    _authorId: {
      // 主键
      type: Schema.Types.ObjectId,
      ref: 'Authorization',
    },
  });
  return model('User', UsersSchema);
};
