var express = require('express');
var router = express.Router();
var hbs = require('hbs');
var fs = require('fs');
var ini = require('ini');
var piModel = require('../resources/piModel')();
var hatRead = require('../resources/hatRead')();
const exec = require('child_process').exec;
var title = "Commands";
var data = { title: title, piModel : piModel, hat : hatRead };
router.get('/', isAuthenticated, function(req, res, next) {
	res.render('commands', data);
});

router.get('/restartudrc', isAuthenticated, function(req, res, next) {
	exec('systemctl restart dstarrepeaterd@1');
	res.render('commands',data);
});

module.exports = router;
function isAuthenticated(req, res, next) {
    if (typeof req.session.passport !== 'undefined' && req.session.passport.user )
        return next();
    res.redirect('/login');
}
