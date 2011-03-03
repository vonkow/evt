import json

def parseMonth(month):
	if month == 'Jan':
		return '01'
	elif month == 'Feb':
		return '02'
	elif month == 'Mar':
		return '03'
	elif month == 'Apr':
		return '04'
	elif month == 'May':
		return '05'
	elif month == 'Jun':
		return '06'
	elif month == 'Jul':
		return '07'
	elif month == 'Aug':
		return '08'
	elif month == 'Sep':
		return '09'
	elif month == 'Oct':
		return '10'
	elif month == 'Nov':
		return '11'
	elif month == 'Dec':
		return '12'

def doIt():
	inp = open("/home/vonkow/webapps/evt/evt/evts/test_real.data", "r")
	i = inp.read()
	inp.close()
	j = json.loads(i)
	print j['rsp']['content']['event_count']
	events = j['rsp']['content']['events']
	venues = j['rsp']['content']['venues']
	pro_events = []
	pro_venues = []
	for event in events:
		# Need to format as serializable object
		print event['startTime']
		print type(event['startTime'])
		startT = str(event['startTime'])
		sT = None
		startT = startT.rsplit()
		print startT
		if len(startT) == 6:
			sT = startT[5]
			sT = sT+'-'+parseMonth(startT[1])
			sT = sT+'-'+startT[2]
			sT = sT+' '+startT[3]
		print sT
		print event['endTime']
		print type(event['endTime'])
		endT = str(event['endTime'])
		eT = None
		endT = endT.rsplit()
		if len(endT) == 6:
			eT = endT[5]
			eT = eT+'-'+parseMonth(endT[1])
			eT = eT+'-'+endT[2]
			eT = eT+' '+endT[3]
		print eT
		pro_events.append({
			"model":"evts.Event",
			"pk":None,
			"fields": {
				'name':event['name'],
				'venue':None,
				'vid': event['vid'],
				'description':event['description'],
				'startTime':sT,
				'endTime':eT,
				'phone':event['phone'],
				'price':event['price'],
				'url':event['url'],
				'z_id':event['id'],
			}
		})
	print pro_events[0]['fields']['name']
	for venue in venues:
		pro_venues.append({
			"model":"evts.Venue",
			"pk":None,
			"fields": {
				'name':venue['name'],
				'description':venue['description'],
				'address':venue['address'],
				'city':venue['city'],
				'state':venue['state'],
				'zip':venue['zip'],
				'country':venue['country'],
				'latitude':venue['latitude'],
				'longitude':venue['longitude'],
				'url':venue['url'],
				'z_id':venue['id'],
			}
		})
	return {'venues':json.dumps(pro_venues),'events':json.dumps(pro_events)}
