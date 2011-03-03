from django.conf.urls.defaults import *
from django.contrib import admin

urlpatterns = patterns('evt.evts.views',
	(r'^$', 'showMain'),
	(r'^register/$', 'addUser'),
	(r'^login/$', 'login'),
	(r'^logout/$', 'logout'),
	(r'^attend/$', 'attend'),
	(r'^events/time/$', 'getEventsByTime'),
	(r'^events/loc/$', 'getEventsByLoc'),
	(r'^tag/user/$', 'tagUser'),
	(r'^tag/venue/$', 'tagVenue'),
	(r'^tag/event/$', 'tagEvent'),
	(r'^friend/$', 'addFriend'),
	(r'^adddata/$', 'addData'),
)
