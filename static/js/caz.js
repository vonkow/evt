var pst,
	csrf,
	m,
	mLoopStart,
	mLoop,
	map,
	tOut,
	validate_addr;
//$(document).ready(function(){
	mLoop = function(qset, iter) {
		if (qset.length>0) {
			var q = qset.shift();
			m.mark(q.venue.latitude, q.venue.longitude, q.name);
			m.addBounce(iter);
			m.makePanel(q);
			m.addPinPanel(iter);
			tOut = window.setTimeout(mLoop, 250, qset, ++iter);
		} else {
		};
	};
	mLoopStart = function(qset) {
		m.demarkAll();
		mLoop(qset, 0);
	};

	csrf = 'csrfmiddlewaretoken='+document.forms[0].elements['csrfmiddlewaretoken'].value;
	pst = new function() {
		this.login = function(uname, pword) {
			$.post('/login/', csrf+'&username='+uname+'&password='+pword, function(data) {
			})
		};
		this.logout = function() {
			$.post('/logout/', csrf, function(data) {
			})
		};
		this.register = function(uname, pword, email) {
			$.post('/register/', csrf+'&username='+uname+'&password='+pword+'&email='+email, function(data) {
			})
		};
		this.attend = function(eventId) {
			$.post('/attend/', csrf+'&eventid='+eventId, function(data) {
			})
		};
		this.tagSelf = function(tag) {
			$.post('/tag/user/', csrf+'&tag='+tag, function(data) {
			})
		};
		this.tagEvent = function(tag, eventId) {
			$.post('/tag/event/', csrf+'&tag='+tag+'&eventid='+eventId, function(data) {
			})
		};
		this.tagVenue = function(tag, venueId) {
			$.post('/tag/venue/', csrf+'&tag='+tag+'&venueid='+venueId, function(data) {
			})
		};
		this.addFriend = function(friendName) {
			$.post('/friend/', csrf+'&friend='+friendName, function(data) {
			})
		};
		this.searchTime = function(year, month, day) {
			$.post('/events/time/', csrf+'&year='+year+'&month='+month+'&day='+day, function(data) {
			})
		};
		this.searchLoc = function(year, month, day, lat, lon, rad) {
			$.post('/events/loc/', csrf+'&year='+year+'&month='+month+'&day='+day+'&lat='+lat+'&lon='+lon+'&rad='+rad, function(data) {
				mLoopStart(data.data);
			})
		};
	};
	m=(function() {
		var gm = google.maps,
			geocoder = new gm.Geocoder(),
			options = {
			zoom: 13,
			center: new gm.LatLng(42.360406, -71.057993),
			mapTypeId: gm.MapTypeId.ROADMAP
		};
		map = new gm.Map(document.getElementById('map'), options);
		var m = new function() {
			var that = this;
			this.markers  = [];
			this.mark = function(la, lo, title) {
				var mar = new gm.Marker({
					position: new gm.LatLng(la, lo),
					map: map,
					title: title,
					animation: gm.Animation.DROP
				})
				that.markers.push(mar);
				return mar
			};
			this.demark = function(mId) {
				that.markers[mId].setMap(null);
				that.markers.splice(mId, 1);
			}
			this.demarkAll = function() {
				while (that.markers.length) that.markers.splice(0,1);
			};
			this.iwindows = [];
			this.iwin  = function(content) {
				var iw = new gm.InfoWindow({
					content: content
				});
				that.iwindows.push(iw);
				return iw
			};
			this.curBounce = -1;
			this.bounceBouncer = function(mId) {
				if (that.curBounce != -1) {
					that.markers[that.curBounce].setAnimation(null);
				};
				that.curBounce = mId;
			};
			this.addBounce = function(mId) {
				gm.event.addListener(that.markers[mId], 'click', (function() {
					var tempM = mId;
					return function() {
						if (this.getAnimation() != null) {
							this.setAnimation(null);
							that.curBounce = -1;
						} else {
							that.bounceBouncer(tempM);
							this.setAnimation(gm.Animation.BOUNCE);
						}
					}
				})());
			};
			this.panels = [];
			this.removePanels = function() {
				while(that.panels.length) that.panels.pop();
			};
			//This must make a DOM fragment containing event info and put it in this.panels
			// I am a cruel and unusual person sometimes
			this.makePanel = function(q) {
				var evDt = document.createElement('div');
				evDt.className = 'eventDetails';
				var evIm = document.createElement('img');
				evIm.className = 'category';
				// add image to src if there is one
				evDt.appendChild(evIm);
				var evTl = document.createElement('div');
				evTl.className = 'eventTitle';
				var evTlL = document.createElement('a');
				evTlL.className = 'eventLink';
				evTlL.href = q.url;
				var evTlT = document.createTextNode(q.name);
				evTlL.appendChild(evTlT);
				evTl.appendChild(evTlL);
				evDt.appendChild(evTl);
				var dtCe = document.createElement('div');
				dtCe.className = 'detailsColumn';
				var evTm = document.createElement('div');
				evTm.className = 'eventTime';
				var evStT = document.createTextNode(q.startTime);
				evTm.appendChild(evStT);
				var evPr = document.createElement('div');
				evPr.className = 'eventPrice';
				var evPrT = document.createTextNode(q.price);
				evPr.appendChild(evPrT);
				dtCe.appendChild(evTm);
				dtCe.appendChild(evPr);
				evDt.appendChild(dtCe);
				var dtCv = document.createElement('div');
				dtCv.className = 'detailsColumn';
				var veNm = document.createElement('div');
				veNm.className = 'venueName';
				var veNmL = document.createElement('a');
				veNmL.className = 'venueLink';
				veNmL.href = q.venue.url;
				var veNmLT = document.createTextNode(q.venue.name);
				veNmL.appendChild(veNmLT);
				dtCv.appendChild(veNmL);
				var veLc = document.createElement('div');
				veLc.className = 'venueLoc';
				var veLcT = document.createTextNode(q.venue.address+' '+q.venue.city+' '+q.venue.state+' '+q.venue.zip);
				veLc.appendChild(veLcT);
				dtCv.appendChild(veLc);
				var evPh = document.createElement('div');
				evPh.className = 'eventPhone';
				var evPhT = document.createTextNode(q.phone);
				evPh.appendChild(evPhT);
				dtCv.appendChild(evPh);
				evDt.appendChild(dtCv);
				var evDc =document.createElement('div');
				evDc.className = 'eventDesc';
				evDcT = document.createTextNode(q.description);
				evDc.appendChild(evDcT);
				evDt.appendChild(evDc);
				var veDc = document.createElement('div');
				veDc.className = 'venueDesc';
				veDcT = document.createTextNode(q.venue.description);
				veDc.appendChild(veDcT);
				evDt.appendChild(veDc);
				that.panels.push(evDt);
			};
			//This will add a panel popup listener to the pin
			this.addPinPanel = function(mId) {
				gm.event.addListener(that.markers[mId], 'click', (function() {
					var tempM = mId;
					return function() {
						var iBox = document.getElementById('readout');
						while (iBox.childNodes.length) {
							iBox.removeChild(iBox.childNodes[0]);
						}
						iBox.appendChild(m.panels[tempM]);
					}
				})());
			};
			this.addIwin = function(mId, iId) {
				var mar = that.markers[mId],
					iwn = that.iwindows[iId];
				gm.event.addListener(mar, 'click', function() {
					iwn.open(map, mar);
				})
			};
			this.codeAddr = function(addr, callback) {
				geocoder.geocode( { 'address': addr}, function(results, status) {
					if (status == google.maps.GeocoderStatus.OK) {
						callback(results);
					} else {
						callback(false);
					}
				})
			};
		};
		return m;
	})();

	function validate_addr(ad){
		if (ad.length > 0){
			m.codeAddr(ad, function(results) {
				if (!results) {
					document.getElementById('addin').value = '';
					document.getElementById("error_mssg").innerHTML = "We were unable to find your address, please try again.";
				} else {
					Shadowbox.close();
					var ll = results[0].geometry.location;
					map.setCenter(ll);
					pst.searchLoc(2011,2,26,ll.lat(),ll.lng(),2.0);
				}
			});
		} else {
			document.getElementById("error_mssg").innerHTML = "Please enter your address";
		}
		return false;
	};

	function checkIfDoneAndSub(e) {
		if (e.keyCode==13) {
			validate_addr(document.getElementById('addin').value);
		}
	}


	// INIT STUFF
	// Redirect mobile traffic
	var useragent = navigator.userAgent;
	if (navigator.userAgent.indexOf('iPhone') != -1 || navigator.userAgent.indexOf('Android') != -1 ) window.location = "/mobile.html";
	//// Skip shadowbox if geolocation works
	//if (navigator.geolocation.getCurrentPosition) {
		//navigator.geolocation.getCurrentPosition(function(position) {
			//pst.searchLoc(2011,2,26,position.coords.latitude,position.coords.longitude,3.0);
		//});
	//} else {
		var content = '<div id="shadowbox_content">';
		content += '<input id="addin" type="text" onkeypress="checkIfDoneAndSub(event)"></input>';
		content += '<div id="error_mssg"></div>';
		content += '</div>';
		window.onload = function() {
			Shadowbox.open({
				content: content,
				player: "html",
				title: '<img src="/media/logo.png">',
				info: "test",
				height: 100,
				width: 516
			});
		}
	//}
//});

