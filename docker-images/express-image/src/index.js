var Chance = require('chance');
var chance = new Chance();

var express = require('express');
var app = express();

app.get('/', function(req,res) {
	res.send( chance.profession() );
});

app.listen(3000, function () {
	console.log('Accepting HTTP requets on port 3000');
});
