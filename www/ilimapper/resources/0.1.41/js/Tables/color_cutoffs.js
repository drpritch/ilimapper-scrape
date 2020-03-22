define(["dojo/_base/declare"], function (declare)
{
	return declare(null,
	{   
		_id: undefined,  
		constructor: function(id)
		{   
			this._id = id
			this._activityTable = $("#activityTable_"+id);
			// cutOffData, object with keys=geo_id and values = object of green, yellow, orange, red values
			// if time perimits this should be rewritten as a model and structured in files properly
			this.cutoffData = {} 
		},
		Generate: function(season){ 
			$.ajax({
				type: 'GET',
				url: ILIMAPPER.getBaseURL() + "/API/getCutoffs?flu_season="+season+"&geo_type="+this._id,   
				success: function (data) {  
					 	
					var listOfPhuCutoffs = JSON.parse(data); 
					
					// iterate through list and generate cutoffData data structure
					for (region in listOfPhuCutoffs) {
						this.cutoffData[listOfPhuCutoffs[region].abbreviation] = {
							green: listOfPhuCutoffs[region].green,
							yellow: listOfPhuCutoffs[region].yellow,
							orange: listOfPhuCutoffs[region].orange,
							red: listOfPhuCutoffs[region].red
						}
					}

					this._activityTable.children().remove();  

				 	var tr = document.createElement('tr');   
						 
					var th = document.createElement("th");
					th.innerHTML = "Health Unit";
					
					tr.appendChild(th);
					
					th = document.createElement("th");
					th.innerHTML = "Green";
					th.className = "green";
					
					tr.appendChild(th);
					
					th = document.createElement("th");
					th.innerHTML = "Yellow";
					th.className = "yellow";
					
					tr.appendChild(th);
					
					th = document.createElement("th");
					th.innerHTML = "Orange";
					th.className = "orange";
					
					tr.appendChild(th); 
					
					th = document.createElement("th");
					th.innerHTML = "Red";
					th.className = "red";
					
					tr.appendChild(th); 
						
					$(tr).appendTo(this._activityTable);   
					
					var newRowTrigger = 0;
					var tr;   
					for(i in listOfPhuCutoffs)
					{    
						var tr = document.createElement('tr');  
						
						var td = document.createElement('td'); 
						td = document.createElement('td'); 
						td.innerHTML = listOfPhuCutoffs[i].name; 
						td.style.width = "250px";
						tr.appendChild(td);    
						 
						td = document.createElement('td'); 
						td.innerHTML = listOfPhuCutoffs[i].green; 
						td.className = "green b";    
						tr.appendChild(td);  
						$(tr).appendTo(this._activityTable);      
						  
					   
						td = document.createElement('td'); 
						td.innerHTML = listOfPhuCutoffs[i].yellow; 
						td.className = "yellow b";    
						tr.appendChild(td);  
						$(tr).appendTo(this._activityTable);  
					   
						td = document.createElement('td'); 
						td.innerHTML = listOfPhuCutoffs[i].orange; 
						td.className = "orange b";    
						tr.appendChild(td);  
						$(tr).appendTo(this._activityTable);  
						
						td = document.createElement('td'); 
						td.innerHTML = listOfPhuCutoffs[i].red; 
						td.className = "red b";    
						tr.appendChild(td);  
						$(tr).appendTo(this._activityTable);  
 
					} 
				}.bind(this),
				error : function (jqXHR, textStatus, errorThrown) {
					console.log("error");
				}
			});  
		},
		/**
		 * Returns data for cut off values. Should only be called after .Generate
		 */
		getCutoffData: function() {
			return this.cutoffData;
		}     
	});
});  
