(function( win, doc ){
	var modules = {  }
	
	var _script = document.getElementsByTagName( "script" )[ 0 ]
	var _a = document.createElement( "a" )
	_a.style.visibility = "hidden"
	document.body.insertBefore( _a, _script )

	var define = function( deps, factory ){
		console.log( "define..." )
		var _deps = factory ? deps : [  ], _factory = factory ? factory : deps
		new Module( _deps, _factory )
	}

	var require = function( deps, callback ){
		console.log( "require " + deps )
		if( !Array.isArray( deps ) ){
			deps = [ deps ]
		}
		var urls = [  ]
		for( var i = 0; i < deps.length; i++ ){
			urls.push( utils.resolveUrl( deps[ i ] ) )
		}
		utils.proxy.watch( urls, callback )
		m_methods.fetchModules( urls )
	}

	function Module( deps, factory ){
		var _this = this
		_this.m_id = doc.currentScript.src
		if( m_methods.isModuleCached( _this.m_id ) ){
			return
		}
		if( arguments[ 0 ].length == 0 ){
			_this.factory = arguments[ 1 ]
			m_methods.cacheModule( _this.m_id, _this.factory(  ) )
			utils.proxy.emit( _this.m_id )
		} else {
			_this.factory = arguments[ 1 ]
			require( arguments[ 0 ], function( results ){
				m_methods.cacheModule( _this.m_id, _this.factory( results ) )
				utils.proxy.emit( _this.m_id )
			} ) 
		}
	}

	var m_methods = {
		hasModule : function( m_id ){
			return modules.hasOwnProperty( m_id )
		},

		pushModule : function( m_id ){
			if( !this.hasModule( m_id ) ){
				console.log( "pushModule : " + m_id )
				modules[ m_id ] = null
				console.log( modules )
			}
		},

		cacheModule : function( m_id, m_export ){
			console.log( "cacheModule : " + m_id )
			modules[ m_id ] = m_export
			console.log( modules )
		},

		isModuleCached : function( m_id ){
			return !!modules[ m_id ]
		},

		fetchModules : function( urls ){
			for( var i = 0; i < urls.length; i++ ){
				this.pushModule( urls[ i ] )
				var script = document.createElement( "script" )
				var parent = document.getElementsByTagName( "head" )[ 0 ]
				script.onload = script.onerror =  function(  ){
					this.parentNode.removeChild( this )
					this.onload = this.onerror = null
				}
				script.src = urls[ i ]
				parent.appendChild( script )
			}
			console.log( "fetchModules " + urls + " done!" )
		}
	}

	var utils = {
		resolveUrl : function( url ){
			_a.href = url
			var absolute_url = _a.href
			_a.href = ""
			return absolute_url
		},

		proxy : (function(  ){

			var tasks = {  }

			var task_id = 0

			var excute = function( task ){
				console.log( "excute task" )
				var urls = task.urls
				var callback = task.callback
				var results = [  ]
				for( var i = 0; i < urls.length; i ++ ){
					results.push( modules[ urls[ i ] ] )
				}
				callback( results )
			}

			var deal_loaded = function( url ){
				console.log( "deal_loaded " + url )
				var i, k, sum = 0
				for( k in tasks ){
					if( tasks[ k ].urls.indexOf( url ) > -1 ){
						for( i = 0; i < tasks[ k ].urls.length; i ++ ){
							if( m_methods.isModuleCached( tasks[ k ].urls[ i ] ) ){
								sum ++
							}
						}
						if( sum == tasks[ k ].urls.length ){
							excute( tasks[ k ] )
							delete( tasks[ k ] )
						}
					}
				}
			}

			var emit = function( m_id ){
				console.log( m_id + " was loaded !" )
				deal_loaded( m_id )
			}

			var watch = function( urls, callback ){
				console.log( "watch : " + urls )
				var sum
				for( var i = 0; i < urls.length; i ++ ){
					if( m_methods.isModuleCached( urls[ i ] ) ){
						sum ++
					}
				}
				if( sum == urls.length ){
					excute({ urls : urls, callback : callback })
				} else {
					console.log( "创建监听任务 ： " )
					var task = { urls : urls, callback : callback }
					tasks[ task_id ] = task
					task_id ++
					console.log( task )
				}
			}

			return {
				emit : emit, watch : watch
			}
		})(  )
	}

	win.loader = {
		version : "1.0", define : define, require : require
	}
})( window, document )