from evt.evts.models import Event, EType, Venue, VType, UserProfile, Tag, EventTag, VenueTag, UserTag, UserFriend, Attending
from django.contrib import admin

admin.site.register(Event)
admin.site.register(EType)
admin.site.register(Venue)
admin.site.register(VType)
admin.site.register(UserProfile)
admin.site.register(Tag)
admin.site.register(EventTag)
admin.site.register(VenueTag)
admin.site.register(UserTag)
admin.site.register(UserFriend)
admin.site.register(Attending)
