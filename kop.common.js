/* eslint-disable global-require */
if (process.env.NODE_ENV === 'production') {
  module.exports = require('./dist/kop.prod.common')
} else {
  module.exports = require('./dist/kop.dev.common')
}
