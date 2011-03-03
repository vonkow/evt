var pst,
	csrf,
	m,
	mLoopStart,
	mLoop,
	tOut,
	datum = [];

$(document).ready(function(){
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
				//datum.push(data.data);
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
		var map = new gm.Map(document.getElementById('map'), options);
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
			this.makePanel = function(q) {
				var evDt = document.createElement('div');
				evDt.class = 'eventDetails';
				var evIm = document.createElement('img');
				evIm.class = 'category';
				// add image to src if there is one
				evDt.appendChild(evIm);
				var evTl = document.createElement('div');
				evTl.class = 'eventTitle';
				evTlL = document.createElement('a');
				evTlL.class = 'eventLink';
				evTlL.href = q.url;
				var evTlT = document.createTextNode(q.name);
				evTlL.appendChild(evTlT);
				evTl.appendChild(evTlL);
				evDt.appendChild(evTl);
				var dtCe = document.createElement('div');
				dtCe.class = 'detailsColumn';
				var evTm = document.createElement('div');
				evTm.class = 'eventTime';
				var evStT = document.createTextNode(q.startTime);
				evTm.appendChild(evStT);
				var evPr = document.createElement('div');
				evPr.class = 'eventPrice';
				var evPrT = document.createTextNode(q.price);
				evPr.appendChild(evPrT);
				dtCe.appendChild(evTm);
				dtCe.appendChild(evPr);
				evDt.appendChild(dtCe);
				var dtCv = document.createElement('div');
				dtCv.class = 'detailsColumn';
				var veNm = document.createElement('div');
				veNm.class = 'venueName';
				var veNmL = document.createElement('a');
				veNmL.class = 'venueLink';
				veNmL.href = q.venue.url;
				var veNmLT = document.createTextNode(q.venue.name);
				veNmL.appendChild(veNmLT);
				dtCv.appendChild(veNmL);
				var veLc = document.createElement('div');
				veLc.class = 'venueLoc';
				var veLcT = document.createTextNode(q.venue.address+' '+q.venue.city+' '+q.venue.state+' '+q.venue.zip);
				veLc.appendChild(veLcT);
				dtCv.appendChild(veLc);
				var evPh = document.createElement('div');
				evPh.class = 'eventPhone';
				var evPhT = document.createTextNode(q.phone);
				evPh.appendChild(evPhT);
				dtCv.appendChild(evPh);
				evDt.appendChild(dtCv);
				var evDc =document.createElement('div');
				evDc.class = 'eventDesc';
				evDcT = document.createTextNode(q.description);
				evDc.appendChild(evDcT);
				evDt.appendChild(evDc);
				var veDc = document.createElement('div');
				veDc.class = 'venueDesc';
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
						var iBox = document.getElementById('info-box');
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
	if (navigator.geolocation.getCurrentPosition) {
		navigator.geolocation.getCurrentPosition(function(position) {
			pst.searchLoc(2011,2,26,position.coords.latitude,position.coords.longitude,3.0);
		});
	} else {
		pst.searchLoc(2011,2,26,42.360406,-71.057993,3.0);
	}
});

