var data = [],
	geocoder,
	map;

function detectBrowser() {
	var useragent = navigator.userAgent;
		if (useragent.indexOf('iPhone') != -1 || useragent.indexOf('Android') != -1 ) {
			window.location = "mobile.html";
		} else initialize();
	}
	
function displayInfo() {
	//alert(data.events[0].name);
}
	
function toggleBounce() {
	if (this.getAnimation() != null) {
	    this.setAnimation(null);
	} 
	else {
	    this.setAnimation(google.maps.Animation.BOUNCE);
	    displayInfo();
	}
}

function validate_addr(address){
	if (address.length > 0){
		codeAddress(address);
	} else {
		document.getElementById("error_mssg").innerHTML = "Please enter your address";
	}
}

function sbox(){
	var content = '<div id="shadowbox_content">';
	content += '<form action="submit" onsubmit="validate_addr(document.getElementById(\'addin\').value); return false;"><input id="addin" type="text"></input></form><script>document.getElementById("addin").focus()</script>';
	content += '<div id="error_mssg"></div>';
	content += '</div>';
	
	Shadowbox.open({
	    content: content,
	    player: "html",
	    title: "<img src='images/logo.png'/>",
	    info: "test",
	    height: 100,
	    width: 516,
	});
	var theDiv = document.createElement('div');
	theDiv.id ="thing";
	theDiv.appendChild(document.createTextNode("Tell us where you are"))
	document.getElementById('sb-info-inner').appendChild(theDiv);
};

function initialize() {
	geocoder = new google.maps.Geocoder();
	var latlng = new google.maps.LatLng(42.37, -71.05);
    var myOptions = {
  		zoom: 8,
		center: latlng,
		mapTypeId: google.maps.MapTypeId.HYBRID
	};
	map = new google.maps.Map(document.getElementById("map_canvas"), myOptions);
	
	Shadowbox.init({
		skipSetup: true,
		modal: true,
		enableKeys: false,
		overlayOpacity: 0.7
	});
	//sbox();
	var address = '247 Essex St Salem Ma';
	codeAddress(address);	
}

function codeAddress(address) {
    geocoder.geocode( { 'address': address}, function(results, status) {
      	if (status == google.maps.GeocoderStatus.OK) {
      		Shadowbox.close();
      		//document.getElementById('map_canvas').style.height = '80%';
      		//alert(results[0].geometry.toString());
			make_markers(results[0].geometry.location.toString().replace(' ', ''));
	   	} 
	   	else {
			document.getElementById("error_mssg").innerHTML = "We were unable to find your address, please try again.";
		}
	});
}

function make_markers(latlong) {
	var latlong = latlong.split(',');
	var lat = latlong[0].replace('(', '');
	var long = latlong[1].replace(')', '');
	latlong = {
		lat: lat,
		long: long
	}
	var position = new google.maps.LatLng(latlong.lat, latlong.long);
	
	new google.maps.Marker({
        position: position,
        map: map,
        //icon: image,
        animation: google.maps.Animation.DROP,
        title: 'ME'
    });
	
	loadInfo();
}

function loadInfo() {   
    var xobj = new XMLHttpRequest();
    xobj.overrideMimeType("application/json");
    xobj.onreadystatechange = function () {
        if (this.readyState == 4) {
        	data = JSON.parse(this.responseText);
        	location_markers();
        }
    }
    xobj.open('GET', 'event_data.json', true);
   	//xobj.open('GET', 'http://event.vonkow.com/getevents/', true);
    xobj.send();
}

function location_markers(){
	for (var i = 0, len=data.events.length ; i < len; i++) {
		var venue = data.events[i].venue;
		if(venue.latitude == 0) {
			var address = venue.address + ' ' + venue.city + ' ' + venue.state + ' ' + venue.zip;
		    geocoder.geocode( { 'address': address}, (function(){
		    	var tempi = i;
		    	return function(results, status) {
		      		if (status == google.maps.GeocoderStatus.OK) {
						var latlong = results[0].geometry.location.toString().replace(' ', '');
						latlong = latlong.split(',');
						var lat = latlong[0].replace('(', '');
						var long = latlong[1].replace(')', '');
						data.events[tempi].venue.latitude = lat;
						data.events[tempi].venue.longitude = long;
						if(i == (data.events.length)){
							place_markers();
						}
		   			} 
		   			else {
						alert("Geocode was not successful for the following reason: " + status);
					}
				};
			})());
		} 
		else if(i==(len-1)){
			place_markers();
		}
	}
}
	
function place_markers(){
	var iterator = 0
	var markers = [];
	var image = new google.maps.MarkerImage('images/popcorn-icon.png');

	function drop(){
		for (var i = 0; i < data.events.length; i++) {
	    	setTimeout(function() {addMarker();}, i * 200);
		}
	}
	
	function addMarker(){
		var position = new google.maps.LatLng(data.events[iterator].venue.latitude, data.events[iterator].venue.longitude);
		markers.push(
			new google.maps.Marker({
	        position: position,
	        map: map,
	        icon: image,
	        animation: google.maps.Animation.DROP,
	        title: data.events[iterator].name
    	}));
    	var tempi = iterator;
    	google.maps.event.addListener(markers[tempi], 'click', toggleBounce);
    	iterator++;
	}
	 drop();
}