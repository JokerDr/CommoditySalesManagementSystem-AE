'use strict';

const Service = require('egg').Service;
const { generateToken } = require('../../public/utils/tokenRS256');


class SessionService extends Service {
  // {
  //   0: 账号不存在或者密码错误，
  //   token: 登录成功并返回token
  // }
  // 登錄服務
  async create(params) {
    const { body, originalUrl } = params;
    const { Authorization } = this.ctx.model;
    // 验证码
    // const isCaptcha = body.captcha === this.ctx.session.captchaCode;
    // if (!isCaptcha) { return 0; }

    // 查库验证
    return await Authorization.findOne(
      {
        email: body.userName,
        password: body.password,
      },
      {
        account_type: 1,
        _id: 1,
        email: 1,
      }
    )
      .then(async doc => {
        if (!doc) {
          return 0;
        }
        const payload = {
          iss: 'CSMS', // 非必须。issuer 请求实体，可以是发起请求的用户的信息，也可是jwt的签发者。
          // exp: "1548333419", // 非必须。expire 指定token的生命周期。unix时间戳格式
          aud: originalUrl, // 非必须。接收该JWT的一方。
          // sub: "jrocket@example.com", // 非必须。该JWT所面向的用户
          nbf: 60, // 非必须。not before。如果当前时间在nbf里的时间之前，则Token不被接受；一般都会留一些余地，比如几分钟。
          data: {
            _id: doc._id,
            account_type: doc.account_type,
          },
        };
        // 生成token
        const token = generateToken(payload);
        // 更新Authorization表中的token信息
        return await Authorization.update(
          { _id: doc._id },
          { remember_token: token }
        ).then(effectRow => {
          if (!effectRow.nModified) {
            const errMsg = `\n token 更新失败， effectRow: {n: ${
              effectRow.n
            }, nModified: ${effectRow.nModified}, ok: ${effectRow.ok}}`;
            return Promise.reject(errMsg);
          }
          return {
            type: doc.account_type,
            email: doc.email,
            token,
          };
        });
      })
      .catch(err => {
        throw err;
      });
  }

  // 更改密码
  // 0: 原始密码错误 || 没有成功更新
  // 1: 更改密码成功
  async update(params) {
    const { condition, oldPwd, newPwd } = params;
    const { Authorization } = this.ctx.model;
    return await Authorization.findById(condition._id, { password: 1, _id: 0 }).then(async doc => {
      if (doc && doc.password === oldPwd) {
        try {
          const effect = await Authorization.update(condition, { password: newPwd });
          if (effect.nModified) {
            return 1;
          }
          // 没有成功更新;
          return 0;
        } catch (err) {
          throw err;
        }
      }
      // 原始密码错误;
      return 0;
    }).catch(err => {
      throw err;
    });
  }

  // 退出登录
  // 0: 退出失败，
  // 1: 退出成功
  async destroy(params) {
    const { Authorization } = this.ctx.model;
    return await Authorization.update(params, { remember_token: '' }).then(doc => {
      if (doc.nModified) {
        return 1;
      }
      return 0;
    }).catch(err => { throw err; });
  }
}

module.exports = SessionService;
