const path = require('path');

module.exports = {
  routesPath: path.join(__dirname, '..', 'routes'),
  port: 7001,
  apiPrefix: '/api/v1',
  debug: true,
  tokenKey: 'x-token',
  hashKey: 'dfe1e4596abecd991c5e92d0956acf2f' // 通过 crypto.randomBytes(16).toString('hex') 计算得出
};
