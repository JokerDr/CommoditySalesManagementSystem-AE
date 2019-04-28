'use strict';

const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');

// 关于cert,由于我使用的privateKey在开始使用ssh-keygen生成的，结果生成的文件privateKey 的头尾 内容是
// '-----BEGIN OPENSSH PRIVATE KEY-----'
// '-----END OPENSSH PRIVATE KEY-----'
// 导致在使用jwt报错 'unable to load Private Key', 'PEM routines:PEM_read_bio:no start line',等
// 继而，查询资料找到解决办法
// 请务必用openssl,进入OPENSSL界面,
// 使用命令： ' genrsa -out private.key 2048' 生成2048位私钥，
// 然后退出就可以继续使用 ' openssl rsa -in private.key -pubout -outform PEM -out public.key'来生成公钥，
// 当然，继续在其中也可以使用OPENSSL下的 ：'rsa -in private.key -pubout -out public.key  ',一样的
// 结果的文件：
// private.key:
// '-----BEGIN RSA PRIVATE KEY-----'
// '-----END RSA PRIVATE KEY-----'
// 然后就可以正常运行了
const confTime = '24h';

const generateToken = payload => {
  const cert = fs.readFileSync(path.join(__dirname, '../private.key')); // 私钥
  return jwt.sign(
    payload,
    cert,
    {
      algorithm: 'RS256',
      expiresIn: confTime,
    });
};
// @return  {
//   0: 无效或仿造token，
//   1: 过期token，
//   res：有效token
// }
const verifyToken = token => {
  const cert = fs.readFileSync(path.join(__dirname, '../public.key'));
  // 验证token的方法，传入token，解密，验证是否过期
  try {
    const result = jwt.verify(token, cert);
    // config 24h
    const { exp } = result;
    return Date.now() - exp >= 0 && result.data;
  } catch (e) {
    if (e.message === 'invalid token') {
      return 0;
    } //   伪造/无效的token
    if (e.message === 'jwt expired') {
      return 1; //  token过了有效期
    }
  }
};


module.exports = {
  generateToken,
  verifyToken,
};

