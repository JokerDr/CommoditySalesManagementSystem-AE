'use strict';

/** @type Egg.EggPlugin */
module.exports = {
  validate: {
    enable: true,
    package: 'egg-validate',
  },
  mongoose: {
    enable: true,
    package: 'egg-mongoose',
  },
  bcrypt: {
    enable: true,
    package: 'egg-bcrypt',
  },
  cors: {
    enable: true,
    package: 'egg-cors',
  },

};
