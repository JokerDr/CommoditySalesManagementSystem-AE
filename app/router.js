'use strict';

/**
 * @param {Egg.Application} app - egg application
 */
module.exports = app => {
  const { router, controller } = app;
  router.resources('session', '/api/v1/session', controller.v1.sessionController);
  router.resources('user', '/api/v1/user', controller.v1.userController);
  // 采购
  router.resources('purchaseSupply', '/api/v1/purchaseSupply', controller.v1.purSupplyController);
  router.resources('purchaseShipment', '/api/v1/purchaseShipment', controller.v1.purShipmentController);
  // 销售
  router.resources('saleSupply', '/api/v1/saleSupply', controller.v1.saleSupplyController);
  router.resources('salechaseShipment', '/api/v1/salechaseShipment', controller.v1.saleShipmentController);
  //  人员管理
  router.resources('customer', '/api/v1/customer', controller.v1.customerController);
  router.resources('enterprice', '/api/v1/enterprice', controller.v1.enterpriceController);
  router.resources('supplier', '/api/v1/supplier', controller.v1.supplierController);

  // 库存查看
  router.resources('inventry', '/api/v1/inventry', controller.v1.inventryController);

  // 利润管理
  router.resources('goodsProfit', '/api/v1/goodsProfit', controller.v1.goodsProfitController);
  router.resources('customerProfit', '/api/v1/customerProfit', controller.v1.customerProfitController);
  router.resources('enterpriceProfit', '/api/v1/enterpriceProfit', controller.v1.enterpriceProfitController);
  router.resources('eeProfit', '/api/v1/eeProfit', controller.v1.eeProfitController);

  // 销售统计
  router.resources('timeStatistics', '/api/v1/timeStatistics', controller.v1.eeProfitController);
  router.resources('eeStatistics', '/api/v1/eeStatistics', controller.v1.eeStatisticsPController);
  router.resources('customerStatistics', '/api/v1/customerStatistics', controller.v1.customerStatisticsController);

  // 验证码
  router.resources('captcha', '/api/tools/captcha', controller.tools.captchaController);
};
