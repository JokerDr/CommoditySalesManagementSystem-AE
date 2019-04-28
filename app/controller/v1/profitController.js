"use strict";

const Controller = require("egg").Controller;

class ProfitController extends Controller {
  async index() {
    const { ctx } = this;
    ctx.body = "hi, egg";
  }
}

module.exports = ProfitController;
