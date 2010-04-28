function BlipSong(username, message, title, link, date){
	this.username = username;
	this.message = message;
	this.title = title;
	this.link = link;
	this.datestring = date;
	this.date = getDateFromString(date);
}

function getDateFromString(datestring){
	var monthstring = datestring.substr(0,3);
	var month;
	if(monthstring == "Jan"){
		month = 0;
	} else if(monthstring == "Feb"){
		month = 1;
	} else if(monthstring == "Mar"){
		month = 2;
	} else if(monthstring == "Apr"){
		month = 3;
	} else if(monthstring == "May"){
		month = 4;
	} else if(monthstring == "Jun"){
		month = 5;
	} else if(monthstring == "Jul"){
		month = 6;
	} else if(monthstring == "Aug"){
		month = 7;
	} else if(monthstring == "Sep"){
		month = 8;
	} else if(monthstring == "Oct"){
		month = 9;
	} else if(monthstring == "Nov"){
		month = 10;
	} else if(monthstring == "Dec"){
		month = 11;
	}

	var year = parseInt(datestring.substr( datestring.search(/[0-9][0-9][0-9][0-9]/), 4), 10);
	var day = parseInt( datestring.substr( datestring.indexOf(",")-2, 2), 10);
	var hour = parseInt( datestring.substr( datestring.indexOf(":")-2, 2), 10);
	var minute = parseInt( datestring.substr( datestring.indexOf(":")+1, 2), 10);

	var PM = datestring.substr(-2);
	if(PM == "pm"){
		hour += 12;
	}

	return new Date(year, month, day, hour, minute);
}
$(document).ready(function(){
	
	$('#makeitso').submit( function() {
		var username = $('#username').val();
		var Playlist = [];
		var html = "";
		
		$('#results').hide().empty();
		
		if( username == "" ) {
			$('#results').append('<p>You didn\'t specify a username. Try again.<\/p>');
			$('#results').show();
			return;
		}
		
		// disable button
		$('#makeitso button').attr('disabled', 'disabled');
		
		$('#results').append('<p>Retrieving data. Please wait... (this can take a few seconds)<\/p>');
		$('#results').show();
		
		$.ajax({
				//select content, href from html where url="http://blip.fm/profile/username/playlist" and
				//      xpath='//div[@class="body"]/a[1] | //div[@class="body"]/span | //div[@class="date"]/a | //div[@class="song"]/span[1]'
				url: "http://query.yahooapis.com/v1/public/yql?q=select%20content%2C%20href%20from%20html%20where%20url%3D%22http%3A%2F%2Fblip.fm%2Fprofile%2F" + username + "%2Fplaylist%22%20and%0A%20%20%20%20%20%20xpath%3D'%2F%2Fdiv%5B%40class%3D%22body%22%5D%2Fa%5B1%5D%20%7C%20%2F%2Fdiv%5B%40class%3D%22body%22%5D%2Fspan%20%7C%20%2F%2Fdiv%5B%40class%3D%22date%22%5D%2Fa%20%7C%20%2F%2Fdiv%5B%40class%3D%22song%22%5D%2Fspan%5B1%5D'&format=json&diagnostics=false",
				dataType: 'jsonp',
				success: function(data) {
					if( !data.query.results || data.error ) {
						// error
						$('#results').hide().empty().append('<p>Oops, something is technically wrong! Are you sure this username exists?<\/p>');
						$('#results').show();
						
						// re-enable form button
						$('#makeitso button').removeAttr('disabled');
						return;
					}
					

					var user = "";
					var message = "";
					var title = "";
					var link = "";
					var date = "";
					var odd = false;
					for(var i = 0; i < data.query.results.a.length; i++) {
						if(odd){
							title = data.query.results.span[i];
							link = data.query.results.a[i].href;
							date = data.query.results.a[i].content;
							Playlist.push(new BlipSong(user, message, title, link, date));
							odd = false;
						} else {
							user = data.query.results.a[i].content;
							message = "";
							if(data.query.results.span[i]) {
								message = data.query.results.span[i];
							}
							odd = true;
						}
					}
					
					Playlist.sort(function(a,b){
						return a.date.getTime() - b.date.getTime();
					});
					
					for(var i = 0; i < Playlist.length; i++) {
						html += '<div class="tweem"><div class="content"><div style="position: relative;">';
						html += '<div><a href="http://blip.fm/' + Playlist[i].username + '">' + Playlist[i].username + '<\/a><span style="padding-left:5px">' + Playlist[i].message + '<\/span><\/div>';
						html += '<div class="song"><span>' + Playlist[i].title + '<\/span><\/div>';
						html += '<div class="date"><a href="' + Playlist[i].link + '">' + Playlist[i].datestring + '<\/a><\/div>';
						// DEBUG  + Playlist[i].date.toDateString() + ' ' + Playlist[i].date.getHours() + ':' + Playlist[i].date.getMinutes() + 
						html += '<\/div><\/div><\/div>';
					}


					$('#results').hide().empty();
					$('#results').append(html);
					$('#results').show();
					
					// re-enable button
					$('#makeitso button').removeAttr('disabled');
				}
		});
	});
	
	// mousedown handling for the submit button
	$("button").mouseup( function() {
		$(this).removeClass('mousedown');
		$(this).children().removeClass('mousedown');
	}).mousedown( function() {
		$(this).addClass('mousedown');
		$(this).children().addClass('mousedown');
	});
});