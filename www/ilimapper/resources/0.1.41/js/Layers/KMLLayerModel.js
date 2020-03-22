define(["dojo/_base/declare",
        "esri/config",
        "Layers/LayerModel",
        "esri/layers/KMLLayer",
        "dojo/request/xhr",
        "dojo/request/script",
        "dojo/_base/lang", 
        "esri/layers/GraphicsLayer", 
        "esri/config",
        "esri/geometry/Point",
        "esri/symbols/SimpleMarkerSymbol",
        "esri/graphic",
        "esri/SpatialReference",
        "esri/layers/layer",
        "esri/symbols/PictureFillSymbol", 
        "esri/symbols/SimpleLineSymbol",
        "esri/graphic",
        "dojo/_base/Color",
        "esri/InfoTemplate",
        "esri/symbols/PictureMarkerSymbol",
		"esri/geometry/Polygon", 
		"esri/geometry/Polyline", 
		"esri/SpatialReference",
        "esri/symbols/SimpleFillSymbol",
		"dojo/on",
		"esri/layers/DynamicMapServiceLayer",
		"esri/symbols/TextSymbol", 
		"esri/Color", 
		"esri/symbols/Font",
		], function (declare, esriConfig, LayerModel, KMLLayer, xhr, script, lang, GraphicsLayer, 
        		esriConfig, Point, SimpleMarkerSymbol, Graphic, SpatialReference, layer, 
        		PictureFillSymbol, SimpleLineSymbol, Graphic, Color, InfoTemplate, PictureMarkerSymbol, Polygon, Polyline, SpatialReference, SimpleFillSymbol, on, DynamicMapServiceLayer, TextSymbol, Color, Font)
        		{
	return declare(LayerModel,
	{ 
		_newLayer: undefined, 
		_myClick: undefined, 
		_lang: undefined,
		_service: undefined, 
		_version: undefined,
		_request: undefined,
		_layers: undefined, 
		_srs: undefined,
		_format: undefined,
		_layerAttributes: undefined, 
		_queryParams: undefined,
		_aqhiSensorData:undefined,
		constructor: function (id, displayName, layerImage, queryParams, metaLink, /*tooltip,*/ url, experimental, proxyEnabled, opacity, isVisible, timeParams, timeEnabled)
		{  
			this._url = url; 
			if(proxyEnabled){ 
				this._url = ILIMAPPER.getBaseURLWithProxy() + url
			}
			
			// Icons can't load on localhost with proxy
			if (ILIMAPPER.getBaseURL().indexOf('localhost') > 0) {
				this.iconProxy = '';
			}
			else {
				this.iconProxy = 'https://proxy.kflaphi.ca/?';
			}

			this._displayName = displayName;
			
			//TODO Refactor KML polygon layers to not have borders. Aces layer set manually below 
			if(displayName != "Acute Care Enhanced Surveillance (ACES)")
			{
				this._hasIconBorders = true;    
			}
			this._newLayer = new GraphicsLayer();
			this._newLayer.id = this._id;  
			this._newLayer.visible = isVisible;  
			this._myClick = "";
			 
			this._layerAttributes = "";
		
			this._timeLayerCheck = timeEnabled;   
			this._minTimeValue = parseInt(timeParams.min);
			this._maxTimeValue = parseInt(timeParams.max);
			this._stepInterval = parseInt(timeParams.interval);
			this._timeUnits = timeParams.units;
			this._layerType = "KMLLayerModel";
		},
 
		GenerateLayer: function(bbox)
		{ 
			//console.log("generate layer bounding box for kmllayer: ", bbox);
			this._updateKMLLayer(bbox);  
			 
			/*this._newLayer.on("graphics-clear", function(g){
					this._updateKMLLayer();
			}.bind(this));
			
			newLayer.on("update-end", function(g){
				cosnole.log("kml update end");
				$("#"+this._id).css("display", "none"); 				
			}.bind(this)); */
			return this._newLayer; 
		},
		 
		// first index of userAttributes belongs to the name of the infoWindow 
		// The users supply userAttributes from the XML file. 
		_CreateInfoTemplate: function (ua, des) // ua for userAttributes, des for description
		{  
			var build = "";
			var name = "";
			var patt = new RegExp(/http:+.+jpg/g);
						
			if (ua == "")
			{ 
				for (var j = 0; j< des.length; j++)
				{  
					if(des[j].search(/http:+.+jpg/g))
					{
						var images = patt.exec(des[j]); 
						if(images!=null)
						{
							des[j] = des[j].replace(/http:+.+jpg/g, "<img src='"+images+"?timestamp="+(new Date()).toString()+"'>" ); 
						}
					}  
					build += des[j].replace("</li>", "<br>");	
					
					if(j==0)
					{
						name = des[j].replace("</li>", "<br>");
					}
				}
			}
			else
			{
				for (var i = 0; i< ua.length; i++)
				{
					for (var j = 0; j< des.length; j++)
					{
						if (ua[1] == "displayALL")
						{
							if (!this._AContainsB(des[j], ua[1]))
							{
								build += des[j].replace("</li>", "<br>");
							}
							if (this._AContainsB(des[j], ua[i]))
							{
								if (i == 0)
								{
									if (name == "")
									{
										name = des[j].replace(ua[i], "").replace(":", "");
									}
								}
								i = ua.length;
							}
						} 
						if (this._AContainsB(des[j], ua[i]))
						{
							if (i == 0)
							{
								if (name == "")
								{
									name = des[j].replace(ua[i], "").replace(":", "");
								}
							}
							else
							{
								build += des[j].replace("</li>", "<br>");	
							}
						}
					}
				}
			} 
			var infoT = [build.replace("]]>", "").replace("PHUs_Satellite_Final", ""), name]; 
			return infoT; 
		}.bind(this), 
		_AContainsB: function (a, b){
			return a.indexOf(b) >= 0;
		},
		_updateKMLLayer: function(bbox) {
			this.showListLoader();
			 
			var userAttributes = this._layerAttributes.split(','); 
			//xmin -8908407.5187197,ymin 5310781.471851196, xmax -8759018.08366194, ymax: 5616304.907431018
			if (this._queryParams != undefined) {		
				this._queryParams.bbox = bbox.xmin+","+bbox.ymin+","+bbox.xmax+","+bbox.ymax;
				this._queryParams.height = 1;
				this._queryParams.width = 1;
				
				//specific for Aces layer. Needs refactoring.
				if(this._displayName == "Acute Care Enhanced Surveillance (ACES)")
				{  
					this._queryParams.layers = "EMCT:EMCT"+$("#acesParams-class-"+this._id).val()
														+$("#acesParams-time-"+this._id).val()
														+$("#acesParams-log-"+this._id).val(); 
				}
				
				if (this._displayName == "Forest Fires - Reported") {
					var date = new Date(this.GetTimeValue());
					this._queryParams.viewparams = "selectedDate:" + date.toISOString();
				}
			}
			var type="xml";
			if(this._displayName == "Fire Detection"){
				type =  "text"; 
				//console.log("set type text");
			}
			
		
			this._request = xhr(this._url+"?", { 
				//xhr("resources/data/test.xml", { 
				query: this._queryParams,
				handleAs: type,
				sync:false
			}).then(function(data) {
				if(this._newLayer != undefined)
				{
					this._newLayer.clear();
				}
				
				try {
					if(this._displayName == "Fire Detection")
						data += "</Folder></Document></kml>"; //Needed as the the endpoint for this layer returns an incomplete KML file.
					
					//console.log(data);
					//data = $.parseXML(data); //data should already be xml dom
				}
				catch(e) {
					console.log(e);
				}
				
				if($(data).find("ServiceExceptionReport").length > 0)
				{
					$("#GenerateLayerError").html('<div class="alert alert-error alert-danger Alert-Error"><a href="#" class="close" data-dismiss="alert">&times;</a>Invalid KML resource.</div>');
				}	
				this.hideListLoader();
				
				var stylesFromKml = $(data).find("Style");  
				var stylesArray = [];
				var lineStyleArray = [];
				var scaleAndColorArray = [];
				var scalePointSize = [];
				var addScale = 0;
				var iconStyle, icon, href1, color; 
				for (var i = 0 ; i < stylesFromKml.length; i++)
				{  
					if(stylesFromKml[i].getElementsByTagName("LineStyle").length > 0)
					{ 
						lineStyle = stylesFromKml[i].getElementsByTagName("LineStyle");  
						var c = "", w = "";
						if(lineStyle[0].getElementsByTagName("color").length > 0)
						{	
							c = lineStyle[0].getElementsByTagName("color")[0].childNodes[0].data; 
							cAA = c[0]+c[1]; 
							cRR = c[6]+c[7];
							cGG = c[4]+c[5];
							cBB = c[2]+c[3];
							c = "#"+cRR+cGG+cBB;
						}
						if(lineStyle[0].getElementsByTagName("width").length > 0)
						{	
							w = lineStyle[0].getElementsByTagName("width")[0].childNodes[0].data; 
						}
						
						stylesArray[stylesFromKml[i].getAttribute('id')] = {color: c, width: w, type:"line"};
					}
			
			
					if(stylesFromKml[i].getElementsByTagName("IconStyle").length > 0)
					{ 
						iconStyle = stylesFromKml[i].getElementsByTagName("IconStyle");  
						if(iconStyle[0].getElementsByTagName("Icon").length > 0)
						{
							icon = iconStyle[0].getElementsByTagName("Icon"); 							
							if(icon[0].getElementsByTagName("href").length > 0) // we have an icon with image
							{	 
								href1 = iconStyle[0].getElementsByTagName("Icon")[0].getElementsByTagName("href")[0].childNodes[0].data;   
								stylesArray[stylesFromKml[i].getAttribute('id')] = {link: this.iconProxy + href1, type:"url"};
							}
						}
						//Need to add custom scale for now. Unable to add multiple renderer classes to one graphics layer. 
						if(iconStyle[0].getElementsByTagName("scale").length > 0)
						{	
							iconScale = iconStyle[0].getElementsByTagName("scale")[0].childNodes[0].data;    
							//no duplicates. Need this array to setup the renderer
							if(scaleAndColorArray.length > 0)
							{
								for(var o = 0; o < scaleAndColorArray.length; o++)
								{
									if(scaleAndColorArray[o].iconScale != iconScale)
									{
										addScale = 1;  
									}
									else{
										addScale = 0;   
									}
								}
							}
							if(scaleAndColorArray.length == 0)
							{ 
								scaleAndColorArray.push({"iconScale": iconScale}); 
								scalePointSize[iconScale] = (((iconScale/8)) * 1000)*0.25;
							}
							else if(addScale == 1)
							{ 
								scaleAndColorArray.push({"iconScale": iconScale}); 
								scalePointSize[iconScale] = ((iconScale/8)* 1000)*0.25;
							}
							addScale = 0; 
						} 
					} 
				} 		 			
				//Create Renderer if Scale exists
				 
				var x = $(data).find("Placemark");  
				var finalCoordinates = [];
				 
				for (var h=0;h < x.length;h++)
				{ 
			
					var dataChildren = x[h].childNodes;  					 
					var attr = {};
					var pt="";
					var href;								
					var sms = '';
					var polygon = '', polyline = '';
					var polyColor, lineColor, lineWidth=1, height = 8, width = 8; 
					attr["name"] = x[h].id;
					for (var i=0; i < dataChildren.length; i++)
					{   
						if(dataChildren[i].tagName == "name")
						{     
							attr["name"] = dataChildren[i].textContent;  						
						}
	
						if(dataChildren[i].tagName == "description")
						{   
							attr["description"] = dataChildren[i].textContent; 
							attr["description"] = attr["description"].replace(/&lt;/g, "<");
							attr["description"] = attr["description"].replace(/&gt;/g, ">");  
							
							if(attr["description"].search(/<li>/g) != -1)
							{
								 
								var sub = attr["description"].split("<li>");
								if (sub.length != 1)
								{
									sub.shift();	
								}  
								var output = this._CreateInfoTemplate(userAttributes, sub);  
								  
								attr["description"] = output[0];
							}   
						}
						
						if(dataChildren[i].tagName == "styleUrl")
						{	 			
							href = dataChildren[i].textContent; 
							href = href.replace("#", ""); 
							if(stylesArray[href] != undefined)
							{ 
								if(stylesArray[href].type == "url")
								{ 
									sms = new PictureMarkerSymbol(stylesArray[href].link, height, width); 
								}
								else if(stylesArray[href].type == "line"){ 
									var lineColorSet = new Color(stylesArray[href].color); 
									sms = new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, lineColorSet, stylesArray[href].width);
								}
							}   
						} 
						if(dataChildren[i].tagName == "Style")
						{	   
							if(dataChildren[i].getElementsByTagName("IconStyle").length > 0)
							{
								iconStyle = dataChildren[i].getElementsByTagName("IconStyle");  
								if(iconStyle[0].getElementsByTagName("Icon").length > 0)
								{ 
									icon = iconStyle[0].getElementsByTagName("Icon");  
									href1 = icon[0].getElementsByTagName("href")[0].childNodes[0].data;   
									//proxy needed b/c geoserver uses SLD code to store images and create links to reference them 
									href1 = this.iconProxy + href1;
									
									/*var img = new Image(); 
									img.src = href; 
									if(img.height != 0)
									{
										height = img.height;
									}
									if(img.width != 0)
									{
										width = img.width;
									}*/  
									
									sms = new PictureMarkerSymbol(href1, height, width); 
								}							
								if(iconStyle[0].getElementsByTagName("color").length > 0)
								{ 
									attr["color"] = iconStyle[0].getElementsByTagName("color")[0].childNodes[0].data;  
								} 								
								if(iconStyle[0].getElementsByTagName("scale").length > 0)
								{ 
									var scale = iconStyle[0].getElementsByTagName("scale")[0].childNodes[0].data;   
									attr["scale"] = parseFloat(scale)
									attr["pointSize"] = scalePointSize[scale];
								}
							}
							if(dataChildren[i].getElementsByTagName("PolyStyle").length > 0)
							{							
								var polyStyle = dataChildren[i].getElementsByTagName("PolyStyle");
								
								//Must flip pairs of colors b/c 8 digit hex kml color = aa-bb-gg-rr
								var color = polyStyle[0].getElementsByTagName("color")[0].textContent;
								
								var kmlColorFlipped = color.substring(6,7) + 
													  color.substring(4,5) +
													  color.substring(2,3);
 
								polyColor = "#"+kmlColorFlipped;
							}
							if(dataChildren[i].getElementsByTagName("LineStyle").length > 0)
							{ 
								var lineStyle = dataChildren[i].getElementsByTagName("LineStyle"); 
								if(lineStyle[0].getElementsByTagName("color").length > 0)
								{
									var color = lineStyle[0].getElementsByTagName("color")[0].textContent; 
									var kmlColorFlipped = color.substring(6,7) + 
														  color.substring(4,5) +
														  color.substring(2,3); 						  
									lineColor = "#"+color;  
								} 
								if(lineStyle[0].getElementsByTagName("width").length > 0)
								{
									lineWidth = parseInt(lineStyle[0].getElementsByTagName("width")[0].textContent);   
								}
								
							} 
						}  
						if(dataChildren[i].tagName == "Point")
						{   
							//var coords = String(dataChildren[i].childNodes[1].childNodes[0].data);
							var coords = dataChildren[i].getElementsByTagName("coordinates")[0].textContent;
							
							coords.replace(" ",""); 

							var latLong = coords.split(",");  

							/*if(latLong[0] < 0)
							{
								latLong[0] = latLong[0].replace("-","");
								latLong[0] = parseFloat(latLong[0]) * -1;
							}
							else
							{
								latLong[0] = parseFloat(latLong[0]); 
							}
							if(latLong[1] < 0)
							{
								latLong[1] = latLong[1].replace("-","");
								latLong[1] = parseFloat(latLong[1]) * -1;
							}
							else
							{
								latLong[1] = parseFloat(latLong[1]); 
							}*/
							pt = new Point(latLong[0], latLong[1], new SpatialReference({ wkid:4326 }));
						} 
						if(dataChildren[i].tagName == "MultiGeometry")
						{
							if(dataChildren[i].getElementsByTagName("Polygon").length > 0)
							{
								var polygonTags = "";
								polygonTags = dataChildren[i].getElementsByTagName("Polygon");  
								var groupedCoords = [];
								for(var p = 0; p < polygonTags.length; p++)
								{  
									var coords = polygonTags[p].getElementsByTagName("coordinates")[0].textContent;
									  
									coords = "[["+coords+"]]";
									coords = coords.replace(/\s/g, "],["); 
									var formattedCoords = JSON.parse(coords); 
									groupedCoords.push(formattedCoords); 
								
								}   
								var polygonJson = {
									"rings": groupedCoords,
									"spatialReference": new SpatialReference({wkid:4326})
								}; 
								polygon = new Polygon(polygonJson);   
							}
							else if (dataChildren[i].getElementsByTagName("LineString").length > 0)
							{
								var polylineTags = "";
								polylineTags = dataChildren[i].getElementsByTagName("LineString");   
								var groupedCoords = [];
								for(var p = 0; p < polylineTags.length; p++)
								{  
									var coords = polylineTags[p].getElementsByTagName("coordinates")[0].textContent;
									
									coords = "[["+coords+"]]";
									coords = coords.replace(/\s{1,}/g, "],[");
									
									var formattedCoords = JSON.parse(coords); 
									
									groupedCoords.push(formattedCoords); 
								
								}   
								var polylineJson = {
									"paths": groupedCoords,
									"spatialReference": new SpatialReference({wkid:4326})
								}; 
								polyline = new Polyline(polylineJson); 
							} 
						} 
					} 
					if(pt!= "")
					{	 
						if(sms == "")
						{   
							if(attr["color"] != "" && attr["color"] != undefined)
							{     
								//Must flip pairs of colors b/c 8 digit hex kml color = aa-bb-gg-rr
								var kmlColorFlipped = attr["color"].substring(6,7) + 
													  attr["color"].substring(4,5) +
													  attr["color"].substring(2,3);
								//attr["color"].substring(0,6)
								
								sms = new SimpleMarkerSymbol(SimpleMarkerSymbol.STYLE_CIRCLE, attr["pointSize"],
									new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID,
											new Color([0,0,0]), 0.8),
											new Color("#"+kmlColorFlipped));
								
							} 
							else
							{
								sms = new SimpleMarkerSymbol(SimpleMarkerSymbol.STYLE_CIRCLE, 10,
									new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID,
											new Color([255,0,0]), 1),
											new Color([0,255,0,0.25]));  
							}
						}  
						if(attr["description"] == undefined){
							attr["description"] = "Description not provided"; 
						}
						if(attr["name"] == undefined || attr["name"] == ""){
							attr["name"] = this._displayName; 
						} 
						var infoTemplate = new InfoTemplate(attr["name"], attr["description"]); 
						
						var sms2 = new SimpleMarkerSymbol(SimpleMarkerSymbol.STYLE_SQUARE, 30,
									new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID,
											new Color([0,255,255, 1]), 2),
											new Color([0,0,0,0])); 
											
						var newGraphicBorder2 = new Graphic(pt, sms2, {}); 
						newGraphicBorder2.hide();
						this._newLayer.add(newGraphicBorder2); 	  
						//console.log(pt);
						  
						var newGraphic = new Graphic(pt, sms, attr, infoTemplate);	

						this._newLayer.add(newGraphic); 	 
						if(this._displayName == "Acute Care Enhanced Surveillance (ACES)")
						{
							var textSymbol =  new TextSymbol(attr["name"]).setColor(
								new Color([200,0,0])).setAlign(Font.ALIGN_START).setFont(
								new Font("11px").setWeight(Font.WEIGHT_BOLD).setFamily("Arial"));
							textSymbol.setOffset(0, 15)	
							var newGraphicText = new Graphic(pt, textSymbol, {});	
							this._newLayer.add(newGraphicText); 
						}	 
						
						sms = "";
						pt = ''; 
					} 
					
					else if(polygon != ''){ 
						if (polyColor == '#0f0') { // green
							polyColor = ILIMAPPER.GREEN;
						}
						else if (polyColor == '#f90') { // orange
							polyColor = ILIMAPPER.ORANGE;
						}
						else if (polyColor == '#ff0') { // yellow
							polyColor = ILIMAPPER.YELLOW;
						}
						else if (polyColor == '#f00') { // red
							polyColor = ILIMAPPER.RED;
						}
						else if (polyColor == '#999') {
							polyColor = ILIMAPPER.GREY;
						}
 
						//There are some Health units that have insufficient data. 
						//This is a temporary fix that will be removed when the data is fixed. 
						if(this._insufficientDataTempFix(attr["name"])){
							polyColor = ILIMAPPER.GREY;
						}
 
						var polyColorSet = new Color(polyColor);   
						 
						var lineColorSet = new Color(lineColor); 
						
						var sms = new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID,
								new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, lineColorSet, lineWidth), polyColorSet);
						
						if(attr["name"] != undefined && attr["description"] != undefined)
						{
							var infoTemplate = new InfoTemplate(attr["name"], attr["description"]); 
						}
						else
						{
							var infoTemplate = new InfoTemplate("Attributes", "${*}"); 
						} 
						var polygonGraphic = new Graphic(polygon, sms, attr, infoTemplate);
						this._newLayer.add(polygonGraphic);  
						polygon = '';
					}
					else if(polyline != ''){    

						if(attr["name"] != undefined && attr["description"] != undefined)
						{
							var infoTemplate = new InfoTemplate(attr["name"], attr["description"]); 
						}
						else
						{
							var infoTemplate = new InfoTemplate("Attributes", "${*}"); 
						} 
						
						var polylineGraphic = new Graphic(polyline, sms, attr, infoTemplate);
						this._newLayer.add(polylineGraphic);  
						polyline = '';
					}						
				}   
			}.bind(this),
			function(err) {   
				if(err.name != "CancelError") {   
					this.hideListLoader();
					if(this._id == "Modis") {
						$("#GenerateLayerError").html('<div class="alert alert-error alert-danger Alert-Error"><a href="#" class="close" data-dismiss="alert">&times;</a>The data source for this layer is not currently active. Please check back closer to the 2015 PanAm Games.</div>'); 
					}
					else {
						$("#GenerateLayerError").html('<div class="alert alert-error alert-danger Alert-Error"><a href="#" class="close" data-dismiss="alert">&times;</a>Data Source  "'+this._url+'" is currently unavailable</div>');
			 		}
					
					this.checkbox.uncheck();
				}
			}.bind(this));
			
			return this._request;
			
		},
		GetAQHISensor: function(infoContent, first)
		{  	 
			var desc = infoContent; 
			/* Regex doesn't extract just the value unfortunately. Looped it to do so */
			var attr = desc.match(/atr-value\">(.*?)<\/span><br>/g);
			for (i in attr)
			{
				attr[i] = attr[i].replace(/atr-value\">/g, "");
				attr[i] = attr[i].replace(/<\/span><br>/g, "");
			}
			
			//var infoTemplate = new InfoTemplate(attr[2], "<div id='infoData'><img //src='resources/images/loading.gif' /></div>");
			//g.graphic.setInfoTemplate(infoTemplate); 
			
			//g.infoTemplate.setTitle(attr[2]); 
			/*g.infoTemplate.setContent("<div id='infoData'><img src='"+ PHIMS.getBaseURL() +"/resources/images/loading.gif' /></div>"); 
			*/
			 
			
			var linkr =  attr[7]; // reading link
			var linkf = attr[8]; // forecast link
			
			var reading;  
			xhr(PHIMS.getBaseURLWithProxy()+linkr, { 
				handleAs: "xml"
			}).then(function(data) {
				if (data.childNodes[0].getElementsByTagName("airQualityHealthIndex"))
				{
					var y = data.childNodes[0].getElementsByTagName("airQualityHealthIndex");
					reading = y[0].textContent;
				}
				else
				{
					reading = "N/A";  
				}
				//desc = desc.replace(linkr, reading); 
				 
				var linkr2 =  linkr; // reading link
				var linkf2 = linkf; // forecast link
			 
				xhr(PHIMS.getBaseURLWithProxy()+linkf, { 
					handleAs: "xml"
				}).then(function(data) {
					var q = function(w)
					{
						var clr;
						if (w == 1) clr = "#98CEFC";
						if (w == 2) clr =  "#63CDFD";
						if (w == 3) clr =  "#00CCFF";
						if (w == 4) clr =  "#9ACCCD";
						if (w == 5) clr =  "#999999";
						if (w == 6) clr =  "#999967";
						if (w == 7) clr =  "#976701";
						if (w == 8) clr =  "#9A6438";
						if (w == 9) clr =  "#9A6438";
						if (w == 10) clr =  "#650100";
						if (w > 10) clr =  "#FD0100";
						return "<svg height='17' width='82'>" +
						"<circle cx='41' cy='9' r='7' stroke='black' stroke-width='1' " +
						"fill=" +
						clr +
						" /></svg> ";
					};
					var y = data.childNodes[0].getElementsByTagName("dateStamp")[0].childNodes[15].textContent;
					var x = data.childNodes[0].getElementsByTagName("forecastGroup");
					
					var ftoday = "N/A";
					var ftonight = x[0].getElementsByTagName("forecast")[0].getElementsByTagName("airQualityHealthIndex")[0].textContent;
					var ftomorrow  = x[0].getElementsByTagName("forecast")[1].getElementsByTagName("airQualityHealthIndex")[0].textContent;
					
					if(x[0].getElementsByTagName("forecast")[2]!= undefined)
					{
						ftoday = x[0].getElementsByTagName("forecast")[0].getElementsByTagName("airQualityHealthIndex")[0].textContent;
						ftonight = x[0].getElementsByTagName("forecast")[1].getElementsByTagName("airQualityHealthIndex")[0].textContent;
						ftomorrow  = x[0].getElementsByTagName("forecast")[2].getElementsByTagName("airQualityHealthIndex")[0].textContent;
					} 
					
					var forecast = "<b>Last Updated:</b> " + y + "<br><br><table border='1' style='width:252px" +
					"; table-layout:fixed; text-align:center'" + 
					"<tr><td>Today</td><td>Tonight</td><td>Tomorrow</td>" +
					"</tr><tr><td>" + ftoday + q(ftoday) + "</td><td>" + ftonight + 
					q(ftonight)+ "</td><td>" +
					+ ftomorrow + q(ftomorrow) + "</td></tr>" +
					"</table>" + "<img src = 'resources/images/aqhi.png' height = '50'" +
					"width = '252' style='margin-top:3px'><br>"; 
					 
				
					//desc = desc.replace(linkf, forecast);
					 
					 
					var sub2 = desc.split("<strong>");
						   
					
					sub2[9] = sub2[9].replace("</ul>", "");
					sub2[9] = sub2[9].replace("]]>", ""); 	 
					sub2[9] = sub2[9].replace("Forcast", "");
					sub2[9] = sub2[9].replace(":", "");
					sub2[9] = sub2[9].replace("</strong>", "");
					sub2[0]="";
					sub2[6] = "";
					sub2[7] = "";
					for (var k = 0; k<sub2.length; k++)
					{
						sub2[k] = sub2[k].replace("</li>", "<br/>");
					}
					 
					
					var desc3 = forecast + "<br><br><b>Reading: </b>"+ reading +"<br>"+ sub2[5] + sub2[1] + sub2[2]; 
					  
					desc3.replace(linkr2, reading); 
					desc3.replace(linkf2, forecast);
					
					
					//desc = desc.replace(linkr, reading); 
					
					//var name = sub2[3].substring(73, sub2[3].length - 12);
				
					//name=name.replace("</","");    
					//g.infoTemplate.setContent(desc);
					//console.log(desc);
					$("#wrapper-"+this.GetID()+"-"+first).html(desc3);
					//this._aqhiSensorData = desc; 
				}.bind(this), 						
				function(err)
				{
					$("#wrapper-"+this.GetID()+"-"+first).html("Error retrieving data"); 
				}); 
			}.bind(this), 						
			function(err)
			{
				$("#wrapper-"+this.GetID()+"-"+first).html("Error retrieving data"); 
			}
			
			); 
			
			//return this._aqhiSensorData; 
			
		},
		GetAQISensor: function(infoContent, first)
		{  	  
			$("#info-window-title-"+first).html("");
			var re= /<strong><span class="atr-name">City<\/span>:<\/strong> <span class=\"atr-value\">(.*)<\/span>/;
			var stn = re.exec(infoContent);		
			var reading;  
			xhr(PHIMS.getBaseURLWithProxy()+"http://www.airqualityontario.com/press/xml_summary.php", { 
				handleAs: "xml"
			}).then(function(data)
			{
				//var stn = desc.replace('<strong><span class="atr-name">City</span>:</strong> <span class="atr-value">', "");
				//stn = stn.replace("</span>","");
				 
				var stations = data.childNodes[0].getElementsByTagName("entry"); 
				var html = "N/A";
				var title = "N/A";
				for(var i = 0; i < stations.length; i++)
				{   
					var patt = new RegExp(stn[1]+":"); 
					if(patt.test(stations[i].getElementsByTagName("title")[0].childNodes[0].data))
					{ 	  
						title = stations[i].getElementsByTagName("title")[0].childNodes[0].data;
						html =  "<b>Summary:</b> "+stations[i].getElementsByTagName("summary")[0].childNodes[0].data
												+ "<br>" + 
								"<b>Last Updated:</b> "+stations[i].getElementsByTagName("updated")[0].childNodes[0].data 
												+ "<br>" + 
								"<b>Link:</b> <a href='"+stations[i].getElementsByTagName("link")[0].getAttribute('href')+"' target='_blank'> " +stations[i].getElementsByTagName("link")[0].getAttribute('href')+ "</a></div>";
						break;
					} 
				} 
				$("#info-window-title-"+first).html(title);
				$("#wrapper-"+this.GetID()+"-"+first).html(html);
				 
			}.bind(this), 						
			function(err){
				$("#wrapper-"+this.GetID()+"-"+first).html("Error retrieving data"); 
			}
			
			); 
			
			//return this._aqhiSensorData; 
			
		},
		// From Jan 5th to Jan 27th there was insufficient datafor the health units below.
		// This function returns a boolean to determine if the health units should be greyed out or not. 
		_insufficientDataTempFix: function (name){   
			var viewparams = (this._queryParams.viewparams).split("WeekAdmission:");		
			var dateRequest = viewparams[1].split(";");
			var dateDemarcationStart = new Date('2019-01-12');
			var dateDemarcationEnd = new Date('2019-01-27'); 	 
			var dateRequest = new Date(dateRequest[0]); 
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

		}
	});
});  
