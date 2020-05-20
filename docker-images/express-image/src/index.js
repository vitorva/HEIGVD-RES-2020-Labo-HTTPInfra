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
	var numberOfProfessions = chance.integer({
		min: 0,
		max: 10
	});
	console.log(numberOfProfessions);
	var professions = [];
	for (var i = 0; i< numberOfProfessions; i++){
		professions.push({
			profession : chance.profession()
		});
	};
	console.log(professions);
	return professions;
}