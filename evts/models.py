from django.db import models
from django.contrib.auth.models import User
from datetime import datetime, timedelta

class UserProfile(models.Model):
	user = models.ForeignKey(User, unique=True)
	joinDate = models.DateTimeField(default=datetime.now())
	twitter = models.CharField(max_length=140)
	description = models.TextField()
	def __unicode__(self):
		return self.user.username

class VType(models.Model):
	name = models.CharField(max_length=255)
	def __unicode__(self):
		return self.name

class Venue(models.Model):
	name = models.CharField(max_length=255)
	vtype = models.ForeignKey(VType, null=True, blank=True)
	description = models.TextField()
	address = models.CharField(max_length=255)
	city = models.CharField(max_length=255)
	state = models.CharField(max_length=255)
	zip = models.CharField(max_length=255)
	country = models.CharField(max_length=255)
	latitude = models.FloatField()
	longitude = models.FloatField()
	url = models.CharField(max_length=255)
	z_id = models.IntegerField() # This is the zvent id
	# types MUST BE LINK TO TYPES SUCH AS "Theater, Bar, etc"
	def __unicode__(self):
		return self.name

class EType(models.Model):
	name = models.CharField(max_length=255)
	def __unicode__(self):
		return self.name

class Event(models.Model):
	name = models.CharField(max_length=255)
	venue = models.ForeignKey(Venue, null=True, blank=True)
	etype = models.ForeignKey(EType, null=True, blank=True)
	description = models.TextField()
	startTime = models.DateTimeField(null=True, blank=True)
	endTime = models.DateTimeField(null=True, blank=True)
	phone = models.CharField(max_length=255)
	price = models.CharField(max_length=255)
	url = models.CharField(max_length=255)
	vid = models.IntegerField()
	z_id = models.IntegerField() # This is the zvent id
	def __unicode__(self):
		return self.name

class Tag(models.Model):
	name = models.CharField(max_length=255)
	def __unicode__(self):
		return self.name

class EventTag(models.Model):
	event = models.ForeignKey(Event)
	tag = models.ForeignKey(Tag)
	def __unicode__(self):
		return u'%s - %s' % (self.event.name, self.tag.name)

class VenueTag(models.Model):
	venue = models.ForeignKey(Venue)
	tag = models.ForeignKey(Tag)
	def __unicode__(self):
		return u'%s - %s' % (self.venue.name, self.tag.name)

class UserTag(models.Model):
	user = models.ForeignKey(User)
	tag = models.ForeignKey(Tag)
	def __unicode__(self):
		return u'%s - %s' % (self.user.username, self.tag.name)

class UserFriend(models.Model):
	user = models.ForeignKey(User)
	friend = models.ForeignKey(User, related_name="+")
	def __unicode__(self):
		return u'%s - %s' % (self.user.username, self.friend.username)

class Attending(models.Model):
	user = models.ForeignKey(User)
	event = models.ForeignKey(Event)
	def __unicode__(self):
		return u'%s - %s' % (self.event.name, self.user.username)
