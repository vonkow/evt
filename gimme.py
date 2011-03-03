from httplib import *
o = open('test_real.data', 'w')
h = HTTPConnection('calendar.boston.com', 80)
h.request("GET", "/json?search=true&limit=200")
a = h.getresponse()
print a.status, a.reason
data = a.read()
o.write(data)
print data
