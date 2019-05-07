'use strict';

const { verifyToken } = require('../public/utils/tokenRS256');

module.exports = () => {
  return async function tokenChecker(ctx, next) {
    const { Authorization } = ctx.model;
    const tokenOrigin = ctx.request.headers || ctx.request.body || ctx.request.queries;
    if (tokenOrigin.authorization) {
      const token = tokenOrigin.authorization.substring(7); // 去掉 'Breaer '
      const data = verifyToken(token); // 解密token
      // 验证客户端token是否合法
      if (data && typeof data !== 'number') {
        const { _id } = data; // 检查是否有用户_id
        // 之所以查库是因为我们无从得知当前的未过期的token是新生成的还是原来的，所以需要一个留存字段来检验
        const findToken = await Authorization.findOne(
          { _id },
          { _id: 0, remember_token: 1 }
        ).catch(err => {
          throw err;
        });
        // 验证是否为最新的token

        if (token === findToken.remember_token) {
          ctx.state.tokenData = data;
          await next();
        } else {
          // 如果不是最新token，则代表用户在另一个机器上进行操作，需要用户重新登录保存最新token
          const message =
            '您的账号已在其他机器保持登录，如果继续将清除其他机器的登录状态';
          ctx.helper.HandleData(ctx, 2, message, {});
        }
      } else {
        // 如果token不合法，则代表客户端token已经过期或者不合法（伪造token）
        const message = '您的登录状态已过期，请重新登录';
        ctx.status = 401;
        ctx.helper.HandleData(ctx, 2, message, {});
      }
    } else {
      // 如果token为空，则代表客户没有登录
      ctx.status = 401;
      const message = '您还没有登录，请登陆后再进行操作';
      ctx.helper.HandleData(ctx, 2, message, {});
    }
  };
};
