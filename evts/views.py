from django.core import serializers
from django.core.context_processors import csrf
from django.shortcuts import render_to_response, get_object_or_404
from django.http import HttpResponseRedirect, HttpResponse
from django.core.urlresolvers import reverse
from django.core.exceptions import ObjectDoesNotExist
from django.db import IntegrityError
from django.contrib import auth
from django.template import RequestContext
from datetime import datetime
import csv
import json
import math
import test_parse
from evt.evts.models import Event, EType, Venue, VType, UserProfile, Tag, EventTag, VenueTag, UserTag, UserFriend, Attending

def showMain(request):
	return render_to_response('main.html', {}, context_instance=RequestContext(request))

def get_or_create_profile(user):
	try:
		profile = user.get_profile()
	except ObjectDoesNotExist:
		profile = UserProfile(user=user)
		profile.save()
	return profile

def jResponse(jData):
	return HttpResponse(jData, content_type='application/json; charset=utf-8')

def addUser(request):
	user_list = auth.models.User.objects.filter(username=request.POST['username'])
	email_list = auth.models.User.objects.filter(email=request.POST['email'])
	if user_list.count() == 0 and email_list.count() == 0:
		user = auth.models.User.objects.create_user(username = request.POST['username'], password = request.POST['password'], email = request.POST['email'])
		user.save()
		user = auth.authenticate(username=request.POST['username'], password=request.POST['password'])
		profile = get_or_create_profile(user)
		profile.save()
		if user is not None and user.is_active:
			auth.login(request, user)
			return jResponse('{"status":"ok","uname":"'+user.username+'"}')
	return jResponse('{"status":"error"}')

def login(request):
	username = request.POST['username']
	password = request.POST['password']
	user = auth.authenticate(username=username, password=password)
	if user is not None and user.is_active:
		auth.login(request, user)
		return jResponse('{"status":"ok","uname":"'+user.username+'"}')
	else:
		return jResponse('{"status":"error"}')

def logout(request):
	if request.user.is_authenticated():
		auth.logout(request)
		return jResponse('{"status":"ok"}')
	return jResponse('{"status":"error"}')

def attend(request):
	if request.user.is_authenticated():
		try:
			event = Event.objects.get(pk=request.POST['eventid'])
			try:
				att = Attending.objects.get(user=request.user, event=event)
			except:
				att = Attending(user=request.user, event=event)
				att.save()
				return jResponse('{"status":"ok"}')
		except:
			pass
	return jResponse('{"status":"error"}')

def tagUser(request):
	if request.user.is_authenticated():
		try:
			t = Tag.objects.get(name=request.POST['tag'])
		except:
			t = Tag(name=request.POST['tag'])
			t.save()
		try:
			utag = UserTag.objects.get(user=request.user, tag=t)
		except:
			utag = UserTag(user=request.user, tag=t)
			utag.save()
			return jResponse('{"status":"ok"}')
	return jResponse('{"status":"error"}')

def tagVenue(request):
	if request.user.is_authenticated():
		try:
			v = Venue.objects.get(pk=request.POST['venueid'])
			try:
				t = Tag.objects.get(name=request.POST['tag'])
			except:
				t = Tag(name=request.POST['tag'])
				t.save()
			try:
				vtag = VenueTag.objects.get(venue=v, tag=t)
			except:
				vtag = VenueTag(venue=v, tag=t)
				vtag.save()
				return jResponse('{"status":"ok"}')
		except:
			pass
		return jResponse('{"status":"error"}')

def tagEvent(request):
	if request.user.is_authenticated():
		try:
			e = Event.objects.get(pk=request.POST['eventid'])
			try:
				t = Tag.objects.get(name=request.POST['tag'])
			except:
				t = Tag(name=request.POST['tag'])
				t.save()
			try:
				etag = EventTag.objects.get(event=e, tag=t)
			except:
				etag = EventTag(event=e, tag=t)
				etag.save()
				return jResponse('{"status":"ok"}')
		except:
			pass
	return jResponse('{"status":"error"}')

# This isn't going to be used at the moment, until we start sending users to the client
def addFriend(request):
	if request.user.is_authenticated():
		try:
			f = auth.models.User.objects.get(username=request.POST['friend'])
			try:
				frel = UserFriend.objects.get(user=request.user, friend=f)
			except:
				frel = UserFriend(user=request.user, friend=f)
				frel.save()
				return jResponse('{"status":"ok"}')
		except:
			pass
	return jResponse('{"status":"error"}')

def getEventsByTime(request):
	events = Event.objects.filter(startTime__year=request.POST['year']).filter(startTime__month=request.POST['month']).filter(startTime__day=request.POST['day'])
	return sendEvents(request, events)

def getMileLon(lat):
	return 1/(math.cos(math.radians(lat))*69.172)

def getMileLat():
	return 1/69.172

def getEventsByLoc(request):
	try:
		la = float(request.POST['lat'])
		lo = float(request.POST['lon'])
		r = float(request.POST['rad'])
		laM = r*getMileLat()
		loM = r*getMileLon(la)
		try:
			events = Event.objects.filter(startTime__year=request.POST['year']).filter(startTime__month=request.POST['month'])#.filter(startTime__day=request.POST['day'])
			es = []
			try:
				for event in events:
					if event.venue.longitude > lo-loM and event.venue.longitude < lo+loM:
						if event.venue.latitude > la-laM and event.venue.latitude < la+laM:
							es.append(event)
				return sendEvents(request, es)
			except:
				return jResponse('{"status":"elooperror"}')
		except:
			return jResponse('{"status":"evnterror"}')
	except:
		return jResponse('{"status":"matherror"}')

def sendEvents(request, events):
	es = []
	for event in events:
		venue = event.venue
		etags = []
		for etag in event.eventtag_set.all():
			etags.append(etag.tag.name)
		vtags = []
		for vtag in venue.venuetag_set.all():
			vtags.append(vtag.tag.name)
		attends = []
		for attn in event.attending_set.all():
			attends.append(attn.user.username)
		#etags = json.dump(etags)
		#vtags = json.dump(vtags)
		#attends = json.dump(attends)
		try:
			ety = unicode(event.etype.name)
		except:
			ety = ' '
		try:
			vty = unicode(venue.vtype.name)
		except:
			vty = ' '
		es.append({
			"name": unicode(event.name).rstrip('\n'),
			"id": unicode(event.id).rstrip('\n'),
			"etype": '\n'+unicode(ety).rstrip('\n'),
			"description": unicode(event.description).rstrip('\n'),
			"startTime": unicode(event.startTime).rstrip('\n'),
			"endTime": unicode(event.endTime).rstrip('\n'),
			"phone": unicode(event.phone).rstrip('\n'),
			"price": unicode(event.price).rstrip('\n'),
			"url": unicode(event.url).rstrip('\n'),
			"vid": unicode(event.vid).rstrip('\n'),
			"z_id": unicode(event.z_id).rstrip('\n'),
			"venue": {
				"name": unicode(venue.name).rstrip('\n'),
				"id": unicode(venue.id).rstrip('\n'),
				"vtype": unicode(vty).rstrip('\n'),
				"description": unicode(venue.description).rstrip('\n'),
				"address": unicode(venue.address).rstrip('\n'),
				"city": unicode(venue.city).rstrip('\n'),
				"state": unicode(venue.state).rstrip('\n'),
				"zip": unicode(venue.zip).rstrip('\n'),
				"country": unicode(venue.country).rstrip('\n'),
				"latitude": unicode(venue.latitude).rstrip('\n'),
				"longitude": unicode(venue.longitude).rstrip('\n'),
				"url": unicode(venue.url).rstrip('\n'),
				"z_id": unicode(venue.z_id).rstrip('\n')
			},
			"etags": etags,
			"vtags": vtags,
			"attends" : attends,
		})
	dat = {"data":es}
	return jResponse(json.dumps(dat))


# Admin data adding request
def addData(request):
	evs = test_parse.doIt()
	for venue in serializers.deserialize('json', evs['venues']):
		vs = Venue.objects.filter(z_id=venue.object.z_id)
		if vs.count() == 0:
			venue.save()
		# if venue already exists, run a diff and check

	for event in serializers.deserialize('json', evs['events']):
		es = Event.objects.filter(z_id=event.object.z_id)
		if es.count() == 0:
			vs = Venue.objects.filter(z_id=event.object.vid)
			if vs.count() > 0:
				event.object.venue = vs[0]
			event.save()
		# if event already exists, run a diff and check
	return HttpResponse("Data Added")
