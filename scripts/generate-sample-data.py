#!/usr/bin/env python3
"""Generate sample-data.json for WC2026 redesign spikes."""
import json

teams = [
  {"id":"MEX","name":"Mexico","nameZh":"墨西哥","group":"A","ranking":15,"continent":"North America","flag":"🇲🇽"},
  {"id":"RSA","name":"South Africa","nameZh":"南非","group":"A","ranking":60,"continent":"Africa","flag":"🇿🇦"},
  {"id":"KOR","name":"South Korea","nameZh":"南韓","group":"A","ranking":23,"continent":"Asia","flag":"🇰🇷"},
  {"id":"CZE","name":"Czech Republic","nameZh":"捷克","group":"A","ranking":36,"continent":"Europe","flag":"🇨🇿"},
  {"id":"CAN","name":"Canada","nameZh":"加拿大","group":"B","ranking":48,"continent":"North America","flag":"🇨🇦"},
  {"id":"BIH","name":"Bosnia & Herzegovina","nameZh":"波斯尼亞","group":"B","ranking":57,"continent":"Europe","flag":"🇧🇦"},
  {"id":"QAT","name":"Qatar","nameZh":"卡塔爾","group":"B","ranking":34,"continent":"Asia","flag":"🇶🇦"},
  {"id":"SUI","name":"Switzerland","nameZh":"瑞士","group":"B","ranking":19,"continent":"Europe","flag":"🇨🇭"},
  {"id":"BRA","name":"Brazil","nameZh":"巴西","group":"C","ranking":5,"continent":"South America","flag":"🇧🇷"},
  {"id":"MAR","name":"Morocco","nameZh":"摩洛哥","group":"C","ranking":13,"continent":"Africa","flag":"🇲🇦"},
  {"id":"HAI","name":"Haiti","nameZh":"海地","group":"C","ranking":90,"continent":"North America","flag":"🇭🇹"},
  {"id":"SCO","name":"Scotland","nameZh":"蘇格蘭","group":"C","ranking":39,"continent":"Europe","flag":"🏴󠁧󠁢󠁳󠁣󠁴󠁿"},
  {"id":"USA","name":"USA","nameZh":"美國","group":"D","ranking":16,"continent":"North America","flag":"🇺🇸"},
  {"id":"PAR","name":"Paraguay","nameZh":"巴拉圭","group":"D","ranking":51,"continent":"South America","flag":"🇵🇾"},
  {"id":"AUS","name":"Australia","nameZh":"澳洲","group":"D","ranking":27,"continent":"Asia","flag":"🇦🇺"},
  {"id":"TUR","name":"Turkey","nameZh":"土耳其","group":"D","ranking":29,"continent":"Europe","flag":"🇹🇷"},
  {"id":"GER","name":"Germany","nameZh":"德國","group":"E","ranking":11,"continent":"Europe","flag":"🇩🇪"},
  {"id":"CUW","name":"Curaçao","nameZh":"古拉索","group":"E","ranking":86,"continent":"North America","flag":"🇨🇼"},
  {"id":"CIV","name":"Ivory Coast","nameZh":"科特迪瓦","group":"E","ranking":42,"continent":"Africa","flag":"🇨🇮"},
  {"id":"ECU","name":"Ecuador","nameZh":"厄瓜多爾","group":"E","ranking":32,"continent":"South America","flag":"🇪🇨"},
  {"id":"NED","name":"Netherlands","nameZh":"荷蘭","group":"F","ranking":7,"continent":"Europe","flag":"🇳🇱"},
  {"id":"JPN","name":"Japan","nameZh":"日本","group":"F","ranking":18,"continent":"Asia","flag":"🇯🇵"},
  {"id":"SWE","name":"Sweden","nameZh":"瑞典","group":"F","ranking":25,"continent":"Europe","flag":"🇸🇪"},
  {"id":"TUN","name":"Tunisia","nameZh":"突尼西亞","group":"F","ranking":30,"continent":"Africa","flag":"🇹🇳"},
  {"id":"BEL","name":"Belgium","nameZh":"比利時","group":"G","ranking":6,"continent":"Europe","flag":"🇧🇪"},
  {"id":"EGY","name":"Egypt","nameZh":"埃及","group":"G","ranking":33,"continent":"Africa","flag":"🇪🇬"},
  {"id":"IRN","name":"Iran","nameZh":"伊朗","group":"G","ranking":21,"continent":"Asia","flag":"🇮🇷"},
  {"id":"NZL","name":"New Zealand","nameZh":"新西蘭","group":"G","ranking":104,"continent":"Oceania","flag":"🇳🇿"},
  {"id":"ESP","name":"Spain","nameZh":"西班牙","group":"H","ranking":8,"continent":"Europe","flag":"🇪🇸"},
  {"id":"CPV","name":"Cape Verde","nameZh":"佛得角","group":"H","ranking":67,"continent":"Africa","flag":"🇨🇻"},
  {"id":"KSA","name":"Saudi Arabia","nameZh":"沙特阿拉伯","group":"H","ranking":53,"continent":"Asia","flag":"🇸🇦"},
  {"id":"URU","name":"Uruguay","nameZh":"烏拉圭","group":"H","ranking":14,"continent":"South America","flag":"🇺🇾"},
  {"id":"FRA","name":"France","nameZh":"法國","group":"I","ranking":2,"continent":"Europe","flag":"🇫🇷"},
  {"id":"SEN","name":"Senegal","nameZh":"塞內加爾","group":"I","ranking":20,"continent":"Africa","flag":"🇸🇳"},
  {"id":"IRQ","name":"Iraq","nameZh":"伊拉克","group":"I","ranking":68,"continent":"Asia","flag":"🇮🇶"},
  {"id":"NOR","name":"Norway","nameZh":"挪威","group":"I","ranking":44,"continent":"Europe","flag":"🇳🇴"},
  {"id":"ARG","name":"Argentina","nameZh":"阿根廷","group":"J","ranking":1,"continent":"South America","flag":"🇦🇷"},
  {"id":"ALG","name":"Algeria","nameZh":"阿爾及利亞","group":"J","ranking":31,"continent":"Africa","flag":"🇩🇿"},
  {"id":"AUT","name":"Austria","nameZh":"奧地利","group":"J","ranking":24,"continent":"Europe","flag":"🇦🇹"},
  {"id":"JOR","name":"Jordan","nameZh":"約旦","group":"J","ranking":70,"continent":"Asia","flag":"🇯🇴"},
  {"id":"POR","name":"Portugal","nameZh":"葡萄牙","group":"K","ranking":4,"continent":"Europe","flag":"🇵🇹"},
  {"id":"COD","name":"DR Congo","nameZh":"剛果民主共和國","group":"K","ranking":63,"continent":"Africa","flag":"🇨🇩"},
  {"id":"UZB","name":"Uzbekistan","nameZh":"烏茲別克","group":"K","ranking":74,"continent":"Asia","flag":"🇺🇿"},
  {"id":"COL","name":"Colombia","nameZh":"哥倫比亞","group":"K","ranking":9,"continent":"South America","flag":"🇨🇴"},
  {"id":"ENG","name":"England","nameZh":"英格蘭","group":"L","ranking":3,"continent":"Europe","flag":"🏴󠁧󠁢󠁥󠁮󠁧󠁿"},
  {"id":"CRO","name":"Croatia","nameZh":"克羅地亞","group":"L","ranking":10,"continent":"Europe","flag":"🇭🇷"},
  {"id":"GHA","name":"Ghana","nameZh":"加納","group":"L","ranking":61,"continent":"Africa","flag":"🇬🇭"},
  {"id":"PAN","name":"Panama","nameZh":"巴拿馬","group":"L","ranking":46,"continent":"North America","flag":"🇵🇦"},
]

groups = [
  {"id":"A","teams":["MEX","RSA","KOR","CZE"]},
  {"id":"B","teams":["CAN","BIH","QAT","SUI"]},
  {"id":"C","teams":["BRA","MAR","HAI","SCO"]},
  {"id":"D","teams":["USA","PAR","AUS","TUR"]},
  {"id":"E","teams":["GER","CUW","CIV","ECU"]},
  {"id":"F","teams":["NED","JPN","SWE","TUN"]},
  {"id":"G","teams":["BEL","EGY","IRN","NZL"]},
  {"id":"H","teams":["ESP","CPV","KSA","URU"]},
  {"id":"I","teams":["FRA","SEN","IRQ","NOR"]},
  {"id":"J","teams":["ARG","ALG","AUT","JOR"]},
  {"id":"K","teams":["POR","COD","UZB","COL"]},
  {"id":"L","teams":["ENG","CRO","GHA","PAN"]},
]

stadiums = [
  {"id":"mexico_city","name":"Estadio Azteca","city":"Mexico City","country":"Mexico","capacity":87523},
  {"id":"guadalajara","name":"Estadio Guadalajara","city":"Guadalajara","country":"Mexico","capacity":46632},
  {"id":"monterrey","name":"Estadio BBVA","city":"Monterrey","country":"Mexico","capacity":53500},
  {"id":"toronto","name":"BMO Field","city":"Toronto","country":"Canada","capacity":30991},
  {"id":"vancouver","name":"BC Place","city":"Vancouver","country":"Canada","capacity":54500},
  {"id":"los_angeles","name":"SoFi Stadium","city":"Los Angeles","country":"USA","capacity":70240},
  {"id":"new_york","name":"MetLife Stadium","city":"New York/New Jersey","country":"USA","capacity":82500},
  {"id":"dallas","name":"AT&T Stadium","city":"Dallas","country":"USA","capacity":80000},
  {"id":"kansas_city","name":"Arrowhead Stadium","city":"Kansas City","country":"USA","capacity":76416},
  {"id":"houston","name":"NRG Stadium","city":"Houston","country":"USA","capacity":72220},
  {"id":"atlanta","name":"Mercedes-Benz Stadium","city":"Atlanta","country":"USA","capacity":71000},
  {"id":"philadelphia","name":"Lincoln Financial Field","city":"Philadelphia","country":"USA","capacity":69596},
  {"id":"seattle","name":"Lumen Field","city":"Seattle","country":"USA","capacity":69000},
  {"id":"san_francisco","name":"Levi's Stadium","city":"San Francisco Bay Area","country":"USA","capacity":68500},
  {"id":"boston","name":"Gillette Stadium","city":"Boston","country":"USA","capacity":65878},
  {"id":"miami","name":"Hard Rock Stadium","city":"Miami","country":"USA","capacity":65326},
]

def m(id, round, date, time, timeUtc, t1, t2, group, ground, num, stage, s1=None, s2=None, goals=None):
    d = {"id":id,"round":round,"date":date,"time":time,"timeUtc":timeUtc,"team1Id":t1,"team2Id":t2,"group":group,"groundId":ground,"num":num,"stage":stage}
    if s1 is not None: d["score1"]=s1; d["score2"]=s2
    if goals: d["goals"]=goals
    return d

def g(minute, scorer, teamId, penalty=None, ownGoal=None, stoppageTime=None):
    d = {"minute":minute,"scorer":scorer,"teamId":teamId}
    if penalty: d["penalty"]=True
    if ownGoal: d["ownGoal"]=True
    if stoppageTime is not None: d["stoppageTime"]=stoppageTime
    return d

matches = [
  m(1,"Matchday 1","2026-06-11","03:00","19:00","MEX","RSA","A","mexico_city",1,"group",2,0,[g(9,"Julián Quiñones","MEX"),g(67,"Raúl Jiménez","MEX")]),
  m(2,"Matchday 1","2026-06-12","10:00","02:00","KOR","CZE","A","guadalajara",2,"group",2,1,[g(59,"Ladislav Krejcí","CZE"),g(67,"Hwang In-Beom","KOR"),g(80,"Oh Hyeon-Gyu","KOR")]),
  m(3,"Matchday 8","2026-06-18","00:00","16:00","CZE","RSA","A","atlanta",3,"group",1,1,[g(6,"Michal Sadílek","CZE"),g(83,"Teboho Mokoena","RSA",penalty=True)]),
  m(4,"Matchday 8","2026-06-19","09:00","01:00","MEX","KOR","A","guadalajara",4,"group",1,0,[g(50,"Luis Romo","MEX")]),
  m(5,"Matchday 14","2026-06-25","09:00","01:00","CZE","MEX","A","mexico_city",5,"group"),
  m(6,"Matchday 14","2026-06-25","09:00","01:00","RSA","KOR","A","monterrey",6,"group"),
  m(7,"Matchday 2","2026-06-12","03:00","19:00","CAN","BIH","B","toronto",7,"group",1,1,[g(21,"Jovo Lukić","BIH"),g(78,"Cyle Larin","CAN")]),
  m(8,"Matchday 3","2026-06-13","03:00","19:00","QAT","SUI","B","san_francisco",8,"group",1,1,[g(17,"Breel Embolo","SUI",penalty=True),g(90,"Miro Muheim","QAT",ownGoal=True,stoppageTime=4)]),
  m(9,"Matchday 8","2026-06-18","03:00","19:00","SUI","BIH","B","los_angeles",9,"group",4,1,[g(74,"Johan Manzambi","SUI"),g(84,"Rubén Vargas","SUI"),g(90,"Johan Manzambi","SUI"),g(90,"Ermin Mahmic","BIH",stoppageTime=3),g(90,"Granit Xhaka","SUI",penalty=True,stoppageTime=7)]),
  m(10,"Matchday 8","2026-06-18","06:00","22:00","CAN","QAT","B","vancouver",10,"group",6,0,[g(16,"Cyle Larin","CAN"),g(29,"Jonathan David","CAN"),g(45,"Jonathan David","CAN",stoppageTime=3),g(64,"Nathan Saliba","CAN"),g(75,"Mohamed Manai","CAN",ownGoal=True),g(90,"Jonathan David","CAN",stoppageTime=2)]),
  m(11,"Matchday 14","2026-06-24","03:00","19:00","SUI","CAN","B","vancouver",11,"group"),
  m(12,"Matchday 14","2026-06-24","03:00","19:00","BIH","QAT","B","seattle",12,"group"),
  m(13,"Matchday 3","2026-06-13","06:00","22:00","BRA","MAR","C","new_york",13,"group",1,1,[g(21,"Ismael Saibari","MAR"),g(32,"Vinícius Júnior","BRA")]),
  m(14,"Matchday 3","2026-06-14","09:00","01:00","HAI","SCO","C","boston",14,"group",0,1,[g(28,"John McGinn","SCO")]),
  m(15,"Matchday 9","2026-06-19","06:00","22:00","SCO","MAR","C","boston",15,"group",0,1,[g(2,"Ismael Saibari","MAR")]),
  m(16,"Matchday 9","2026-06-20","08:30","00:30","BRA","HAI","C","philadelphia",16,"group",3,0,[g(23,"Matheus Cunha","BRA"),g(36,"Matheus Cunha","BRA"),g(45,"Vinícius Júnior","BRA",stoppageTime=3)]),
  m(17,"Matchday 14","2026-06-24","06:00","22:00","SCO","BRA","C","miami",17,"group"),
  m(18,"Matchday 14","2026-06-24","06:00","22:00","MAR","HAI","C","atlanta",18,"group"),
  m(19,"Matchday 2","2026-06-13","09:00","01:00","USA","PAR","D","los_angeles",19,"group",4,1,[g(7,"Damian Bobadilla","USA",ownGoal=True),g(31,"Folarin Balogun","USA"),g(45,"Folarin Balogun","USA",stoppageTime=5),g(73,"Mauricio","PAR"),g(90,"Giovanni Reyna","USA",stoppageTime=8)]),
  m(20,"Matchday 3","2026-06-14","12:00","04:00","AUS","TUR","D","vancouver",20,"group",2,0,[g(27,"Nestory Irankunda","AUS"),g(75,"Connor Metcalfe","AUS")]),
  m(21,"Matchday 9","2026-06-19","03:00","19:00","USA","AUS","D","seattle",21,"group",2,0,[g(11,"Cameron Burgess","USA",ownGoal=True),g(43,"Alex Freeman","USA")]),
  m(22,"Matchday 9","2026-06-20","11:00","03:00","TUR","PAR","D","san_francisco",22,"group",0,1,[g(2,"Matías Galarza","PAR")]),
  m(23,"Matchday 15","2026-06-26","10:00","02:00","TUR","USA","D","los_angeles",23,"group"),
  m(24,"Matchday 15","2026-06-26","10:00","02:00","PAR","AUS","D","san_francisco",24,"group"),
  m(25,"Matchday 4","2026-06-14","01:00","17:00","GER","CUW","E","houston",25,"group",7,1,[g(6,"Felix Nmecha","GER"),g(21,"Livano Comenencia","CUW"),g(38,"Nico Schlotterbeck","GER"),g(45,"Kai Havertz","GER",penalty=True,stoppageTime=5),g(47,"Jamal Musiala","GER"),g(68,"Nathaniel Brown","GER"),g(78,"Deniz Undav","GER"),g(88,"Kai Havertz","GER")]),
  m(26,"Matchday 4","2026-06-14","07:00","23:00","CIV","ECU","E","philadelphia",26,"group",1,0,[g(90,"Amad Diallo","CIV")]),
  m(27,"Matchday 10","2026-06-20","04:00","20:00","GER","CIV","E","toronto",27,"group",2,1,[g(30,"Franck Kessié","CIV"),g(68,"Deniz Undav","GER"),g(90,"Deniz Undav","GER",stoppageTime=4)]),
  m(28,"Matchday 10","2026-06-21","08:00","00:00","ECU","CUW","E","kansas_city",28,"group",0,0),
  m(29,"Matchday 15","2026-06-25","04:00","20:00","CUW","CIV","E","philadelphia",29,"group"),
  m(30,"Matchday 15","2026-06-25","04:00","20:00","ECU","GER","E","new_york",30,"group"),
  m(31,"Matchday 4","2026-06-14","04:00","20:00","NED","JPN","F","dallas",31,"group",2,2,[g(51,"Virgil van Dijk","NED"),g(57,"Keito Nakamura","JPN"),g(64,"Crysencio Summerville","NED"),g(88,"Daichi Kamada","JPN")]),
  m(32,"Matchday 4","2026-06-15","10:00","02:00","SWE","TUN","F","monterrey",32,"group",5,1,[g(7,"Yasin Ayari","SWE"),g(30,"Alexander Isak","SWE"),g(43,"Omar Rekik","TUN"),g(59,"Viktor Gyökeres","SWE"),g(84,"Mattias Svanberg","SWE"),g(90,"Yasin Ayari","SWE",stoppageTime=6)]),
  m(33,"Matchday 10","2026-06-20","01:00","17:00","NED","SWE","F","houston",33,"group",5,1,[g(5,"Brian Brobbey","NED"),g(17,"Brian Brobbey","NED"),g(47,"Cody Gakpo","NED"),g(54,"Cody Gakpo","NED"),g(59,"Anthony Elanga","SWE"),g(89,"Crysencio Summerville","NED")]),
  m(34,"Matchday 10","2026-06-21","12:00","04:00","TUN","JPN","F","monterrey",34,"group",0,4,[g(4,"Daichi Kamada","JPN"),g(31,"Ayase Ueda","JPN"),g(69,"Junya Ito","JPN"),g(83,"Ayase Ueda","JPN")]),
  m(35,"Matchday 15","2026-06-25","07:00","23:00","JPN","SWE","F","dallas",35,"group"),
  m(36,"Matchday 15","2026-06-25","07:00","23:00","TUN","NED","F","kansas_city",36,"group"),
  m(37,"Matchday 5","2026-06-15","03:00","19:00","BEL","EGY","G","seattle",37,"group",1,1,[g(19,"Emam Ashour","EGY"),g(66,"Mohamed Hany","BEL",ownGoal=True)]),
  m(38,"Matchday 5","2026-06-16","09:00","01:00","IRN","NZL","G","los_angeles",38,"group",2,2,[g(7,"Elijah Just","NZL"),g(32,"Ramin Rezaeian","IRN"),g(54,"Elijah Just","NZL"),g(64,"Mohammad Mohebbi","IRN")]),
  m(39,"Matchday 11","2026-06-21","03:00","19:00","BEL","IRN","G","los_angeles",39,"group",0,0),
  m(40,"Matchday 11","2026-06-22","09:00","01:00","NZL","EGY","G","vancouver",40,"group",1,3,[g(15,"Finn Surman","NZL"),g(58,"Mostafa Zico","EGY"),g(67,"Mohamed Salah","EGY"),g(82,"Trézéguet","EGY")]),
  m(41,"Matchday 16","2026-06-27","11:00","03:00","EGY","IRN","G","seattle",41,"group"),
  m(42,"Matchday 16","2026-06-27","11:00","03:00","NZL","BEL","G","vancouver",42,"group"),
  m(43,"Matchday 5","2026-06-15","00:00","16:00","ESP","CPV","H","atlanta",43,"group",0,0),
  m(44,"Matchday 5","2026-06-15","06:00","22:00","KSA","URU","H","miami",44,"group",1,1,[g(41,"Abdulelah Al-Amri","KSA"),g(80,"Maxi Araújo","URU")]),
  m(45,"Matchday 11","2026-06-21","00:00","16:00","ESP","KSA","H","atlanta",45,"group",4,0,[g(10,"Lamine Yamal","ESP"),g(21,"Mikel Oyarzabal","ESP"),g(24,"Mikel Oyarzabal","ESP"),g(49,"Hassan Al-Tambakti","ESP",ownGoal=True)]),
  m(46,"Matchday 11","2026-06-21","06:00","22:00","URU","CPV","H","miami",46,"group",2,2,[g(21,"Kevin Pina","CPV"),g(44,"Maxi Araújo","URU"),g(45,"Agustín Cano","URU",stoppageTime=6),g(61,"Hélio Varela","CPV")]),
  m(47,"Matchday 16","2026-06-27","08:00","00:00","CPV","KSA","H","houston",47,"group"),
  m(48,"Matchday 16","2026-06-27","08:00","00:00","URU","ESP","H","guadalajara",48,"group"),
  m(49,"Matchday 6","2026-06-16","03:00","19:00","FRA","SEN","I","new_york",49,"group",3,1,[g(66,"Kylian Mbappé","FRA"),g(82,"Bradley Barcola","FRA"),g(90,"Ibrahim Mbaye","SEN",stoppageTime=5),g(90,"Kylian Mbappé","FRA",stoppageTime=6)]),
  m(50,"Matchday 6","2026-06-16","06:00","22:00","IRQ","NOR","I","boston",50,"group",1,4,[g(29,"Erling Haaland","NOR"),g(39,"Aymen Hussein","IRQ"),g(43,"Erling Haaland","NOR"),g(76,"Leo Østigard","NOR"),g(90,"Aymen Hussein","NOR",ownGoal=True,stoppageTime=6)]),
  m(51,"Matchday 12","2026-06-22","05:00","21:00","FRA","IRQ","I","philadelphia",51,"group",3,0,[g(14,"Kylian Mbappé","FRA"),g(54,"Kylian Mbappé","FRA"),g(66,"Ousmane Dembélé","FRA")]),
  m(52,"Matchday 12","2026-06-23","08:00","00:00","NOR","SEN","I","new_york",52,"group",3,2,[g(43,"Marcus Holmgren Pedersen","NOR"),g(48,"Erling Haaland","NOR"),g(53,"Ismaïla Sarr","SEN"),g(58,"Erling Haaland","NOR"),g(90,"Ismaïla Sarr","SEN",stoppageTime=3)]),
  m(53,"Matchday 16","2026-06-26","03:00","19:00","NOR","FRA","I","boston",53,"group"),
  m(54,"Matchday 16","2026-06-26","03:00","19:00","SEN","IRQ","I","toronto",54,"group"),
  m(55,"Matchday 6","2026-06-17","09:00","01:00","ARG","ALG","J","kansas_city",55,"group",3,0,[g(17,"Lionel Messi","ARG"),g(60,"Lionel Messi","ARG"),g(76,"Lionel Messi","ARG")]),
  m(56,"Matchday 6","2026-06-17","12:00","04:00","AUT","JOR","J","san_francisco",56,"group",3,1,[g(21,"Romano Schmid","AUT"),g(50,"Ali Olwan","JOR"),g(76,"Yazan Al-Arab","AUT",ownGoal=True),g(90,"Marko Arnautovic","AUT",penalty=True,stoppageTime=12)]),
  m(57,"Matchday 12","2026-06-22","01:00","17:00","ARG","AUT","J","dallas",57,"group",2,0,[g(38,"Lionel Messi","ARG"),g(90,"Lionel Messi","ARG",stoppageTime=5)]),
  m(58,"Matchday 12","2026-06-23","11:00","03:00","JOR","ALG","J","san_francisco",58,"group",1,2,[g(36,"Nizar Al-Rashdan","JOR"),g(69,"Nadhir Benbouali","ALG"),g(82,"Amine Gouiri","ALG")]),
  m(59,"Matchday 17","2026-06-28","10:00","02:00","ALG","AUT","J","kansas_city",59,"group"),
  m(60,"Matchday 17","2026-06-28","10:00","02:00","JOR","ARG","J","dallas",60,"group"),
  m(61,"Matchday 7","2026-06-17","01:00","17:00","POR","COD","K","houston",61,"group",1,1,[g(6,"João Neves","POR"),g(45,"Yoane Wissa","COD",stoppageTime=5)]),
  m(62,"Matchday 7","2026-06-18","10:00","02:00","UZB","COL","K","mexico_city",62,"group",1,3,[g(40,"Daniel Muñoz","COL"),g(60,"Abbosbek Fayzullaev","UZB"),g(65,"Luis Díaz","COL"),g(90,"Jáminton Campaz","COL",stoppageTime=9)]),
  m(63,"Matchday 13","2026-06-23","01:00","17:00","POR","UZB","K","houston",63,"group",5,0,[g(6,"Cristiano Ronaldo","POR"),g(17,"Nuno Mendes","POR"),g(39,"Cristiano Ronaldo","POR"),g(60,"Abduvohid Nematov","POR",ownGoal=True),g(87,"Rafael Leão","POR")]),
  m(64,"Matchday 13","2026-06-24","10:00","02:00","COL","COD","K","guadalajara",64,"group"),
  m(65,"Matchday 17","2026-06-27","07:30","23:30","COL","POR","K","miami",65,"group"),
  m(66,"Matchday 17","2026-06-27","07:30","23:30","COD","UZB","K","atlanta",66,"group"),
  m(67,"Matchday 7","2026-06-17","04:00","20:00","ENG","CRO","L","dallas",67,"group",4,2,[g(12,"Harry Kane","ENG",penalty=True),g(36,"Martin Baturina","CRO"),g(42,"Harry Kane","ENG"),g(45,"Petar Musa","CRO",stoppageTime=5),g(47,"Jude Bellingham","ENG"),g(85,"Marcus Rashford","ENG")]),
  m(68,"Matchday 7","2026-06-17","07:00","23:00","GHA","PAN","L","toronto",68,"group",1,0,[g(90,"Caleb Yirenkyi","GHA",stoppageTime=5)]),
  m(69,"Matchday 13","2026-06-23","04:00","20:00","ENG","GHA","L","boston",69,"group",0,0),
  m(70,"Matchday 13","2026-06-23","07:00","23:00","PAN","CRO","L","toronto",70,"group"),
  m(71,"Matchday 17","2026-06-27","05:00","21:00","PAN","ENG","L","new_york",71,"group"),
  m(72,"Matchday 17","2026-06-27","05:00","21:00","CRO","GHA","L","philadelphia",72,"group"),
  # R32
  m(73,"Round of 32","2026-06-28","03:00","19:00","2A","2B","","los_angeles",73,"r32"),
  m(74,"Round of 32","2026-06-29","04:30","20:30","GER","3A/B/C/D/F","","boston",74,"r32"),
  m(75,"Round of 32","2026-06-30","09:00","01:00","1F","2C","","monterrey",75,"r32"),
  m(76,"Round of 32","2026-06-29","01:00","17:00","1C","2F","","houston",76,"r32"),
  m(77,"Round of 32","2026-06-30","05:00","21:00","1I","3C/D/F/G/H","","new_york",77,"r32"),
  m(78,"Round of 32","2026-06-30","01:00","17:00","2E","2I","","dallas",78,"r32"),
  m(79,"Round of 32","2026-07-01","09:00","01:00","MEX","3C/E/F/H/I","","mexico_city",79,"r32"),
  m(80,"Round of 32","2026-07-01","00:00","16:00","1L","3E/H/I/J/K","","atlanta",80,"r32"),
  m(81,"Round of 32","2026-07-02","08:00","00:00","USA","3B/E/F/I/J","","san_francisco",81,"r32"),
  m(82,"Round of 32","2026-07-01","04:00","20:00","1G","3A/E/H/I/J","","seattle",82,"r32"),
  m(83,"Round of 32","2026-07-02","07:00","23:00","2K","2L","","toronto",83,"r32"),
  m(84,"Round of 32","2026-07-02","03:00","19:00","1H","2J","","los_angeles",84,"r32"),
  m(85,"Round of 32","2026-07-03","11:00","03:00","1B","3E/F/G/I/J","","vancouver",85,"r32"),
  m(86,"Round of 32","2026-07-03","06:00","22:00","1J","2H","","miami",86,"r32"),
  m(87,"Round of 32","2026-07-04","09:30","01:30","1K","3D/E/I/J/L","","kansas_city",87,"r32"),
  m(88,"Round of 32","2026-07-03","02:00","18:00","2D","2G","","dallas",88,"r32"),
  # R16
  m(89,"Round of 16","2026-07-04","05:00","21:00","W74","W77","","philadelphia",89,"r16"),
  m(90,"Round of 16","2026-07-04","01:00","17:00","W73","W75","","houston",90,"r16"),
  m(91,"Round of 16","2026-07-05","04:00","20:00","W76","W78","","new_york",91,"r16"),
  m(92,"Round of 16","2026-07-06","08:00","00:00","W79","W80","","mexico_city",92,"r16"),
  m(93,"Round of 16","2026-07-06","03:00","19:00","W83","W84","","dallas",93,"r16"),
  m(94,"Round of 16","2026-07-07","08:00","00:00","W81","W82","","seattle",94,"r16"),
  m(95,"Round of 16","2026-07-07","00:00","16:00","W86","W88","","atlanta",95,"r16"),
  m(96,"Round of 16","2026-07-07","04:00","20:00","W85","W87","","vancouver",96,"r16"),
  # QF
  m(97,"Quarter-final","2026-07-09","04:00","20:00","W89","W90","","boston",97,"qf"),
  m(98,"Quarter-final","2026-07-10","03:00","19:00","W93","W94","","los_angeles",98,"qf"),
  m(99,"Quarter-final","2026-07-11","05:00","21:00","W91","W92","","miami",99,"qf"),
  m(100,"Quarter-final","2026-07-12","09:00","01:00","W95","W96","","kansas_city",100,"qf"),
  # SF
  m(101,"Semi-final","2026-07-14","03:00","19:00","W97","W98","","dallas",101,"sf"),
  m(102,"Semi-final","2026-07-15","03:00","19:00","W99","W100","","atlanta",102,"sf"),
  # Third + Final
  m(103,"Match for third place","2026-07-18","05:00","21:00","L101","L102","","miami",103,"third"),
  m(104,"Final","2026-07-19","03:00","19:00","W101","W102","","new_york",104,"final"),
]

tournament_config = {
  "name": "2026 FIFA World Cup",
  "teamCount": 48,
  "groupCount": 12,
  "teamsPerGroup": 4,
  "qualifyDirect": 2,
  "bestThirdPlacedCount": 8,
  "roundOf32Teams": 32,
  "groupLabels": ["A","B","C","D","E","F","G","H","I","J","K","L"],
  "tiebreakers": ["h2h_points","h2h_gd","h2h_gf","group_gd","group_gf","fair_play","draw"],
  "phases": ["group","r32","r16","qf","sf","third","final"]
}

bracket_mapping = {
  "description": "R32 fixture to group position mapping. '1A'=group A winner, '2B'=group B runner-up, '3A/B/C/D'=best third-placed from listed groups. Real team IDs (GER, MEX, USA) = pre-qualified host slots.",
  "r32": [
    {"matchId":73,"team1":"2A","team2":"2B"},
    {"matchId":74,"team1":"GER","team2":"3A/B/C/D/F"},
    {"matchId":75,"team1":"1F","team2":"2C"},
    {"matchId":76,"team1":"1C","team2":"2F"},
    {"matchId":77,"team1":"1I","team2":"3C/D/F/G/H"},
    {"matchId":78,"team1":"2E","team2":"2I"},
    {"matchId":79,"team1":"MEX","team2":"3C/E/F/H/I"},
    {"matchId":80,"team1":"1L","team2":"3E/H/I/J/K"},
    {"matchId":81,"team1":"USA","team2":"3B/E/F/I/J"},
    {"matchId":82,"team1":"1G","team2":"3A/E/H/I/J"},
    {"matchId":83,"team1":"2K","team2":"2L"},
    {"matchId":84,"team1":"1H","team2":"2J"},
    {"matchId":85,"team1":"1B","team2":"3E/F/G/I/J"},
    {"matchId":86,"team1":"1J","team2":"2H"},
    {"matchId":87,"team1":"1K","team2":"3D/E/I/J/L"},
    {"matchId":88,"team1":"2D","team2":"2G"},
  ],
  "knockout_tree": {
    "r16":[
      {"matchId":89,"team1":"W74","team2":"W77"},
      {"matchId":90,"team1":"W73","team2":"W75"},
      {"matchId":91,"team1":"W76","team2":"W78"},
      {"matchId":92,"team1":"W79","team2":"W80"},
      {"matchId":93,"team1":"W83","team2":"W84"},
      {"matchId":94,"team1":"W81","team2":"W82"},
      {"matchId":95,"team1":"W86","team2":"W88"},
      {"matchId":96,"team1":"W85","team2":"W87"},
    ],
    "qf":[
      {"matchId":97,"team1":"W89","team2":"W90"},
      {"matchId":98,"team1":"W93","team2":"W94"},
      {"matchId":99,"team1":"W91","team2":"W92"},
      {"matchId":100,"team1":"W95","team2":"W96"},
    ],
    "sf":[
      {"matchId":101,"team1":"W97","team2":"W98"},
      {"matchId":102,"team1":"W99","team2":"W100"},
    ],
    "third":[{"matchId":103,"team1":"L101","team2":"L102"}],
    "final":[{"matchId":104,"team1":"W101","team2":"W102"}],
  }
}

data = {
  "tournament": tournament_config,
  "teams": teams,
  "groups": groups,
  "stadiums": stadiums,
  "matches": matches,
  "bracket": bracket_mapping,
  "generated_at": "2026-06-24",
  "description": "Raw static data for WC2026 redesign spikes. tournament config is reusable for future World Cups — just swap teams/groups/matches/bracket."
}

path = "C:/Users/andy/Documents/dev/ai/hermes/wc2026-redesign/sample-data.json"
with open(path, "w", encoding="utf-8") as f:
    json.dump(data, f, ensure_ascii=False, indent=2)

import os
fsize = os.path.getsize(path)
print(f"✅ Written {fsize:,} bytes to {path}")
print(f"   Teams: {len(teams)}, Groups: {len(groups)}, Stadiums: {len(stadiums)}")
print(f"   Group matches: {len([m for m in matches if m['stage']=='group'])}")
print(f"   Knockout matches: {len([m for m in matches if m['stage']!='group'])}")
print(f"   Total: {len(matches)} matches")
