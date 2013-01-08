



var i = 0

var app = {
  model: {},
  view: {},
  tabs: {
    sense:    { index:i++, icon:'73-radar', },
    capture:  { index:i++, icon:'33-cabinet', },
    storage:  { index:i++, icon:'86-camera', },
	status:   { index:i++, icon:'81-dashboard', },
    
    //phonegap: { index:i++, icon:'32-iphone', },
  },
  platform: /Android/.test(navigator.userAgent)?'android':'ios',
  initialtab: 'sense'
}

console.log(app)

_.templateSettings = {
  interpolate: /\{\{(.+?)\}\}/g,
  escape:      /\{\{-(.+?)\}\}/g,
  evaluate:    /\{\{=(.+?)\}\}/g
};

var bb = {
  model: {},
  view: {}
}


bb.init = function() {
	
	var scrollContent = {
    scroll: function() {
      var self = this
      setTimeout( function() {
        if( self.scroller ) {
          self.scroller.refresh()
        }
        else {
          self.scroller = new iScroll( $("div[id='timetablecontent']")[0] )
        }
      },1)
    }
  }
  
   var scrollListContent = {
    scroll: function() {
      var self = this
      setTimeout( function() {
        if( self.scroller ) {
          self.scroller.refresh()
        }
        else {
          self.scroller = new iScroll( $("div[id='listcontent']")[0] )
        }
      },1)
    }

  }
  
   var scrollPhotoContent = {
    scroll: function() {
      var self = this
      setTimeout( function() {
        if( self.scroller ) {
          self.scroller.refresh()
        }
        else {
          self.scroller = new iScroll( $("div[id='photocontent']")[0] )
        }
      },1)
    }

  }

  bb.model.State = Backbone.Model.extend({    
    defaults: {
      content: 'none',
	  currentlist:"list"
    },
  })
  
bb.model.Item = Backbone.Model.extend(_.extend({    
    defaults: {
      destination: '', done:false, swipeon:false, listid:"", route:"", time: ""
    },

    initialize: function() {
      var self = this
      _.bindAll(self)
    },
	
	toggle: function(){
		var self = this
		this.save({done: !this.get("done")});
	},
	
	toggleSwipe: function(){
		var self = this
		this.save({swipeon: !this.get("swipeon")});
	},
	
	
	
	clear: function() {
      this.destroy();
    }

  }))
  
  
  
  bb.model.Items = Backbone.Collection.extend(_.extend({    
    model: bb.model.Item,
   // localStorage: new Store("items"),
 	url: 'http://ec2-79-125-47-67.eu-west-1.compute.amazonaws.com/api/rest/service',
	
    initialize: function() {
      var self = this
      _.bindAll(self)
     self.count = 0

      self.on('reset',function() {
        self.count = self.length
      })
    },

    additem: function(textentered) {
      var self = this
	  
      var item = new bb.model.Item({
        itemtext: textentered, done:false, listid: app.model.state.get('currentlist')
      })
      self.add(item)
      self.count++
      item.save() 
	  
	  
    }

  }))
  
  bb.model.List = Backbone.Model.extend(_.extend({    
    defaults: {
      listtext: '', swipeon:false
    },
	

    initialize: function() {
      var self = this
      _.bindAll(self)
    },
	
	clear: function() {
      this.destroy();
	},
	
	toggleSwipe: function(){
		var self = this
		this.save({swipeon: !this.get("swipeon")});
	}

  }))
  
  
   bb.model.Lists = Backbone.Collection.extend(_.extend({    
    model: bb.model.List,
   // localStorage: new Store("lists")
   url: 'http://ec2-79-125-47-67.eu-west-1.compute.amazonaws.com/api/rest/station'
	,

    initialize: function() {
      var self = this
      _.bindAll(self)
    
    },

    addlist: function(textentered) {
      var self = this
	  
      var list = new bb.model.List({
        listtext: textentered
      })
      self.add(list)
      list.save() 
    }
	
	

  }))
  
   bb.model.Photo = Backbone.Model.extend(_.extend({    
    defaults: {
      filename: '100.jpg', station: 'Bray', swipeon:true
    },

    initialize: function() {
      var self = this
      _.bindAll(self)
    }
	
	

  }))
  
  bb.model.Photos = Backbone.Collection.extend(_.extend({    
    model: bb.model.Photo,
   // localStorage: new Store("lists")
   url: 'http://ec2-79-125-47-67.eu-west-1.compute.amazonaws.com/api/rest/photo'
	,

    initialize: function() {
      var self = this
      _.bindAll(self)
    
    },

    addphoto: function(name) {
      var self = this
	  var station = app.model.state.get('currentlist')
      var photo = new bb.model.Photo({
        filename: name, station: station
      })
      self.add(photo)
      photo.save() 
    }
	
	

  }))

  bb.view.Navigation = Backbone.View.extend({    
    initialize: function( items ) {
      var self = this
      _.bindAll(self)

      self.elem = {
        header: $("#header"),
        footer: $("#footer")
      }

      self.elem.header.css({zIndex:1000})
      self.elem.footer.css({zIndex:1000})

      function handletab(tabname) {
        return function(){
          app.model.state.set({current:tabname})
        }
      }

      var tabindex = 0
      for( var tabname in app.tabs ) {
        console.log(tabname)
        $("#tab_"+tabname).tap(handletab(tabname))
      }

      app.scrollheight = window.innerHeight - self.elem.header.height() - self.elem.footer.height()
      if( 'android' == app.platform ) {
        app.scrollheight += self.elem.header.height()
      }
    },

    render: function() {
    }
  })
  
 


  bb.view.Content = Backbone.View.extend({    
    initialize: function( initialtab ) {
      var self = this
      _.bindAll(self)

      self.current = initialtab
      self.scrollers = {}

      app.model.state.on('change:current',self.tabchange)

      window.onresize = function() {
        self.render()
      }

      app.model.state.on('scroll-refresh',function(){
        self.render()
      })
    },

    render: function() {
      var self = this

      app.view[self.current] && app.view[self.current].render()

      var content = $("#content_"+self.current)
      if( !self.scrollers[self.current] ) {
        self.scrollers[self.current] = new iScroll("content_"+self.current)      
      }

      content.height( app.scrollheight ) 

      setTimeout( function() {
        self.scrollers[self.current].refresh()
      },300 )
    },

    tabchange: function() {
      var self = this

      var previous = self.current
      var current = app.model.state.get('current')
      console.log( 'tabchange prev='+previous+' cur='+current)

      $("#content_"+previous).hide().removeClass('leftin').removeClass('rightin')
      $("#content_"+current).show().addClass( app.tabs[previous].index <= app.tabs[current].index ?'leftin':'rightin')
      self.current = current

      self.render()
    }
  })


  bb.view.Sense = Backbone.View.extend({
    initialize: function() {
      var self = this
      _.bindAll(self)

      self.elem = {
        
      }

     
    },

    render: function() {
    }
  })


  bb.view.Capture = Backbone.View.extend({
    initialize: function() {
      var self = this
      _.bindAll(self)

      self.elem = {
          
      }

    },
    render: function() {
    }
  })

  bb.view.Status = Backbone.View.extend({
    initialize: function(lists) {
      var self = this
      _.bindAll(self)
	self.lists = lists
	self.setElement('#content_status')
	
      self.elem = {
		  title: self.$el.find('#heading2')  
      }
    },
    render: function() {
		var self = this
		var list = new bb.model.List({
       listtext: "General List"
      }) 
		list = self.lists.get(app.model.state.get('currentlist'))  
         
		self.elem.title.html("Upload photos for " + list.get("listtext") + " station")
	  
    }
  })

  bb.view.Storage = Backbone.View.extend({
    initialize: function() {
      var self = this
      _.bindAll(self)

      self.elem = {
      }
    },
    render: function() {
    }
  })
  
  bb.view.List = Backbone.View.extend(_.extend({ 
  

    initialize: function( items, lists ) {
      var self = this
      _.bindAll(self)
	  self.lists = lists
      self.setElement('#content_capture')
    
      self.elem = {
		  
		  title: self.$el.find('#heading'),
		  services: self.$el.find('#timetablecontent')
	  }
	  
	  self.tm = {
        item: _.template( self.$el.html() ),
		title: _.template( self.elem.title.html() )
		
      }
	  

      self.items = items
      self.items.on('add',self.appenditem)
	   self.items.on('change',self.render)
	   self.items.on('destroy',self.render)
	   app.model.state.on('change:currentlist',self.render)
	   
	  //app.model.state.on('change:items',self.render)
    
    },


    render: function() {
      var self = this
	  self.elem.services.empty()
	   var list = new bb.model.List({
       listtext: "General List"
      }) 
		  
		list = self.lists.get(app.model.state.get('currentlist'))  
        self.elem.title.html( self.tm.title({
       title:  list.get("listtext") 
     }) )
     
      
	  
	  var title = new bb.model.Item({
        destination: "Destination", route: "Route", time: "Time", swipeon : true
      })
      //self.$el.empty()
	   var listv = new bb.view.Item({
        model: title
      })

      self.elem.services.append( listv.$el ) 

      self.items.each(function(item){
		  
        self.appenditem(item)
      })
	if(true)
	{
	  
	  var size = '12pt'
	  var disloc = false
	  
      $(".text").css( {'font-size': size})
	   $(".loc").css( {'font-size': size})
	   
	  if(disloc)
	  {
	     $(".loc").css( {'display': 'inline'})
	  }else
	  {
		 $(".loc").css( {'display': 'none'}) 
	  }
	}
    },


    appenditem: function(item) {
     /*
	  var self = this
      var html = self.tm.item( item.toJSON() )
      self.$el.append( html )      
      self.scroll()
	  */
	  var self = this
		if(item.get('listid') == app.model.state.get('currentlist'))
		//if(item.get('listid') == "50ca29ec5999cdb701000001")
		//if(true)
		{
      		var itemview = new bb.view.Item({
			model: item
     		 })

      		self.elem.services.append( itemview.$el )      
      		self.scroll()
		}

    }
	
	
  },scrollContent))
  
  bb.view.ListofLists = Backbone.View.extend(_.extend({ 
  

    initialize: function( lists, preferences ) {
      var self = this
      _.bindAll(self)
	  self.preferences = preferences

      self.setElement('#alllist')
    
      self.tm = {
        list: _.template( self.$el.html() )
      }
	  self.elem = {
        check: self.$el.find('span.check'),
		text: self.$el.find('text.check')
	  }

      self.lists = lists
      self.lists.on('add',self.appendlist)
	   self.lists.on('change',self.render)
	   self.lists.on('destroy',self.render)
	  
	  app.model.state.on('change:items',self.render)
     
    },


    render: function() {
      var self = this
	  var title = new bb.model.List({
        listtext: "Stations", swipeon : true
      })
      self.$el.empty()
	   var listv = new bb.view.Listitem({
        model: title
      })

      self.$el.append( listv.$el ) 
	  
      self.lists.each(function(list){
        self.appendlist(list)
      })
	  if(true)
	{
	  
	  var size = '12pt'
      $(".text").css( {'font-size': size})
	}
    },


    appendlist: function(list) {
      /*
	  var self = this
      var html = self.tm.list( list.toJSON() )
      self.$el.append( html )      
      self.scroll()
	  */
	var self = this

      var listview = new bb.view.Listitem({
        model: list
      })

      self.$el.append( listview.$el )      
      self.scroll()

    }
	
	
	
  },scrollListContent))
  
  bb.view.Item = Backbone.View.extend(_.extend({    
  //el: $("#todolist"),
 
  events: {
     //'tap': 'toggledone',
	 //'tap #delete_tm' : 'deleteitem',
	 //'swipe' : 'showdelete'
  },
	
	toggledone: function() {
		var self = this
		//window.confirm("sometext")
		this.model.toggle()	
	},
	
	deleteitem: function() {
		var self = this
		//window.confirm("sometext")
		this.model.clear()
	},
	
	showdelete: function() {
		var self = this
		//window.confirm("sometext")
		this.model.toggleSwipe()
	
	}
	
    ,
	
	initialize: function() {
      var self = this
      _.bindAll(self, "render", "toggledone", "deleteitem", "showdelete")
      self.render()
	  
	

    },

    render: function() {
      var self = this
      var html = self.tm.item( self.model.toJSON())
      self.$el.append( html ) 
	  
	 
    }

  },{
    tm: {
      item: _.template( $('#todolist').html() ),
	  
    }
	
	
	
  }))
  
   bb.view.Listitem = Backbone.View.extend(_.extend({    
  
  events: {
    
	 //'tap #delete_tm' : 'deleteitem',
	// 'swipe' : 'showdelete',
	 'tap' : 'changelist'
  },
	
	
	
	deleteitem: function() {
		var self = this
		//window.confirm("sometext")
		this.model.clear()
	},
	
	showdelete: function() {
		var self = this
		//window.confirm("sometext")
	
	},
	
	showdelete: function() {
		var self = this
		//window.confirm("sometext")
		this.model.toggleSwipe()
	
	},
	
	changelist: function() {
		var self = this
		if(self.model.get('listtext') != 'Stations')
		{
		app.model.state.set({currentlist: self.model.get('id')})
		
	  //app.view.head.cancelselected()
	  app.view.todolist.render()
	  app.model.state.set({current:"capture"})
		}
	
	}
	
    ,
	
    
	
	initialize: function() {
      var self = this
      _.bindAll(self)
      self.render()
	  
	 
	 app.model.state.on('change:item',self.render) 

    },

    render: function() {
      var self = this
      var html = self.tm.item( self.model.toJSON())
      self.$el.append( html ) 
	 
    }

  },{
    tm: {
      item: _.template( $('#alllist').html() ),
	  
    }
	
	
	
  }))
  
  bb.view.PhotoList = Backbone.View.extend(_.extend({ 
  

    initialize: function( photos, lists ) {
      var self = this
      _.bindAll(self)
	 
	  self.lists = lists
      self.setElement('#content_storage')
    
      
	  self.elem = {
        check: self.$el.find('span.check'),
		text: self.$el.find('text.check'),
		title: self.$el.find('#heading3'),
		pictures: self.$el.find('#photolist')    
	  }
	  
	  self.tm = {
        photo: _.template( self.$el.html() )
      }

      self.photos = photos
      self.photos.on('add',self.appendlist)
	   self.photos.on('change',self.render)
	   self.photos.on('destroy',self.render)
	  
	  app.model.state.on('change:photos',self.render)
	  app.model.state.on('change:currentlist',self.render)
     
    },


    render: function() {
      var self = this
	 self.elem.pictures.empty()
		var list = new bb.model.List({
       listtext: "General List"
      }) 
		list = self.lists.get(app.model.state.get('currentlist'))  
         
		self.elem.title.html("Photos for " + list.get("listtext") + " station")
	  
	 // self.elem.pictures.empty()
	  
      self.photos.each(function(photo){
        self.appendlist(photo)
      })
	  if(true)
	{
	  
	  var size = '12pt'
      $(".text").css( {'font-size': size})
	}
    },


    appendlist: function(photo) {
     
	var self = this

      
	  
	  if(photo.get('station') == app.model.state.get('currentlist'))
		//if(item.get('listid') == "50ca29ec5999cdb701000001")
		//if(true)
		{
      		
      var photoview = new bb.view.Photo({
        model: photo
      })

      self.elem.pictures.append( photoview.$el )      
      self.scroll()
		}

    }
	
	
	
  },scrollPhotoContent))
  
  bb.view.Photo = Backbone.View.extend(_.extend({    
  
  events: {
   
  },

	
	initialize: function() {
      var self = this
      _.bindAll(self)
      self.render()
	  
	 
	 app.model.state.on('change:photo',self.render) 

    },

    render: function() {
      var self = this
      var html = self.tm.item( self.model.toJSON())
      self.$el.append( html ) 
	 
    }

  },{
    tm: {
      item: _.template( $('#photolist').html() ),
	  
    }
	
	
	
  }))
  

}


app.boot = function() {
  document.ontouchmove = function(e){ e.preventDefault(); }
  $( '#main' ).live( 'pagebeforecreate',function(){
    app.boot_platform()
  })
}

app.boot_platform = function() {
  if( 'android' == app.platform ) {
    $('#header').hide()
    $('#footer').attr({'data-role':'header'})
    $('#content').css({'margin-top':59})
  }
}

app.init_platform = function() {
  if( 'android' == app.platform ) {
    $('li span.ui-icon').css({'margin-top':-4})
  }
}

app.start = function() {
  $("#tab_"+app.initialtab).tap()
}

app.erroralert = function( error ) {
  alert(error)
}


app.init = function() {
  console.log('start init')

  app.init_platform()

  bb.init()

  app.model.state = new bb.model.State()
  app.model.items = new bb.model.Items()
  app.model.lists = new bb.model.Lists()
  app.model.photos = new bb.model.Photos()

  app.view.navigation = new bb.view.Navigation(app.initialtab)
  //app.view.navigation.render()

  app.view.content = new bb.view.Content(app.initialtab)
  //app.view.content.render()
  
  app.view.todolist = new bb.view.List(app.model.items, app.model.lists)
  //app.view.todolist.render()
  
  app.view.alllist = new bb.view.ListofLists(app.model.lists)
  //app.view.alllist.render()
  
  app.view.photolist = new bb.view.PhotoList(app.model.photos, app.model.lists)
  //app.view.photolist.render()

  app.view.sense    = new bb.view.Sense()
  app.view.capture  = new bb.view.Capture()
  app.view.status   = new bb.view.Status(app.model.lists)
  app.view.storage  = new bb.view.Storage()
  <!--app.view.phonegap = new bb.view.PhoneGap()-->
  
 app.model.items.fetch( {
    success: function() {
	//app.view.todolist.render()
      // simulate network delay
      
    }
  })
  
  app.model.lists.fetch( {
    success: function(lists) {
	self.lists = lists
	var list = self.lists.at(0) 
        
	app.model.state.set({currentlist: list.get('id')})
	app.view.navigation.render()
	app.view.content.render()
	app.view.alllist.render()	
    app.view.todolist.render()
	app.view.photolist.render()
	
    }
  })
  
  app.model.photos.fetch( {
    success: function() {
	//app.view.photolist.render()	
    
    }
  })
  

  app.start()

  console.log('end init')
}


app.boot()
$(app.init)
