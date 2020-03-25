define(["dojo/_base/declare",
        "dojo/_base/Color",
		"dojo/json",
        "esri/graphic", 
        "esri/InfoTemplate",
		"Layers/KMLLayerModel"], 
		function (declare, Color, JSON, Graphic, InfoTemplate)
{
	return declare(null,
	{   
		_graphicsLayerReference: undefined,  
		constructor: function (ref)
		{      
			this._graphicsLayerReference = ref;
			  
		},
		Generate: function(evt){
			//var infoTemplate = new InfoTemplate("<span style='font-size:12px'>Daily percent of all ED visits for a respiratory complaint within "+evt.graphic.attributes["name"]+"</span>", "<div id='infoData'><img src=\""+ ILIMAPPER.getBaseURL() + "/resources/images/loading.gif\"></div>"); 
			//evt.graphic.setInfoTemplate(infoTemplate);	
			
			$(".titleButton.close").click(function(){   
				$("#infoData").children().remove(); 
			}); 
			if((evt.graphic.symbol.color.toString() != "rgba(128, 128, 128, 1)") && (evt.graphic.attributes.PHUAbrrev != "COHU"))
			{ 
				
				var patt = new RegExp(/<strong><span class="atr-name">GeogNum<\/span>:<\/strong> <span class="atr-value">+(.*)+<\/span><br>/);
				var description = evt.graphic.attributes.description;
				var phuID = patt.exec(description);
				// Adding as old health unit abbreviations have been replaced in ACES with HPPH
				if(phuID[1] == "HCHU" || phuID[1] == "PDHU"){
					phuID[1] = "HPPH";
				} 
				$('#resp-graph-container img').show(); // show loading spinner
				$('#resp-graph-container').fadeIn(); // animate in container
				$('#resp-graph-title').text('Percent of ' + evt.graphic.attributes["name"] + ' Daily ED Visits with a Respiratory Complaint');

				var graphContainer = $('#resp-graph');
				var respGraph = echarts.init(graphContainer[0]); // initialize graph

				// Get percent resp data and set graph
				//$.get("https://aces.kflaphi.ca/aces/ILIMapper/getPercentages?PHU=" + phuID[1], function(data) {
				$.get("/raw/" + phuID[1] + ".json", function(data) {

					var xAxisDates = []; // Date array of data
					var pctResp = []; // Percent Resp of ED visits
					var pctRespMA7Days = []; // 7 day moving average of % resp
					//var respVisits = []; // Total resp ED visits
					//var totalVisits = []; // Total ED vists
					

					// Put data into correct arrays
					for (var day = 0; day < data.length; day++) {
						xAxisDates.push(data[day].AdmissionDate);
						pctResp.push(data[day].PctResp);
						pctRespMA7Days.push(data[day].PctRespMA7Days);
						//respVisits.push(day.RespVisits);
						//totalVisits.push(day.AllVisits); 
					}
					
					// echarts settings. Go to echarts documentation to find out how to configure this
					var chartFormat = {
						tooltip: {
							trigger: 'axis'
						},
						/*aria: {
							show: true, // accessibility... Currently geting an error Uncaught TypeError
						},*/
						legend: {
							data:['% Resp Visits', '7 day moving average'],
							itemWidth: 30,
							itemHeight: 20,
						},
						dataZoom: [ // controls zoom feature
							{
								type: 'inside',
								start: 0,
								end: 100
							},
							{
								handleIcon: 'M10.7,11.9v-1.3H9.3v1.3c-4.9,0.3-8.8,4.4-8.8,9.4c0,5,3.9,9.1,8.8,9.4v1.3h1.3v-1.3c4.9-0.3,8.8-4.4,8.8-9.4C19.5,16.3,15.6,12.2,10.7,11.9z M13.3,24.4H6.7V23h6.6V24.4z M13.3,19.6H6.7v-1.4h6.6V19.6z',
								handleSize: '80%',
								handleStyle: {
								color: '#fff',
								shadowBlur: 3,
								shadowColor: 'rgba(0, 0, 0, 0.6)',
								shadowOffsetX: 2,
								shadowOffsetY: 2
							}
							}
						],
						grid: { // positioning of the actual chart in the div
							left: '5%',
							right: '10%',
							top: '10%',
							bottom: '6%',
							containLabel: true
						},
						toolbox: {
							feature: {
								saveAsImage: {} // TODO: this isn't showing up but it should be
							},
						},
						xAxis: {
							type: 'category',
							name: 'Date',
							boundaryGap: false,
							data: xAxisDates
						},
						yAxis: {
							type: 'value',
							name: '% of Respiratory Visits',
							nameRotate: '90',
							nameGap: '25',
							nameLocation: 'middle'
						},
						series: [ // line data
							{
								name:'% Resp Visits',
								type:'line',
								data:pctResp
							},
							{
								name:'7 day moving average',
								type:'line',
								data:pctRespMA7Days
							}
						],
						color: ['#007582', '#000D29'] // colors to be used
					};
					
					respGraph.setOption(chartFormat);
				})	
				.fail( function(error) {
					$('#resp-graph-title').text('No data found.');
					console.log('Error getting data'); // TODO: send msg to user.
				})
				.always(
					$('#resp-graph-container img').hide()
				);

			}	
			else
			{
				evt.graphic.infoTemplate.content = "Not Available"; 
			} 
		}
	});
});  
