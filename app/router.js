'use strict';

/**
 * @param {Egg.Application} app - egg application
 */
module.exports = app => {
  const { router, controller } = app;
  router.resources('session', '/api/v1/session', controller.v1.sessionController);
  router.resources('user', '/api/v1/user', controller.v1.userController);
  // 采购
  router.resources('purchaseSupply', '/api/v1/purchaseSupply', controller.v1.purchase.purSupplyController);
  router.resources('purchaseShipment', '/api/v1/purchaseShipment', controller.v1.purchase.purShipmentController);
  // 销售
  router.resources('saleSupply', '/api/v1/saleSupply', controller.v1.sale.saleSupplyController);
  router.resources('salechaseShipment', '/api/v1/salechaseShipment', controller.v1.sale.saleShipmentController);
  //  人员管理list
  router.resources('employee', '/api/v1/employee', controller.v1.personnel.employeeController);
  router.resources('customer', '/api/v1/customer', controller.v1.personnel.customerController);
  router.resources('enterprise', '/api/v1/enterprise', controller.v1.personnel.enterpriseController);
  router.resources('supplier', '/api/v1/supplier', controller.v1.personnel.supplierController);

  // 库存查看
  router.resources('inventry', '/api/v1/inventry', controller.v1.inventry.inventryController);

  // 利润管理
  router.resources('goodsProfit', '/api/v1/goodsProfit', controller.v1.profit.goodsProfitController);
  // router.resources('enterpriseProfit', '/api/v1/enterpriseProfit', controller.v1.profit.enterpriseProfitController);
  router.resources('eeProfit', '/api/v1/eeProfit', controller.v1.profit.eeProfitController);

  // 销售统计
  router.resources('timeStatistics', '/api/v1/timeStatistics', controller.v1.statistics.timeStatisticsController);
  router.resources('eeStatistics', '/api/v1/eeStatistics', controller.v1.statistics.eeStatisticsController);

  // 验证码
  router.resources('captcha', '/api/tools/captcha', controller.tools.captchaController);
};
