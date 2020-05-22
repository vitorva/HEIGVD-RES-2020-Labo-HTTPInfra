$(function() {
	console.log("loading professions");
	
	function loadProfessions() {
		$.getJSON("/api/professions/", function (professions) {
			console.log(professions);
			message = professions[0].profession;
			$(".skills").text(message);
		});
	};
	loadProfessions();
	setInterval(loadProfessions, 2000);
});