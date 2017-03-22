'use strict';

var SwaggerExpress = require('swagger-express-mw');
var express = require('express');
var app = express();
var YAML = require('yamljs');

module.exports = app;

var config = {
  appRoot: __dirname
};



SwaggerExpress.create(config, function(err, swaggerExpress) {
  if (err) { throw err; }

  swaggerExpress.register(app);

  app.listen(process.env.PORT || 3000);

  app.use('/static', express.static('static'));

  var swaggerUi = require('swagger-ui-express');
  app.use('/', swaggerUi.serve, swaggerUi.setup(YAML.load('./api/swagger/swagger.yaml')));
});
