var express = require('express');
var router = express.Router();
var hbs = require('hbs');
var fs = require('fs');
var ini = require('ini');
var piModel = require('../piModel')();
var hatRead = require('../hatRead')();
var dstarconfig1 = '/etc/opendv/dstarrepeater_1';
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

var curConfStr = fs.readFileSync(dstarconfig1, { encoding : "UTF-8" });
var udrcconf = ini.parse(curConfStr);
/* GET home page. */
var title = "D-STAR Repeater/Hotspot Basic Setup";
var data = { title: title, conf: udrcconf, piModel : piModel, hat : hatRead };

router.get('/', isAuthenticated, function(req, res, next) {
  res.render('udrc', data);
});

router.post('/', isAuthenticated, function(req, res, next) {
        var x = req.body;
        for (var key in x) {
                if (x.hasOwnProperty(key)) {
                        udrcconf[key] = x[key];
                }
        }
	var newconfig = ini.encode(udrcconf);
//	console.log(newconfig);
//	fs.writeFileSync(dstarconfig1,newconfig);
//	exec('systemctl restart dstarrepeaterd@1');
	res.render('udrc', data);
	
});

module.exports = router;
function isAuthenticated(req, res, next) {
    if (typeof req.session.passport !== 'undefined' && req.session.passport.user )
        return next();
    res.redirect('/login');
}
