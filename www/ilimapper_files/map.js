require([ 
        "dojo/dom-construct",
		"dojo/promise/all",		
        "esri/map", 
		"Layers/KMLLayerModel", 
		"Data/layers",  
		"Tables/on_colors",
		"Tables/color_cutoffs",
		"Season/seasonInfo",
		"Season/content", 	
		"Controls/seasonSelectBox",
		"Controls/TimeSlider",
		"Controls/acesGraph",
		"Controls/mapperPopup",
		"dojo/date",
		"dojo/dom",
		"dijit/registry"
        ],
    function(domConstruct, all, Map, KMLLayerModel, LayerInfo, on_colors, color_cutoffs, seasonInfo, content, seasonSelectBox, TimeSlider, acesGraph, mapperPopup, date, dom, registry){    
	
	//if the map exists.
	if($("#map").length)
		{
		var startExtent = new esri.geometry.Extent(-11529726.85, 6029999.83, -7126954.02,6807264.72, new esri.SpatialReference({wkid:"102100"}));   
		var allLayerData = new LayerInfo();
		var layerInfo = allLayerData.GetLayerInfo();  
		var layerArray = [];
		
		// /* Ontario Colors */
		var seasonInfo = new seasonInfo();
		var acesGraph = new acesGraph();
		var mapperPopup = new mapperPopup();
		
		var map = new Map("map", { 
			basemap: "gray",   
			zoom:5,
			showInfoWindowOnClick:false,
			extent: startExtent, 	  
			minZoom: 5 
		});    
		// On app initialization
	  // While we can detect when all layers are added to the map, we can't detect when all layers are done drawing to the map.
		// There's no event we can use that accommodates this so the timeout is used for now. 
		map.on("layers-add-result", function(){ 
				setTimeout(function(){ 
					$("#mapLoadingOverlay").hide();
				}, 5000); 
		});  
		
		for(var i in layerInfo){  
			var l = new KMLLayerModel(layerInfo[i].id, layerInfo[i].displayName, layerInfo[i].legendURL, layerInfo[i].URLParams, layerInfo[i].metaDataURL, /*layerInfo.tooltip,*/ layerInfo[i].baseURL, layerInfo[i].experimental, layerInfo[i].requireProxy, layerInfo[i].opacity, layerInfo[i].isVisible, layerInfo[i].timeParams, layerInfo[i].timeEnabled); 
			layerArray.push(l);  		
		}
	  
		all([seasonInfo.Generate()]).then(function(results){
			
			/* return season info and build dependents */
			var data = results[0]; 
			
			/* Season Select Box */
			var s_box = new seasonSelectBox(data);  
			
			/* timeslider */
			var time_slider = new TimeSlider({ style: "width: 100%;"}, dom.byId("timeSliderDiv")); 
		 
			time_slider.SetTimeExtent(seasonInfo.GetStartDate((seasonInfo.GetData()).length), time_slider._getAutomatedEndDate());
			time_slider.startup();  
			time_slider._setSliderValue('100');      
			
			/* Ontario Colors */
			//var onColors = new on_colors();   
			/* need to track the latest week number because when changing seasons we need to know which week number to give the on_colors class. This should be refactored */
			var wkNum = time_slider.GetWeekNumber(time_slider.GetCurrentWeek());   
			//onColors.GetTable(s_box.GetLatestSeason(), wkNum); 
			
			/* Color Cutoffs */ 
			var phu_colorCutoffs = new color_cutoffs("Phu"); 
			phu_colorCutoffs.Generate(s_box.GetSelectedOption()); 

			var lhin_colorCutoffs = new color_cutoffs("Lhin"); 
			lhin_colorCutoffs.Generate(s_box.GetSelectedOption()); 
			  
			/* Season Content */ 
			var seasonContent = new content();  
			seasonContent.Generate(s_box.GetSelectedOption()); 
			
			//bug using map extent as southern PHUs aren't showing. Using Custom extent for now. 
			var customExtent = new esri.geometry.Extent(-10994056.155390117, 5090462.471517131, -7662624.71460988,7746802.07848287, new esri.SpatialReference({wkid:"102100"})); 
			
			for(var i in layerArray){ 
				switch (layerArray[i].GetDisplayName()) { 
					case "Public Health Units":
						var startDate = time_slider.GetCurrentWeek();  
						var y = startDate.getFullYear();
						var m = ((startDate.getMonth()+1) < 10 ? "0"+(startDate.getMonth()+1) : (startDate.getMonth()+1)); 
						var d = ((startDate.getDate())  < 10 ? "0"+(startDate.getDate()) : (startDate.getDate()));  
						layerArray[i]._queryParams.viewparams = "ClassID:Resp;WeekAdmission:"+y+"-"+m+"-"+d+";GeoType:PHU";
						layerArray[i]._url = "KFLA-ili_mapper_" + y+"-"+m+"-"+d+".kml";
									  
						break;   
					case "Local Health Integration Networks":
						var startDate = time_slider.GetCurrentWeek();  
						var y = startDate.getFullYear();
						var m = ((startDate.getMonth()+1) < 10 ? "0"+(startDate.getMonth()+1) : (startDate.getMonth()+1)); 
						var d = ((startDate.getDate())  < 10 ? "0"+(startDate.getDate()) : (startDate.getDate()));  
						layerArray[i]._queryParams.viewparams = "ClassID:Resp;WeekAdmission:"+y+"-"+m+"-"+d+";GeoType:LHIN";
						layerArray[i]._url = "KFLA-ili_mapper_lhin_" + y+"-"+m+"-"+d+".kml";
									  
						break;   
				}  
			
			}      
			all([
					layerArray[0].GenerateLayer(customExtent),
					layerArray[1].GenerateLayer(customExtent),
					layerArray[2].GenerateLayer(customExtent),
			]).then(function(result){ 
				map.addLayers(result);  
			});
			
			/* -------------- EVENTS -----------------------*/
		
			time_slider.watch("_dataReturned", function(name, oldValue, value){  
				if(time_slider._dataReturned){
					time_slider._dataReturned = false; 
					if(time_slider._playing){
						time_slider.next(); 
					}
				}
			});
			time_slider.on("time-extent-change", function(timeExtent){  
				 
				//timeExtent startTime always the beginning of the extent
				//timeExtent endTime gives you the time location of the peg/tick
				//So we need to take the endtime and minus 1 week to get admissionWeek for the Layer 
	  
				if(timeExtent== undefined){ console.log('missing');
					timeExtent = {
						endTime: time_slider._getAutomatedEndDate()
					}
				} 
				var startDate = date.add(timeExtent.endTime, "day", -6); 
			 
				//For getting the week number.
				wkNum = time_slider.GetWeekNumber(startDate);   
				//onColors.GetTable(s_box.GetSelectedOption(), wkNum);     
					 
				time_slider.SetLabel(timeExtent.endTime); 
				
				//processing required for Dates as IE uses dashes instead of hyphens and orders the date backwards
				var y = startDate.getFullYear();
				var m = ((startDate.getMonth()+1) < 10 ? "0"+(startDate.getMonth()+1) : (startDate.getMonth()+1));  
				var d = ((startDate.getDate()) < 10 ? "0"+(startDate.getDate()) : (startDate.getDate()));
	 
				layerArray[0]._queryParams.viewparams = "ClassID:Resp;WeekAdmission:"+y+"-"+m+"-"+d+";GeoType:PHU"; 
                                layerArray[0]._url = "KFLA-ili_mapper_" + y+"-"+m+"-"+d+".kml";
				
				if(!layerArray[0]._request.isResolved()){
					layerArray[0]._request.cancel();   
				} 	
				$("#mapLoadingOverlay").show();
				 
				layerArray[0]._updateKMLLayer(customExtent).then(function(){
					$("#mapLoadingOverlay").hide(); 
				});  
				
				layerArray[1]._queryParams.viewparams = "ClassID:Resp;WeekAdmission:"+y+"-"+m+"-"+d+";GeoType:LHIN"; 
                                layerArray[1]._url = "KFLA-ili_mapper_lhin_" + y+"-"+m+"-"+d+".kml";
				
				if(!layerArray[1]._request.isResolved()){
					layerArray[1]._request.cancel();   
				} 	
				$("#mapLoadingOverlay").show();
				 
				layerArray[1]._updateKMLLayer(customExtent).then(function(){
					$("#mapLoadingOverlay").hide(); 
				});  
				
				
				// This function waits until the request is retrieved before it signals to send the next one.
				// This is needed as there's no native timeslider ajax function/event. 		
				function wait(endtime){   
					if(!layerArray[0]._request.isResolved() || !layerArray[1]._request.isResolved()){   
							setTimeout(function(){ 	
								wait(endtime);
							}, 1000); 
					}
					else{
							if(endtime.getTime() == (time_slider.timeStops[(time_slider.timeStops.length - 1)]).getTime()){
								time_slider._playing = false;	 
								time_slider.set("_dataReturned", false); 	
								$("#dijit_form_Button_0>span:first-child").removeClass("tsPauseButton")
								$("#dijit_form_Button_0>span:first-child").addClass("tsPlayButton");  
								var btn1 = registry.byId("dijit_form_Button_1");
								var btn2 = registry.byId("dijit_form_Button_2");  
								btn1.setDisabled(false);
								btn2.setDisabled(false);
							}
							else{
								setTimeout(function(){
									if(time_slider._playing){
										time_slider.set("_dataReturned", true);
									}
									else{
										time_slider.set("_dataReturned", false);   
									}
								}, 2000); 
							}
					}				
				}
				
				if(time_slider._playing == true){  	
					wait(timeExtent.endTime);  
				}
				
		});
			  
			s_box._seasonSelected.watch("season", function(name, oldSeasonValue, newSeasonValue){ 
				time_slider._playing = false;	 
				time_slider.set("_dataReturned", false); 	
				$("#dijit_form_Button_0>span:first-child").removeClass("tsPauseButton")
				$("#dijit_form_Button_0>span:first-child").addClass("tsPlayButton");  
				var btn1 = registry.byId("dijit_form_Button_1");
				var btn2 = registry.byId("dijit_form_Button_2");  
				btn1.setDisabled(false);
				btn2.setDisabled(false);
				seasonInfo.SetSeason(newSeasonValue);  
				//onColors.GetTable(newSeasonValue, wkNum);     
				seasonContent.Generate(newSeasonValue);  
				phu_colorCutoffs.Generate(newSeasonValue); 
				lhin_colorCutoffs.Generate(newSeasonValue); 
				//check if the current season is selected. 
				if ($("#yearSelected").children('option:first-child').is(':selected')) {  
					time_slider.SetTimeExtent(seasonInfo.GetStartDate((seasonInfo.GetData()).length), time_slider._getAutomatedEndDate());
				}
				else{
					time_slider.SetTimeExtent(seasonInfo.GetStartDate(newSeasonValue), seasonInfo.GetEndDate(newSeasonValue)); 
				}
				time_slider.startup();
			});  	 
			
			//PHU layer
			
			 /* ACES graph on PHU click */
			(map.getLayer('1A177D86-FADD-E412-80CA-222222222222')).on("click", function(evt){  
				acesGraph.Generate(evt); 
			});  
			
			(map.getLayer('1A177D86-FADD-E412-80CA-222222222222')).on("mouse-over", function(evt){
				// on hover we display a popup of the geoserver data description + cutoffData
				map.graphics.add(mapperPopup.Generate(evt, "poly", phu_colorCutoffs.getCutoffData())); 
			}); 
			 
			(map.getLayer('1A177D86-FADD-E412-80CA-222222222222')).on("mouse-out", function(evt){
				map.graphics.clear();
				mapperPopup.Close();
			});
			 
			//Hospital layer
			(map.getLayer('1A177D86-FADD-E412-80CA-111111111111')).hide();
			(map.getLayer('1A177D86-FADD-E412-80CA-111111111111')).on("mouse-over", function(evt){
				map.graphics.add(mapperPopup.Generate(evt, "point")); 
			}); 
			
			//Needed to keep the points highlighted consistently. This can be done better. 
			var prevGraph = undefined;
			(map.getLayer('1A177D86-FADD-E412-80CA-111111111111')).on("mouse-out", function(evt){
				if(prevGraph != evt.graphic){ 
					prevGraph = evt.graphic;
					map.graphics.clear();
				}
			});
			
			//LHIN layer
			 /* ACES graph on LHIN click */
			(map.getLayer('1A177D86-FADD-E412-80CA-333333333333')).on("click", function(evt){  
				acesGraph.Generate(evt); 
			});  
			
			// on hover we display a popup of the geoserver data description + cutoffData
			(map.getLayer('1A177D86-FADD-E412-80CA-333333333333')).on("mouse-over", function(evt){
				map.graphics.add(mapperPopup.Generate(evt, "poly", lhin_colorCutoffs.getCutoffData())); 
			}); 
	 
			(map.getLayer('1A177D86-FADD-E412-80CA-333333333333')).on("mouse-out", function(evt){
				map.graphics.clear();
				mapperPopup.Close();
			});
			
			//Can be coded better 
			$('#lhin_layer').click(function(e) { 
				map.graphics.clear();
				mapperPopup.Close();
				(map.getLayer('1A177D86-FADD-E412-80CA-333333333333')).show(); // lhin layer
				(map.getLayer('1A177D86-FADD-E412-80CA-222222222222')).hide(); // hide phu layer
			}); 
			$('#hosp_layer').click(function(e) { 
				map.graphics.clear();
				mapperPopup.Close();
				if(e.target.checked == true)
				{
					  (map.getLayer('1A177D86-FADD-E412-80CA-111111111111')).show();
				}
				else
				{ 
					  (map.getLayer('1A177D86-FADD-E412-80CA-111111111111')).hide();
				}
			});
			$('#phu_layer').click(function(e) { 
				map.graphics.clear();
				mapperPopup.Close();
				(map.getLayer('1A177D86-FADD-E412-80CA-333333333333')).hide(); // lhin layer
				(map.getLayer('1A177D86-FADD-E412-80CA-222222222222')).show(); // hide phu layer
			}); 
		  
		});
	}
	if($("#aboutPage").length){
		
		/* Season Content */ 
		var seasonContent = new content();  
		seasonContent.Generate(5); 
	}	
	if($("#resourcePage").length){
		
		/* Season Content */ 
		var seasonContent = new content();  
		
		all([
			seasonContent.Generate(5)
		]).then(function(result){ 
			 
			var data = JSON.parse(result[0]); 
			console.log(data[7]);
			$("#linksData").html(decodeURI(data[7].description)); 

		}); 
	}
	if($("#kfla-outbreaks").length){
		
		/* Season Content */ 
		var seasonContent = new content();  
		
		all([
			seasonContent.Generate(1)
		]).then(function(result){ 
			 
			var data = JSON.parse(result[0]);  
			var ltc_retirement_index = 0; 			
			for (var x = 0; x < data.length; x++){
				if(data[x].title == 'LTC and Retirement Facilities in KFLA'){
					ltc_retirement_index = x;	
					break;
				}
			}
				
			$("#LTC_and_Retirement_Facilities_in_KFLA").html(decodeURI(data[ltc_retirement_index].description)); 

		}); 
	}
	
	
			/* Season Content */ 
			var seasonContent = new content();  
			seasonContent.Generate(s_box.GetSelectedOption()); 
});
