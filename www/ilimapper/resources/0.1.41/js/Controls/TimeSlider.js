define(["dojo/_base/declare",
		"esri/dijit/TimeSlider", 
		"esri/TimeExtent", 
		"dojo/dom",
		"dojo/date",
		"dijit/registry"], function (declare, TimeSlider, TimeExtent, dom, date, registry)
{
	return declare(TimeSlider,
	{   
		_data: undefined,  
		_startDate:undefined,
		_endDate:undefined, 
		_activeEndDate:undefined, 
		_playing: false,
		_dataReturned: false,
		GetCurrentWeek: function(){
			/*var currDate = new Date();
			var startDate = new Date(); 
			startDate.setTime(parseInt(this._startDate.getTime())); 
			for(var i = startDate; i < this._endDate; i.setDate(i.getDate() + 7)){ 
				if(i > this._endDate){
					currDate.setDate(i.getDate() - 7); 
					break;
				}  
			}    
			return currDate;*/
			var d = new Date();  
			d.setTime(this._endDate.getTime()); 
			d.setDate(d.getDate() - 6);  
			return d;
		},  
		GetWeekNumber: function(targetDate){	 
			var startDate = new Date();
			startDate.setTime(parseInt(this._startDate.getTime())); 
			startDate.setDate(this._startDate.getDate() - 7);  
			var wkNum = 0;  
			for(var i = startDate; i <= targetDate; i.setDate(i.getDate() + 7)){
				wkNum++;
			}    
			return wkNum;
		}, 
		GetDateRange: function(targetDate){	 
			var startDate = new Date(); 
			return wkNum; 
		}, 
		SetTimeExtent: function(startDate, endDate){ 
			this._timeExtent = new TimeExtent();  
			this._startDate = startDate;
			this._endDate = endDate; 
			this._timeExtent.startTime = this._startDate;
			this._timeExtent.endTime = this._endDate; 		
 	
			this.SetLabel(this._timeExtent.endTime);  
			this.createTimeStopsByTimeInterval(this._timeExtent,1,'esriTimeUnitsWeeks');  
			 				
		},
		SetLabel: function(time){ 
			console.log(time);
			var startDateTime = date.add(time, "day", -6);   
			var endDateTime = date.add(time, "day", 0); 
			var weekNumStarting =   " - " + dojo.date.locale.format(endDateTime, {
											  selector: 'date',
											  datePattern: 'MMM. dd, yyyy'
											}); 
		    
			dojo.byId("weekDate").innerHTML =  dojo.date.locale.format(startDateTime, {
												selector: 'date',
												datePattern: 'MMM. dd, yyyy'
											}) + weekNumStarting;    
			 
		},
		SetStartDate: function(val){
			this._startDate = val;
		},
		SetEndDate: function(val){
			this._endDate = val;
		},
		_getAutomatedEndDate: function(){
			// AUTOMATATED END DATE (this is a temporary fix to accommodate the year) 
			//serverDateEST is declared globally on the index page.  
			var lastDateAutomated = new Date(serverDateEST);  
			// subtract a day to ensure timeslider changes on Mondays
			lastDateAutomated = date.add(lastDateAutomated, "day", -2);
			 
			for(var j = 0 ; j < 6; j++)
			{ 
				if(lastDateAutomated.getDay() == 6){  
					break; 
				} 
				lastDateAutomated = date.add(lastDateAutomated, "day", -1);  
			}  
			var month = lastDateAutomated.getMonth() + 1
			var day = lastDateAutomated.getDate();
			if(month < 10){
				month = "0"+month;
			}
			if(day < 10){
				day = "0"+day;
			}  
			this._activeEndDate = new Date(lastDateAutomated.getFullYear() +"/"+ month +"/"+ day); 
			// need a separate variable for the automated end date
			return this._activeEndDate; 
		}, 
		_onPlay: function(){
			this.pause();
			if(!this._playing){
				$("#dijit_form_Button_0>span:first-child").removeClass("tsPlayButton")
				$("#dijit_form_Button_0>span:first-child").addClass("tsPauseButton");  
				var btn1 = registry.byId("dijit_form_Button_1");
				var btn2 = registry.byId("dijit_form_Button_2"); 
				btn1.setDisabled(true)
				btn2.setDisabled(true)
				
			  this._playing = true;
				// need to add an interrupt in case the play button is paused at anytime
				setTimeout(function(){ 	 
						 if(this._playing){ // check to see if play button has been paused 
								this.next();
						 }
				}.bind(this), 2000); 
				 
			}
			else{
				this._playing = false; 
				$("#dijit_form_Button_0>span:first-child").removeClass("tsPauseButton")
				$("#dijit_form_Button_0>span:first-child").addClass("tsPlayButton");   
			}
		}
		
	});
});  
