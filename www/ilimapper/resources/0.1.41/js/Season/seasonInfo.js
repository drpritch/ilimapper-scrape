define(["dojo/_base/declare",
		"dojo/_base/xhr" ], function (declare, xhr)
{
	return declare(null,
	{  
		_data: undefined,  
		_currentSeasonSelected: undefined,
		constructor: function ()
		{     
		},
		Generate: function(){
			return xhr.get({ 
				url: "getSeasons.json",
				handleAs: "json", 
				sync: false,
				load: function(result) {  
					this._data = result; 
					this.SetSeason(this._data.length);
					
				}.bind(this), 
				error: function() { 
				} 
			}); 
			
		},
		GetData: function(){
			return this._data;
		},
		GetStartDate: function(selectOption){   
			return new Date(((this._getDataObject(selectOption)).date_start).replace(/-/g, "/")+" 12:00:00");  
		},
		GetEndDate: function(selectOption){     
			return new Date(((this._getDataObject(selectOption)).date_end).replace(/-/g, "/")+" 12:00:00");  
		},
		GetSeason: function(){  
			return this._currentSeasonSelected;   
		},
		SetSeason: function(selectOption){   
			var date = new Date(((this._getDataObject(selectOption)).date_start).replace(/-/g, "/"));   
			var season = date.getFullYear(); 
			this._currentSeasonSelected = season;
		},
		_getDataObject: function(selectOption){
			var d = '';
			for(var i = 0; i< this._data.length; i++){
				if(this._data[i].flu_season == selectOption){
					d = this._data[i];
				}
			} 
			return d;
		}
	});
});  
