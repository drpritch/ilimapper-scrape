﻿define(["dojo/_base/declare",
        "dojo/_base/Color",
		"dojo/json",
        "dojo/dom-construct",
        "esri/graphic", 
        "esri/InfoTemplate",
        "esri/dijit/Popup",
		"dijit/popup", 
        "esri/lang",
        "esri/symbols/SimpleMarkerSymbol",
        "esri/symbols/SimpleLineSymbol",
		"dojo/dom-style",], 
		function (declare, Color, JSON, domConstruct, Graphic, InfoTemplate, Popup, dijitPopup, esriLang, SimpleMarkerSymbol, SimpleLineSymbol, domStyle )
{
	return declare(null,
	{   
		_popup: undefined,
		constructor: function (ref)
		{    
			// This appears as a div at the end of <body> as class=dijitPopup
			this._popup = Popup({
					titleInBody: true
				}, domConstruct.create("div"));	
			
		},
		/**
		 * Generates the mapper popup on screen
		 * @param {Object} evt: geoserver layer point data
		 * @param {String} type: geometry (either poly or point)
		 * @param {Object} cutoffData: large dictionary of keys: GeoNum values: dictionary of green, yellow, orange, red keys
		 */
		Generate: function(evt, type, cutoffData){ 
			var polyType = 1;
			var t = "<b>${name}</b>"; 
			if(evt.graphic._graphicsLayer.id == "1A177D86-FADD-E412-80CA-111111111111"){
				evt.graphic.attributes.name = this._configureHospitalAttrs(evt.graphic.attributes.description);  

			} 		
			if(evt.graphic._graphicsLayer.id == "1A177D86-FADD-E412-80CA-333333333333"){
				evt.graphic.attributes.name = this._configureLHINAttrs(evt.graphic.attributes.description); 
				polyType = 2;
			} 			 
			
			var content = '' // content to display on hover
			if (type == 'point') { // meaning hospital
				content = evt.graphic.attributes.name;
			}
			else {
				content = this._createHoverTemplate(evt.graphic.attributes.description, cutoffData);
			}
			 
			var sms;
			
			switch (type) { 
				case "point":
					sms = this._generatePointSMS();
					break;
				case "poly":
					sms = this._generatePolySMS(polyType); 
					break;
			}

			
			var highlightGraphic = new Graphic(evt.graphic.geometry, sms);
			
			this._popup.setContent(content);
			
			// Setting popup to the left of mouse if the popup would go offscreen
			var windowWidth = $(window).width();
			var popupXPos = evt.pageX + 20;
			if (windowWidth > 480) {
				if (evt.pageX + 310 > windowWidth) {
					popupXPos = popupXPos - 320;
				}
			} else {
				popupXPos = 10; // set initial x for mobile
			}

			dijitPopup.open({
				popup: this._popup, 
				x: popupXPos,
				y: evt.pageY + 5
			});
			return highlightGraphic; 
			
		}, 
		_configureHospitalAttrs: function(text){ 
			var textSplit = text.split('<strong><span class="atr-name">SiteName</span>:</strong> <span class="atr-value">');
			var siteNameSplit = textSplit[1].split('</span>');
			var siteName = siteNameSplit[0]; 
			return siteName; 
		}, 
		_configureLHINAttrs: function(text){ 
			var textSplit = text.split('<span class="atr-name">GeogDesc</span>:</strong> <span class="atr-value">');
			var siteNameSplit = textSplit[1].split('</span>');
			var siteName = siteNameSplit[0]; 
			return siteName; 
		},
		/**
		 * Helper function to get the value of a KML descritpion attribute
		 */
		_splitAttribute: function(attributeName, text) {
			if (attributeName !== undefined) {
				var textSplit = text.split('<span class="atr-name">' + attributeName + '</span>:</strong> <span class="atr-value">');
				var siteNameSplit = textSplit[1].split('</span>');
				var attributeValue = siteNameSplit[0]; 
				return attributeValue; 
			}
			else {
				return ''
			}
			
		},
		_generatePolySMS: function(polyType){ 
			var sms = undefined;
			if(polyType == 1){
				sms = new SimpleLineSymbol(
					SimpleLineSymbol.STYLE_SOLID, 
					new Color([41,49,68]), 2
				);    
			}
			else{
				sms = new SimpleLineSymbol(
					SimpleLineSymbol.STYLE_SOLID, 
					new Color([41,49,68]), 2
				);
			}
			return sms;
		},
		_generatePointSMS: function(){  
			var sms = new SimpleMarkerSymbol(
			  SimpleMarkerSymbol.STYLE_CIRCLE, 
			  20,
			  new SimpleLineSymbol(
				SimpleLineSymbol.STYLE_SOLID,
				new Color([255,0,0]), 2
			  ),
			  new Color([255,0,0,0.0])
			); 
			//sms.setStyle('STYLE_PATH'); 
			//sms.setPath("M25.979,12.896 19.312,12.896 19.312,6.229 12.647,6.229 12.647,12.896 5.979,12.896 5.979,19.562 12.647,19.562 12.647,26.229 19.312,26.229 19.312,19.562 25.979,19.562z");   
			return sms;
		},
		/**
		 * Creates the html string which is displayed when hovering over a PHU/LHIN
		 * This function isn't effecient whatsoever, but there aren't a lot of options given that
		 * the data is one large html string that we have to parse and generate on a new one on the fly
		 * @param {String} layerDescription (evt.graphic.attributes.description) 
		 * @param {Object} cutoffData: large dictionary of keys: GeoNum values: dictionary of green, yellow, orange, red keys
		 */
		_createHoverTemplate: function(layerDescription, cutoffData) {
			//console.log(layerDescription);
			
			var geogNum = this._splitAttribute('GeogNum', layerDescription);
			//console.log(geogNum);
			var cutoffs = cutoffData[geogNum];

			var attributes = {
				'title': this._splitAttribute('GeogDesc', layerDescription),
				'iliVisits': this._splitAttribute('SyndromeVisits', layerDescription),
				'iliPercent': this._splitAttribute('SyndromePercent', layerDescription),
				'totalVisits': this._splitAttribute('TotalVisits', layerDescription),
				'color': this._splitAttribute('Colour', layerDescription),
				'week': this._splitAttribute('AdmissionWeek', layerDescription)
			};
			
			var colorText = '';
			switch (attributes['color']) { 
				case "Green":
					colorText = 'Seasonal';
					break;
				case "Yellow":
					colorText = 'Moderate';
					break;
				case "Orange":
					colorText = 'Elevated';
					break;
				case "Red":
					colorText = 'High';
					break;
				case "Grey":{
					colorText = 'Not enough data'; 
				}
			}

			var template = $(document.createElement('div')); 
			
			//There are some Health units that have insufficient data. 
			//This is a temporary fix that will be removed when the data is fixed. 
			if(this._insufficientDataTempFix(attributes['title'], attributes['week'])){ 
				
				// generate popup template 
				
				template.append(
					// title, icon color and status text
					$('<div/>', {'class': 'title'}).append(
						$('<h4 class="title">' + attributes['title'] + '</h4>' + 
							'<span class="status-icon Grey"></span><span class="base-accent-color">&nbsp; Insufficient Data</span><hr>')
					)
				).append(
					// weekly data
					$('<div/>', {'class': 'mb-2'}).append(
						$('<h5>Weekly Data (' + attributes['week'] + ')</h5>' + 
							'<ul><li><span class="base-accent-color">% of all ED visits related to ILI: </span><span class="float-right">' + attributes['iliPercent'] + '</span></li>' +
							'<li><span class="base-accent-color">Total ILI related ED visits: </span><span class="float-right">' + attributes['iliVisits'] + '</span></li>' +
							'<li><span class="base-accent-color">Total ED visits: </span><span class="float-right">' + attributes['totalVisits'] + '</span></li></ul>')
					)
				).append(
					// cutoff values
					$('<div/>', {'class': 'mb-2'}).append(
						$('<h5>Cutoff values</h5>' +
						'<div class="container"><div id="cutoffs-popup" class="row base-accent-color text-center">' + 
							'<div class="col-sm">' +
								'<span class="status-icon Green"></span><span>' + cutoffs.green + '</span></div>' +
							'<div class="col-sm">' +
								'<span class="status-icon Yellow"></span><span>' + cutoffs.yellow + '</span></div>' +
							'<div class="col-sm">' +
								'<span class="status-icon Orange"></span><span>' + cutoffs.orange + '</span></div>' +
							'<div class="col-sm">' +
								'<span class="status-icon Red"></span><span>' + cutoffs.red + '</span></div></div></div>'
						)
					)
				).append(
					$('<p>* Click the region to see interactive data.</p>')
				)
			}
			else{
					
				// generate popup template
				template.append(
					// title, icon color and status text
					$('<div/>', {'class': 'title'}).append(
						$('<h4 class="title">' + attributes['title'] + '</h4>' + 
							'<span class="status-icon ' + attributes['color'] + '"></span><span class="base-accent-color">&nbsp; ' + colorText + '</span><hr>')
					)
				).append(
					// weekly data
					$('<div/>', {'class': 'mb-2'}).append(
						$('<h5>Weekly Data (' + attributes['week'] + ')</h5>' + 
							'<ul><li><span class="base-accent-color">% of all ED visits related to ILI: </span><span class="float-right">' + attributes['iliPercent'] + '</span></li>' +
							'<li><span class="base-accent-color">Total ILI related ED visits: </span><span class="float-right">' + attributes['iliVisits'] + '</span></li>' +
							'<li><span class="base-accent-color">Total ED visits: </span><span class="float-right">' + attributes['totalVisits'] + '</span></li></ul>')
					)
				).append(
					// cutoff values
					$('<div/>', {'class': 'mb-2'}).append(
						$('<h5>Cutoff values</h5>' +
						'<div class="container"><div id="cutoffs-popup" class="row base-accent-color text-center">' + 
							'<div class="col-sm">' +
								'<span class="status-icon Green"></span><span>' + cutoffs.green + '</span></div>' +
							'<div class="col-sm">' +
								'<span class="status-icon Yellow"></span><span>' + cutoffs.yellow + '</span></div>' +
							'<div class="col-sm">' +
								'<span class="status-icon Orange"></span><span>' + cutoffs.orange + '</span></div>' +
							'<div class="col-sm">' +
								'<span class="status-icon Red"></span><span>' + cutoffs.red + '</span></div></div></div>'
						)
					)
				).append(
					$('<p>* Click the region to see interactive data.</p>')
				)
				
				
				
				if($("#yearSelected").val() == 6){ 
					var phu_lhin_titles = [
						{name: 'South West', type: 1}, 
						{name: 'Waterloo Wellington', type: 2}, 
						{name: 'Hamilton Niagara Haldimand Brant', type: 3},  
						{name: 'Champlain', type: 4}, 
						{name: 'Renfrew County and District Health Unit', type: 5}, 
						{name: 'Wellington Dufferin Guelph', type: 5}, 
						{name: 'Southwestern Public Health', type: 6},   
						{name: 'Brant County Health Unit', type: 6}, 
						{name: 'Middlesex-London Health Unit', type: 6}, 
						{name: 'Huron County Health Unit', type: 2},  
						{name: 'Perth District Health Unit', type: 2}, 
						{name: 'Waterloo Health Unit', type: 2},  
						{name: 'Haldimand-Norfolk Health Unit', type: 7}
					]
					for(var x = 0; x < phu_lhin_titles.length; x++){ 
						if(attributes['title'] == phu_lhin_titles[x].name) {
							template.append(
								$(this._addHealthUnitNote(phu_lhin_titles[x].type))
							)  
							
						}
					}
				}
				 
				if($("#yearSelected").val() == 7){ 
					var phu_lhin_titles = [ 
						{ name: 'Brant County Health Unit', type: 8 },
						{ name: 'Southwestern Public Health', type: 19 },
						{ name: 'Middlesex-London Health Unit', type: 19 },
						{ name: 'Waterloo Health Unit', type: 6 },
						{ name: 'Perth District Health Unit', type: 6 },
						{ name: 'Huron County Health Unit', type: 6 },
						{ name: 'Leeds, Grenville and Lanark District Health Unit', type: 18 },     
						{ name: 'Hamilton Niagara Haldimand Brant', type: 14 },
						{ name: 'Waterloo Wellington', type: 6 },
						{ name: 'South West', type: 19 },
						{ name: 'Erie St. Clair', type: 17 }  
					]
					
					
					for(var x = 0; x < phu_lhin_titles.length; x++){ 
						if(attributes['title'] == phu_lhin_titles[x].name) {
							template.append(
								$(this._addHealthUnitNote(phu_lhin_titles[x].type))
							)  
							
						}
					}
				}
				
				if($("#yearSelected").val() == 8){ 
				
					if(attributes['title'] == 'Niagara Regional Area Health Unit'){
						template.append(
							$('<hr><p>*Cut-offs based on inconsistent data over the past 2 influenza seasons</p>')
						) 
					}   
					
					if(attributes['title'] == 'Brant County Health Unit' ){ 
							template.append(
								$('<hr><p>Brant: *Cut-offs based on inconsistent data over the past 2 influenza seasons</p>')
							)  
					} 
				
				}
			}
			
			return template[0];
		},
		Close: function(){ 
			dijitPopup.close(this._popup);
		}, 
		_insufficientDataTempFix: function (name, week){ 
			var dateDemarcationStart = new Date('2019-01-12');
			var dateDemarcationEnd = new Date('2019-01-27'); 
			var dateRequest = new Date(week);
			var check = false;
			if((dateRequest > dateDemarcationStart && dateRequest < dateDemarcationEnd) && (
					name == "Porcupine Health Unit" ||
					name == "North Bay Parry Sound District Health Unit" ||
					name == "Timiskaming Health Unit" ||
					name == "Sudbury and District Health Unit" ||
					name == "The District of Algoma Health Unit" || 
					name == "North East"
				)
			){
				check = true;   
			}
			return check; 

		},
		_addHealthUnitNote: function(type){
			var msg = '<hr><p>*'; 
			switch (type) {
				case 1:
					msg += 'Cut-offs based on inconsistent data and only one influenza season';
					break;
				case 2:
					msg += 'Insufficient data to create cut-offs for this season, check back next year';
					break;
				case 3:
					msg += 'Cut-offs based on Niagara, Hamilton and Brant only (no data from Haldimand area)';
					break;
				case 4:
					msg += 'Cut-offs based on incomplete hospital coverage';
					break;
				case 5:
					msg += 'Cut-offs based on 50% hospital coverage';
					break; 
				case 6:
					msg += 'Cut-offs based on data from only one influenza season';
					break;
				case 7:
					msg += 'No data available';
					break;  
				case 8:
					msg += 'Cut-offs based on inconsistent data over the past 2 influenza seasons';
					break; 
				case 9: 
					msg += 'Small coverage in 2012 so data only looked at from 2013 onwards';
					break;
				case 10: 
					msg += 'Inconsistent data until summer 2015, reassess cutoffs after 2017/2018 season';
					break;
				case 11: 
					msg += 'Inconsistent data until summer 2013';
					break;
				case 12: 
					msg += 'Data more consistent as of Fall 2013';
					break;
				case 13:
					msg += 'No data from Orangeville in WDGHU so data only from two hosptials in Peel, reasssess after 2017/2018 season';
					break;
				case 14: 
					msg += 'Haldimand data is currently not collected and therefore not apart of the cut-off calculation nor should the color assessment be used for the Haldimand area';
					break; 
				case 16: 
					msg += 'No consistent data for any of the past 5 flu seasons. Better data since March 2017';
					break;
				case 17: 
					msg += 'Chatham and Lambton have much higher RESP rates than Windsor so these cut-offs are very much an in-between look';
					break;
				case 18: 
					msg += 'Based on inconsistent data';
					break;
				case 19: 
					msg += 'Cut-offs based on data from only 2 influenza seasons';
					break;
			}
			
			msg += '</p>'; 
			return msg; 	     
					    
					 
		}
	});
});  
