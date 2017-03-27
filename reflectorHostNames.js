var fs = require('fs');
var dcshosts = '/usr/share/opendv/DCS_Hosts.txt';
var refhosts = '/usr/share/opendv/DPlus_Hosts.txt';
var xrfhosts = '/usr/share/opendv/DExtra_Hosts.txt';
var ccshosts = '/usr/share/opendv/CCS_Hosts.txt';

function addHosts(arr,filename) {
	var value = fs.readFileSync(filename);
	var lines = value.toString().split('\n');
	for (line in lines) {
		var name = lines[line].split(/\s+/,1);
		if (name.toString().match(/^RE[XF]|^DC[XS]|^XR[XF]/)){
			arr[name] = filename;
		}
	}
}


var reflectorHostNames = function() {
	var names = {};
	addHosts(names,refhosts);
	addHosts(names,dcshosts);
	addHosts(names,xrfhosts);
	return Object.keys(names);
}


//console.log(reflectorHostNames());
module.exports = reflectorHostNames;
