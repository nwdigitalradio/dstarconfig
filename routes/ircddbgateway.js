var express = require('express');
var router = express.Router();
var hbs = require('hbs');
var fs = require('fs');
var ini = require('ini');
var piModel = require('../piModel')();
var hatRead = require('../hatRead')();
var ircddbgatewayconf = '/etc/opendv/ircddbgateway';
const exec = require('child_process').exec;

hbs.registerHelper('json', function(context) {
    return JSON.stringify(context);
});
hbs.registerHelper("switch", function(value, options) {
  this._switch_value_ = value;
  var html = options.fn(this); // Process the body of the switch block
  delete this._switch_value_;
  return html;
});

hbs.registerHelper("case", function(value, options) {
  if (value == this._switch_value_) {
    return options.fn(this);
  }
});

var curConfStr = fs.readFileSync(ircddbgatewayconf, { encoding : "UTF-8" });
var ircddbgwconf = ini.parse(curConfStr);
/* GET home page. */
var title = "ircDDBGateway Basic Setup";
var data = { title: title, conf: ircddbgwconf, piModel : piModel, hat : hatRead };

router.get('/', isAuthenticated, function(req, res, next) {
  res.render('ircddbgateway', data);
});

router.post('/', isAuthenticated, function(req, res, next) {
        var x = req.body;
        for (var key in x) {
                if (x.hasOwnProperty(key)) {
                        ircddbgwconf[key] = x[key];
                }
        }
	var newconfig = ini.encode(ircddbgwconf);
	console.log(newconfig);
//	fs.writeFileSync(ircddbgatewayconf,newconfig);
//	exec('systemctl restart ircddbgatewayd');
	res.render('ircddbgateway', data);
	
});

module.exports = router;
function isAuthenticated(req, res, next) {
    if (typeof req.session.passport !== 'undefined' && req.session.passport.user )
        return next();

    res.redirect('/login');
}
