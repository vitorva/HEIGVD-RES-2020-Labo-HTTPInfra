
$(function() {
	console.log("loading professions");
	
	function loadProfessions() {
		$.getJSON("/api/professions/", function (professions) {
			console.log(professions);
			message = professions[0].profession;
			dynamicServerIp = professions[0].ip;
			$(".skills").text(message);
			$(".dynamicServer").text("Dynamic server : " + dynamicServerIp);
		});
	};
	loadProfessions();
	setInterval(loadProfessions, 2000);
});