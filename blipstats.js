var TotalBlipCount = 0;
var ArrayOfDates = new Array();
var DateCountMax = 0;
var BlipDateMax = new Date();

$(document).ready(function(){
	
	$('#makeitso').submit( function() {
		var username = $('#username').val();
		var limit = 1000;
		
		$('#results').hide().empty();
		
		if( username == "" ) {
			$('#results').append('<p>You didn\'t specify a username. Try again.<\/p>');
			$('#results').show();
			return;
		}
		
		// disable button
		$('#makeitso button').attr('disabled', 'disabled');
		
		$('#results').append('<p>Retrieving data. Please wait... (this can take up to 10 seconds)<\/p>');
		$('#results').show();
		
		// This can take up to 10 seconds with a limit of 1000 blips
		$.ajax({
				url: 'http://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20json%20where%20url%3D%22http%3A%2F%2Fapi.blip.fm%2Fblip%2FgetUserProfile.json%3Fusername%3D' + username + '%26offset%3D0%26limit%3D' + limit + '%22%20and%20itemPath%3D%22json.result.collection.Blip.insTime%22&format=json&diagnostics=false',
				/*url: 'jsonp.html',*/
				/*jsonpCallback: 'jsonp1270989106150',*/
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

					var blipCount = parseInt(data.query.count, 10);
					TotalBlipCount += blipCount;
					
					// prepare an array of Date objects
					for(var i = 0; i < blipCount; i++) {
						var year = parseInt(data.query.results.insTime[i].substring(0,4), 10);
						var month = parseInt(data.query.results.insTime[i].substring(5,7), 10);
						var day = parseInt(data.query.results.insTime[i].substring(8,10), 10);
						var date = new Date(year, month-1, day);
						ArrayOfDates.push(date);
					}

					// find the date with most blips and calculate average blips per day
					var count = 0;
					var index = ArrayOfDates.length-1;
					var currentDateCount = 0;
					var chartdata = [];
					for(var timestamp = new Date(ArrayOfDates[index].getTime()); timestamp.getTime() <= ArrayOfDates[0].getTime(); timestamp.setDate(timestamp.getDate()+1) ) {
						if(timestamp.getTime() == ArrayOfDates[index].getTime()) {
							for(var j = index; j >= 0 && timestamp.getTime() == ArrayOfDates[j].getTime(); j--) {
								index--;
								currentDateCount++;
							}
							if(DateCountMax < currentDateCount) {
								DateCountMax = currentDateCount;
								BlipDateMax.setTime(timestamp.getTime());
							}
							chartdata.push(currentDateCount);
							currentDateCount = 0;
						} else {
							chartdata.push(0);
						}
						
						// count the days
						count++;
					}
					var mean = blipCount/count;
					
					// URI limit is practically at 2000 symbols (bottleneck: IE6)
					// construct the URI for Google Chart API
					// TODO: keep an eye on granularity
					var chartApiURL = "http://chart.apis.google.com/chart";
					chartApiURL += "?cht=lc";
					chartApiURL += "&chd=t:" + roundEx(chartdata[0]*100/(DateCountMax*1.05));
					for(var i = 1; i < chartdata.length; i++) {
						chartApiURL += "," + roundEx(chartdata[i]*100/(DateCountMax*1.05));
					}
					chartApiURL += "&chco=0066AB";
					chartApiURL += "&chls=2.0";
					chartApiURL += "&chs=500x240";
					chartApiURL += "&chxt=x,y,r";
					chartApiURL += "&chxr=1,0," + roundEx(DateCountMax*1.05) + "|0,1," + count;
					chartApiURL += "&chxl=2:|average|max";
					chartApiURL += "&chxs=2,0066AB,13,-1,t,000000";
					chartApiURL += "&chxp=2," + roundEx(mean*100/(DateCountMax*1.05)) + "," + roundEx(DateCountMax*100/(DateCountMax*1.05));
					chartApiURL += "&chxtc=1,10|2,-500";
					chartApiURL += "&chf=c,lg,90,D1D1DC90,0,F1EFF590,0.5|bg,s,FFFFFF00";
					
					// user output
					var possessive = ( (username.charAt(username.length-1) == 's') ? (username + "'") : (username + "'s"))
					$('#results').hide().empty();
					$('#results').append('<p>These statistics are based on the last ' + blipCount + ' blips, starting ' + ArrayOfDates[ArrayOfDates.length-1].toDateString() + '.<\/p>');
					$('#results').append('<p><a href="http://blip.fm/' + username + '">' + possessive + '<\/a> personal best of <strong>' + DateCountMax + '<\/strong> blips in one day dates to ' + BlipDateMax.toDateString() + '.<\/p>');
					$('#results').append('<p>The average number of blips per day in this time period adds up to <strong>' + roundEx(mean) + '<\/strong>. ' + ( roundEx(mean) >= 40 ? 'Holy cow!' : '') + '<\/p>');
					$('#results').append('<div style="background:url(blipfm_lg.png) no-repeat 142px 75px; width:500px; height:250px"><img src="' + chartApiURL + '"><\/img><\/div>');
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

function roundEx(x) {
	// rounds to two decimal places
	return Math.round(x*100)/100;
}