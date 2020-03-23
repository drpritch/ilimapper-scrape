define(["dojo/_base/declare"], function (declare)
{
	return declare(null,
	{  
		_layerInfo: undefined,
		constructor: function ()
		{   
			this._layerInfo =   
				[
				{
					"id": "1A177D86-FADD-E412-80CA-222222222222",
					"dataSourceType": "WMS",
					"dataSourceFormat": "KML",
					"displayName": "Public Health Units",
					//"baseURL": "http://proxy.kflaphi.ca/?http://geo2.kflaphi.ca/geoserver/Mapper/wms",
					//"baseURL": "http://geo.kflaphi.ca/geoserver/testing/wms?",
					"baseURL": "KFLA-ili_mapper.kml",
					//"url": "http://proxy.kflaphi.ca/?http://geo2.kflaphi.ca/geoserver/Mapper/wms?service=WMS&version=1.1.0&request=GetMap&layers=Mapper:ILI_Mapper&styles=&bbox=-1.059258602933216E7,5117780.904521567,-8275939.582823402,7731361.2294783145&width=680&height=768&srs=EPSG:3857&format=application%2Fvnd.google-earth.kml%2Bxml",
					"url": "KFLA-ili_mapper.kml",
					//"url": "http://proxy.kflaphi.ca/?http://geo2.kflaphi.ca/geoserver/Mapper/wms?service=WMS&version=1.1.0&request=GetMap&layers=Mapper:ILI_Mapper&styles=&bbox=-1.059258602933216E7,5117780.904521567,-8275939.582823402,7731361.2294783145&width=680&height=768&srs=EPSG:3857&format=application%2Fvnd.google-earth.kml%2Bxml",
					"metaDataURL": "",
					"legendURL": "https://s3.amazonaws.com/geoserver-images/lhin.png",
					"requireProxy": false,
					"experimental": false, 
					"timeEnabled": false, 
					"defaultLayer": true,
					"isVisible": true, 
					"opacity": 0,
					"folderName": "",
					"folderID": "",
					"URLParams":   
					{
						"request": "GetMap",
						"srs": "EPSG:3857",
						"service": "WMS",
						//"layers": "Mapper:ILI_Mapper",
						"layers": "KFLA:ili_mapper",
						"format": "application/vnd.google-earth.kml+xml",
						"version": "1.1.0",
						"styles": "", 
						"bbox": "-1.059258602933216E7,5117780.904521567,-8275939.582823402,7731361.2294783145",
						"viewparams": "ClassID:Resp;WeekAdmission:2015-12-20;GeoType:PHU"
					},
					"timeParams": { 
						"min": "2",
						"max": "20",
						"interval": "1",
						"units": "esriTimeUnitsHours" 
					} 
				},
				{
					"id": "1A177D86-FADD-E412-80CA-333333333333",
					"dataSourceType": "WMS",
					"dataSourceFormat": "KML",
					"displayName": "Local Health Integration Networks",
					//"baseURL": "http://proxy.kflaphi.ca/?http://geo2.kflaphi.ca/geoserver/kfla/wms",
					//"baseURL": "resources/lhin.kml",
					// "baseURL": "http://proxy.kflaphi.ca/?http://geo2.kflaphi.ca/geoserver/KFLA/ows",
					"baseURL": "KFLA-ili_mapper_lhin.kml",
					"url": "http://proxy.kflaphi.ca/?http://geo2.kflaphi.ca/geoserver/kfla/wms?service=wms&request=GetMap&version=1.1.1&format=application/vnd.google-earth.kml+xml&layers=kfla:vLHIN1000&styles=LHINs&height=1&width=1&transparent=false&srs=EPSG:4326",
					"metaDataURL": "",
					"legendURL": "https://s3.amazonaws.com/geoserver-images/lhin.png",
					"requireProxy": false,
					"experimental": false,
					"timeEnabled": false,
					"defaultLayer": false,
					"isVisible": false,
					"opacity": 0,
					"folderName": "",
					"folderID": "",
					"URLParams":  
					{
						"request": "GetMap",
						"srs": "EPSG:3857",
						"service": "WMS", 
						"layers": "KFLA:ili_mapper_lhin",
						"format": "application/vnd.google-earth.kml+xml",
						"version": "1.1.0",
						"styles": "", 
						"bbox": "-1.059258602933216E7,5117780.904521567,-8275939.582823402,7731361.2294783145",
						"viewparams": "ClassID:Resp;WeekAdmission:2015-12-20;GeoType:LHIN"
					},
					"timeParams": { 
						"min": "2",
						"max": "20",
						"interval": "1",
						"units": "esriTimeUnitsHours" 
					} 
				}, 
				{
					"id": "1A177D86-FADD-E412-80CA-111111111111",
					"dataSourceType": "WMS",
					"dataSourceFormat": "KML",
					"displayName": "Hospitals",
					"baseURL": "KFLA-Hospitals_ER.kml",
					//"baseURL": "http://prodcl1.kflaphi.ca/geoserver/kfla/wms?",
					"url": "KFLA-Hospitals_ER.kml",
					"metaDataURL": "",
					"legendURL": "https://s3.amazonaws.com/geoserver-images/lhin.png",
					"requireProxy": false,
					"experimental": false,
					"timeEnabled": false,
					"defaultLayer": true,
					"isVisible": true,
					"opacity": 0,
					"folderName": "",
					"folderID": "",
					"URLParams":  
					{
						"request": "GetMap",
						"srs": "EPSG:3857",
						"service": "WMS",
						"layers": "KFLA:Hospitals_ER",
						"format": "application/vnd.google-earth.kml+xml",
						"version": "1.1.0",
						"styles": "hospitals_available", 
						"bbox": "-1.059258602933216E7,5117780.904521567,-8275939.582823402,7731361.2294783145" 
					},
					"timeParams": { 
						"min": "2",
						"max": "20",
						"interval": "1",
						"units": "esriTimeUnitsHours" 
					}  
				}
			];
		},
		GetLayerInfo: function(){
			return this._layerInfo;
		}		    
	});
});  
