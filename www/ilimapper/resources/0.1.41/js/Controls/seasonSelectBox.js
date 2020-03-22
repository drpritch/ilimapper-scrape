define(["dojo/Stateful",
		"dojo/_base/declare"], function (Stateful, declare)
{
	return declare(null,
	{  
		_data: undefined, 
		_latestSeason: undefined,
		_selectBoxControl: undefined,
		_seasonSelected: undefined,
		constructor: function (data)
		{     
			var objData = { "season": 0};
			this._seasonSelected = new Stateful(objData);  
			this._selectBoxControl = document.getElementById("yearSelected");
			for(var i = 0; i < ((data.length)-1); i++){
					
				var start_d = new Date((data[i].date_start).replace(/-/g, "/"));
				start_d.setDate(start_d.getDate());
				start_d = start_d.toDateString().split(" "); 
				var end_d = new Date(data[i].date_end);  
				end_d.setDate(end_d.getDate());
				end_d = end_d.toDateString().split(" ");  
				
				var opt = document.createElement('option');
				opt.text = start_d[1]+". "+start_d[3]+" - "+end_d[1]+". "+end_d[3];
				opt.value = data[i].flu_season;
				if(i==0){
					opt.selected = true;
					this._seasonSelected.set("season", data[i].flu_season);
					this._latestSeason = data[i].flu_season;
				}
				this._selectBoxControl.options.add(opt); 
			}  
			  
			this._selectBoxControl.onchange = (function(selectBoxControl, yearSelected){
				return function(evt){  
					yearSelected.set("season", selectBoxControl.options[selectBoxControl.selectedIndex].value); 
				}
			})(this._selectBoxControl, this._seasonSelected);
				  
		},
		GetLatestSeason: function(){
			return this._latestSeason;
		},
		GetSelectedOption: function(){
			/* this returns the options value of the select box. So for the latest season, 0 is returned */ 
			return this._seasonSelected.get("season");
		}		    
	});
});  
