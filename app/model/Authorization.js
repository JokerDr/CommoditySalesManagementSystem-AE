'use strict';

module.exports = app => {
  const { Schema, model } = app.mongoose;
  // const connect = app.mongooseDB.get('CSMS');
  const AuthorizationsSchema = new Schema({
    email: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    remember_token: {
      type: String,
      required: false,
      default: '',
    },
    // created_at: {
    //   type: Date,
    //   required: true,
    //   default: Date.now(),
    // },
    // updated_at: {
    //   type: Date,
    //   required: true,
    //   default: Date.now(),
    // },
    provider: {
      type: String,
      required: true,
    },
    account_type: {
      type: String,
      required: false,
      default: 'user',
    },
  });
  return model('Authorization', AuthorizationsSchema);
};
