'use strict';

module.exports = app => {
  const { Schema, model } = app.mongoose;
  // const connect = app.mongooseDB.get('CSMS');
  const UserPowerSchema = new Schema({
    purchase: {
      type: Boolean,
      required: false,
      default: true,
    },
    sale: {
      type: Boolean,
      required: false,
      default: true,
    },
    inventry: {
      type: Boolean,
      required: false,
      default: true,
    },
    profit: {
      type: Boolean,
      required: false,
      default: true,
    },
    personnel_Manage: {
      type: Boolean,
      required: false,
      default: true,
    },
    statistics: {
      type: Boolean,
      required: false,
      default: true,
    },
    _authorId: {
      // 外键
      type: Schema.Types.ObjectId,
      ref: 'Authorization',
    },
  });
  return model('UserPower', UserPowerSchema);
};
