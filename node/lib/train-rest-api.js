
// API implementation

var common = require('./common')

var uuid    = common.uuid
var mongodb = common.mongodb


var todocoll = null
var listcoll = null
var photocoll = null

var util = {}

util.validate = function( input ) {
  return input.destination
}

util.validatelist = function( input ) {
  return input.listtext
}

util.fixid = function( doc ) {
  if( doc._id ) {
    doc.id = doc._id.toString()
    delete doc._id
  }
  else if( doc.id ) {
    doc._id = new mongodb.ObjectID(doc.id)
    delete doc.id
  }
  return doc
}


exports.ping = function( req, res ) {
  var output = {ok:true,time:new Date()}
  res.sendjson$( output )
}


exports.echo = function( req, res ) {
  var output = req.query

  if( 'POST' == req.method ) {
    output = req.body
  }

  res.sendjson$( output )
}


exports.rest = {

  create: function( req, res ) {
    var input = req.body
    
    if( !util.validate(input) ) {
      return res.send$(400, 'qinvalid')
    }

    var todo = {
      destination: input.destination,
      done: input.done, 
	  swipeon: input.swipeon, 
	  listid: input.listid, 
	  route: input.route, 
	  time: input.time
    }

   
   
    todocoll.insert(todo, res.err$(function( docs ){
     var output = util.fixid( docs[0] )
	
     res.sendjson$( output )
    }))
   
   
   
  },


createlist: function( req, res ) {
    var input = req.body
    
    if( !util.validatelist(input) ) {
      return res.send$(400, 'qinvalid')
    }

    var list = {
      listtext: input.listtext,
      
    }

    listcoll.save(list, res.err$(function( docs ){
     var output = util.fixid( docs[0] )
	
     res.sendjson$( output )
    }))
  },
  
  createphoto: function( req, res ) {
    var input = req.body
    
    if( !util.validatelist(input) ) {
      return res.send$(400, 'qinvalid')
    }

    var photo = {
      filename: input.filename, station: input.station
      
    }

    photocoll.save(photo, res.err$(function( docs ){
     var output = util.fixid( docs[0] )
	
     res.sendjson$( output )
    }))
  },
  

  read: function( req, res ) {
    var input = req.params

    console.log(req.params)

    var query = util.fixid( {id:input.id} )
    todocoll.findOne( query, res.err$( function( doc ) {
      if( doc ) {
        var output = util.fixid( doc )
        res.sendjson$( output )
      }
      else {
        res.send$(404,'read not found')
      }
    }))
  },


 readlist: function( req, res ) {
    var input = req.params

    console.log(req.params)

    var query = util.fixid( {id:input.id} )
    todocoll.findOne( query, res.err$( function( doc ) {
      if( doc ) {
        var output = util.fixid( doc )
        res.sendjson$( output )
      }
      else {
        res.send$(404,'read not found')
      }
    }))
  },



  list: function( req, res ) {
    var input = req.query
    var output = []

    var query   = {}
    var options = {sort:[['created','desc']]}

    todocoll.find( query, options, res.err$( function( cursor ) {
      cursor.toArray( res.err$( function( docs ) {
        output = docs
        output.forEach(function(item){
          util.fixid(item)
        })
        res.sendjson$( output )
      }))
    }))
  },
  
  listphotos: function( req, res ) {
    var input = req.query
    var output = []

    var query   = {}
    var options = {sort:[['created','desc']]}

    photocoll.find( query, options, res.err$( function( cursor ) {
      cursor.toArray( res.err$( function( docs ) {
        output = docs
        output.forEach(function(photo){
          util.fixid(photo)
        })
        res.sendjson$( output )
      }))
    }))
  },
  
  
  
  listlists: function( req, res ) {
	 /* 
	var request = require('request');
	var fs = require('fs');
	var fsb = require('fs');
	var xml2js = require('xml2js');
	var options = {
    object: false,
    reversible: false,
    coerce: true,
    sanitize: false,
    trim: true 
};
	//var fileStream = fs

request('http://api.irishrail.ie/realtime/realtime.asmx/getAllStationsXML', function (error, response, body) {
  if (!error && response.statusCode == 200) {
    console.log(body) // Print the google web page.
	var parser = require('xml2json');
	var json = parser.toJson(body, options); //returns a string containing the JSON structure by default
	console.log(json);
	stationcoll.save(json, res.err$(function( docs ){
     res.sendjson$(JSON.stringify(json))
	console.log('Done');
     
    }))
  }
})


request('http://api.irishrail.ie/realtime/realtime.asmx/getAllStationsXML', function (error, response, body) {
  if (!error && response.statusCode == 200) {
    console.log(body) // Print the google web page.
  }
}).pipe(fs.createWriteStream('stations.xml'))


var parser = new xml2js.Parser();
fsb.readFile('stations.xml', function(err, data) {
    parser.parseString(data, function (err, result) {
        console.dir(result);
		 //res.sendjson$(JSON.stringify(result))
        
		stationcoll.save(result, res.err$(function( docs ){
     res.sendjson$(JSON.stringify(result))
	console.log('Done');
     
    }))
    });
});*/

 


  
    var input = req.query
    var output = []

    var query   = {}
    var options = {sort:[['created','desc']]}

    listcoll.find( query, options, res.err$( function( cursor ) {
      cursor.toArray( res.err$( function( docs ) {
        output = docs
        output.forEach(function(list){
          util.fixid(list)
        })
      
	    res.sendjson$( output )
      }))
    }))
  },


  update: function( req, res ) {
    var id    = req.params.id
    var input = req.body
    
    if( !util.validate(input) ) {
      return res.send$(400, 'invalid')
    }

    var query = util.fixid( {id:input.id} )
    todocoll.update( query, {$set:{destination:input.destination, done:input.done, swipeon:input.swipeon, listid:input.listid, route:input.route, time:input.time}}, res.err$( function( count ) {
      if( 0 < count ) {
        var output = util.fixid( docs[0] )
        res.sendjson$( output )
      }
      else {
        console.log('404')
        res.send$(404,'update item not found')
		
      }
    }))
  },
  
   updatelist: function( req, res ) {
    var id    = req.params.id
    var input = req.body
    
    if( !util.validate(input) ) {
      return res.send$(400, 'invalid')
    }

    var query = util.fixid( {id:input.id} )
    listcoll.update( query, {$set:{listtext:input.listtext}}, res.err$( function( count ) {
      if( 0 < count ) {
        var output = util.fixid( doc )
        res.sendjson$( output )
      }
      else {
        console.log('404')
        res.send$(404,'update list not found')
      }
    }))
  },
  


  del: function( req, res ) {
    var input = req.params

    var query = util.fixid( {id:input.id} )
    todocoll.remove( query, res.err$( function() {
      var output = {}
      res.sendjson$( output )
    }))
  },
  
  dellist: function( req, res ) {
    var input = req.params

    var query = util.fixid( {id:input.id} )
    listcoll.remove( query, res.err$( function() {
      var output = {}
      res.sendjson$( output )
    }))
  }
  
  

}



exports.connect = function(options,callback) {
  var client = new mongodb.Db( options.name, new mongodb.Server(options.server, options.port, {}))
  client.open( function( err, client ) {
    if( err ) return callback(err);

    client.collection( 'todo', function( err, collection ) {
      if( err ) return callback(err);

      todocoll = collection
      callback()
    }
	
	
	)
	client.collection( 'list', function( err, collection ) {
      if( err ) return callback(err);

      listcoll = collection
      callback()
    }
	
	
	)
	
	client.collection( 'photo', function( err, collection ) {
      if( err ) return callback(err);

      photocoll = collection
      callback()
    }
	
	
	)
	
	
	
  })
  
  
}
