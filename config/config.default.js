/* eslint valid-jsdoc: "off" */

'use strict';


/**
 * @param {Egg.EggAppInfo} appInfo app info
 */
module.exports = appInfo => {
  /**
   * built-in config
   * @type {Egg.EggAppConfig}
   **/
  const config = {};

  // use for cookie sign key, should change to your own and keep security
  config.keys = appInfo.name + '_yuanql96';

  // add your middleware config here
  config.middleware = [ 'errorHandler', 'tokenChecker' ];

  config.tokenChecker = {
    ignore: /^\/api\/v1\/(session|user)+$/,
  };

  config.errorHandler = {
    match: '/api',
  };

  config.validate = {
    convert: true,
    widelyUndefined: true,
  };

  config.cors = {
    // {string|Function} origin: '*',
    origin: '*',
    allowMethods: 'GET,HEAD,PUT,POST,DELETE,PATCH',
    credentials: true,
  };
  config.security = {
    csrf: {
      enable: false,
      // 将token放到session中存储
      cookieName: 'csrfToken', // Cookie 中的字段名，默认为 csrfToken
      sessionName: 'csrfToken', // Session 中的字段名，默认为 csrfToken
      headerName: 'x-csrf-token', // 通过 header 传递 CSRF token 的默认字段为 x-csrf-token
      queryName: '_csrf', // 通过 query 传递 CSRF token 的默认字段为 _csrf
      bodyName: '_csrf', // 通过 body 传递 CSRF token 的默认字段为 _csrf
      // 在 SOP 的安全策略保护下， 基本上所有的现代浏览器都不允许跨域发起 content - type 为 JSON 的请求， 攻击者可以通过 flash + 307 来攻破
      ignoreJSON: false, // 默认为 false，当设置为 true 时，将会放过所有 content-type 为 `application/json` 的请求
    },
    domainWhiteList: [ 'http://localhost:8080' ],
  };

  config.mongoose = {
    // 'mongodb://username:password@hostname:port/databasename'
    url: 'mongodb://127.0.0.1:27017/CSMS',
    options: {
      autoReconnect: true,
      reconnectTries: Number.MAX_VALUE,
      bufferMaxEntries: 0,
    },
  };
  config.multipart = {
    fileExtensions: [ '.apk', '.pptx', '.docx', '.csv', '.doc', '.ppt', '.pdf', '.pages', '.wav', '.mov' ], // 增加对 .apk 扩展名的支持
  };
  config.bcrypt = {
    saltRounds: 10, // default 10
  };

  // add your user config here
  const userConfig = {
    // myAppName: 'egg',
  };

  return {
    ...config,
    ...userConfig,
  };
};
