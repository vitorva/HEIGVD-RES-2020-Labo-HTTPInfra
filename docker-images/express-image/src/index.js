var Chance = require('chance');
var chance = new Chance();

var express = require('express');
var app = express();

app.get('/', function(req,res) {
	res.send( generateStudents() );
});

app.listen(3000, function () {
	console.log('Accepting HTTP requets on port 3000');
});

function generateStudents() {
	var numberOfStudents = chance.integer({
		min: 0,
		max: 10
	});
	console.log(numberOfStudents);
	var students = [];
	for (var i = 0; i< numberOfStudents; i++){
		var gender = chance.gender();
		var birthday = chance.year({
			min: 1990,
			max: 2000
		});
		students.push({
			firstName : chance.first({
				gender: gender
			}),
			lastName: chance.last(),
			gender: gender,
			birthday: chance.birthday({
				year : birthday
			})
		});
	};
	console.log(students);
	return students;
}