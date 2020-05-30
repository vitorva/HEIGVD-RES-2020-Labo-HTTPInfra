var Chance = require('chance');
var chance = new Chance();

var express = require('express');
var app = express();

app.get('/', function(req,res) {
	res.send( generateProfessions() );
});

app.listen(3000, function () {
	console.log('Accepting HTTP requets on port 3000');
});

function generateProfessions() {
	var ip = require('ip');
	console.log(ip.address()); // my ip address
	
	var numberOfProfessions = chance.integer({
		min: 1,
		max: 5
	});
	
	console.log(numberOfProfessions);
	
	var professions = [];
	for (var i = 0; i< numberOfProfessions; i++){
		professions.push({
			profession : chance.profession(),
			ip : ip.address()
		});
	};
	console.log(professions);
	return professions;
}