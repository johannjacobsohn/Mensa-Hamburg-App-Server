module.exports = process.env.MAKE_COV ? require('./source-cov/server') : require('./source/server');
