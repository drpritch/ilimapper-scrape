define(["dojo/_base/declare",
        "dojo/request/xhr",
		"dojo/date" ], function (declare, xhr, date)
{
	return declare(null,
	{  
		 
		constructor: function ()
		{ 

		},
		/**
		 * Helper function to set the Ontario ILI activity
		 * @param {String} color color from API call
		 * @param {String} weekId the id of the week to set
		 */
		_setColor: function(color, weekId) {
			
			var colorBox = $('#' + weekId + ' .ontario-ili-color');
			colorBox.removeClass('seasonal');
			colorBox.removeClass('moderate');
			colorBox.removeClass('elevated');
			colorBox.removeClass('high');
			var colorBoxText = $('#' + weekId + ' figcaption'); 


			// set color
			switch (color) {
				case 'green':
					colorBox.addClass('seasonal');
					colorBoxText.text('Seasonal');
					break;
				case 'yellow':
					colorBox.addClass('moderate');
					colorBoxText.text('Moderate');
					break;
				case 'orange':
					colorBox.addClass('elevated');
					colorBoxText.text('Elevated');
					break;
				case 'red':
					colorBox.addClass('high');
					colorBoxText.text('High');
			}
			return
		},
		/**
		 * Simple helper function to set the week text for Ontario ILI colors
		 * @param {String} weekId ID of week
		 * @param {String} dateText text for date to set
		 */
		_setDate: function(weekId, dateText) {
			$('#' + weekId + ' .ili-activity-date').text(dateText);
		},
		/**
		 * Fills in the ontario ili table on the home page
		 * @param {Number} yearSelected flu season year, 2 digits
		 * @param {Number} weekNum week of flu season
		 */
		GetTable: function(yearSelected, weekNum){ 
			xhr(ILIMAPPER.getBaseURL() + "/API/ONColors?flu_season=" + yearSelected + "&week_num=" + weekNum, {
				handleAs: "json"
			  }).then( function(ONColors) {
				

				var iliTable = document.getElementById("ontario-table");

				
				if(ONColors.length > 0){ // API call returned data
					
					// Get Dates
					var current_date = document.getElementById("weekDate").innerHTML.split(" - ");
					var d = new Date(current_date[1].replace(".",""));
					
					var weekTrailing = date.add(d, "week", -1); 
					weekTrailing = date.add(weekTrailing, "day", 1); 
					var pastWeek = dojo.date.locale.format(weekTrailing, {
																selector: 'date',
																datePattern: 'MMM dd'
																}) + " to ";  
					
					pastWeek += dojo.date.locale.format(d, {
																selector: 'date',
																datePattern: 'MMM dd'
																}); 
					var weekTrailing2 = date.add(weekTrailing, "week", -1); 
					var twoWeeksAgo = dojo.date.locale.format(weekTrailing2, {
															selector: 'date',
															datePattern: 'MMM dd'
															}) + " to ";  
					
					weekTrailing = date.add(weekTrailing, "day", -1); 
					twoWeeksAgo +=  dojo.date.locale.format(weekTrailing, {
																selector: 'date',
																datePattern: 'MMM dd'
																}); 				
						
					var nextWeek = date.add(d, "day", 1); 
					nextWeek = dojo.date.locale.format(nextWeek, {
															selector: 'date',
															datePattern: 'MMM. dd'
															}) + " to ";  
					var weekahead = date.add(d, "week", 1);
					nextWeek +=  dojo.date.locale.format(weekahead, {
																selector: 'date',
																datePattern: 'MMM dd'
																}); 
									

					ONColors = ONColors[0]; // API call returns an array so we set it to object returned

					for (var week in ONColors) {
						this._setColor(ONColors[week], week);

						if (week == 'prev_week') {
							this._setDate(week, twoWeeksAgo);
						}
						else if (week == 'current_week') {
							this._setDate(week, pastWeek);
						}
						else { // projected_week
							this._setDate(week, nextWeek);
						}
					} 
					
					this._setDate();
  
				}
				else{
					/*var tr = document.createElement('tr');  
					var td = document.createElement("td");  
					$("#ontario-table").children().remove(); 
					
					//Uncomment when the season starts

					td.innerHTML = "<div class='alert alert-warning'>This week’s provincial projections will be updated on the next business day. However, the map below of health unit activity is up to date.</div>"; 
*/
					//Comment out when the season starts
					/*td.innerHTML = "<div class='alert alert-warning'>With the 2018/2019 respiratory season coming to a end, projections of ILI activity will cease for the "+
																		"summer and start up again in October 2019. <br><br>" + 
																		" The below map of health unit activity will remain active and up to date throughout the year.</div>"; 
					*/
					/*tr.appendChild(td);  
					  
					iliTable.appendChild(tr); */
				}
			}.bind(this)) 
		}
	});
});  
