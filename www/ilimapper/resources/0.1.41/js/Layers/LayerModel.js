define(["dojo/_base/declare", "Layers/Observable", "Layers/OnOffCheckbox"], function (declare, Observable, OnOffCheckbox)
{
	return declare(Observable,
	{
		_isVisible: undefined,			//boolean
		_displayName: undefined,		//string
		_id: undefined,					//string
		_layerImage: undefined,			//string
		_metaLink: undefined,
		_tooltip: undefined,
		_opacity: undefined,			//string
		_opacityStartValue: undefined,	//string
		_layerAttributes: undefined,    //string
		_addRemoveToggle: undefined,
		_timeLayerCheck: undefined, 
		_iconBorders: undefined,		//boolean
		_hasIconBorders: undefined,		//boolean
		_request: undefined,
		_cancelRequest: undefined,
		_experimental: undefined,
		_proxyEnabled: undefined,
		_url: undefined,
		_refreshLayer: undefined,
		_queryParams: undefined,
		_formattedDate: undefined,
		_initialDate: undefined,
		_timeExtent: undefined,
		_timeValue: undefined,
		_timeUnits: undefined,
		_timeSlider: undefined,
		_showListLoader: undefined,
		_hideListLoader: undefined,
		constructor: function (id, displayName, layerImage, queryParams, metaLink, /*tooltip,*/ url, experimental, proxyEnabled, opacity, isVisible)
		{ 
			this._id = id;
			this._displayName = displayName;
			this._layerImage = layerImage;
			this._metaLink = metaLink;
			/*this._tooltip = tooltip;*/
			//this._urlParameters = queryParams;
			//this._layerAttributes = layerAttributes;
			this._isVisible = isVisible;
			this._url = url;
			this._experimental = experimental;
			this._proxyEnabled = proxyEnabled;
			this._timeLayerCheck = false;

			this._queryParams = queryParams; 
			this._opacity = (100-parseInt(opacity))/100;   
			this._opacityStartValue = (100-parseInt(opacity))/100;
			this._initialDate = new Date();
			this._formattedDate = "";
			this._timeUnits = 'esriTimeUnitsHours';
			this.checkbox = new OnOffCheckbox(this);
		},
		AddLayerToMap: function()
		{ 
			this.set("_addRemoveToggle", true);  
		},
		RemoveLayerFromMap: function()
		{
			this.set("_addRemoveToggle", false);   
		},
		Show: function ()
		{ 
			this.set("_isVisible", true);  
		},
		Hide: function ()
		{
			this.set("_isVisible", false);
		}, 

		GetDisplayName: function ()
		{
			return this._displayName;
		},

		GetIsVisible: function ()
		{
			return this._isVisible;
		},

		GetID: function ()
		{
			return this._id;
		},

		GetMetaLink: function ()
		{
			return this._metaLink;
		},

		GetTooltip: function ()
		{
			return this._tooltip;
		},

		GetLayerImage: function ()
		{
			return this._layerImage;
		},
		
		GetExperimental: function ()
		{
			return this._experimental;
		},
		GetProxyEnabled: function ()
		{
			return this._proxyEnabled;
		},
		
		GetLayerAttributes: function()
		{
			return this._layerAttributes;
		},
		GetQueryParams: function()
		{
			return this._queryParams;
		},

		GetOpacity: function ()
		{
			return this._opacity;
		},
		SetOpacity: function (val)
		{ 
			this.set("_opacity", val); 
		},

		GetOpacityStartValue: function ()
		{
			return this._opacityStartValue;
		},
		SetOpacityStartValue: function (val)
		{ 
			this.set("_opacityStartValue", val); 
		},

		GetIconBorders: function ()
		{
			return this._iconBorders;
		},
		SetIconBorders: function (val)
		{ 
			this.set("_iconBorders", val); 
		},
		GetHasIconBorders: function ()
		{ 
			return this._hasIconBorders; 
		},
		SetHasIconBorders: function (val)
		{ 
			this.set("_hasIconBorders", true); 
		},
		SetCancelRequest: function (val){ //todo: call this.hideListLoader() here?
			this.set("_cancelRequest", val);
		},
		GetRefreshLayer: function () { //todo: call this.showListLoader() here?
			return this._refreshLayer;
		},
		SetRefreshLayer: function (val)
		{
			this.set("_refreshLayer", val); 
		},
		GetURL: function ()
		{
			return this._url; 
		}, 	  	 
		GetMinTimeValue: function ()
		{
			return this._minTimeValue;
		},
		GetMaxTimeValue: function ()
		{
			return this._maxTimeValue;
		},
		GetStepInterval: function ()
		{
			return this._stepInterval;
		},
		GetTimeUnits: function ()
		{
			return this._timeUnits;
		},
		SetTimeExtent: function(timeExtent)
		{
			this.set("_timeExtent", timeExtent);

			if (this._timeSlider) {				
				this._timeSlider.createTimeStopsByTimeInterval(this._timeExtent, this._stepInterval, this._timeUnits);
				
				//this part moves the time slider thumb to the first or last available thumb index

				var thumbIndex = 0; //what will be the current position of the timeslider
				var maxStops = this._timeSlider.timeStops.length;
				
				if (this._timeUnits == 'esriTimeUnitsHours') {
					thumbIndex = Math.floor((new Date() - timeExtent.startTime) / 1000 / 60 / 60);
				}
				else if (this._timeUnits == 'esriTimeUnitsMinutes') {
					thumbIndex = Math.floor((new Date() - timeExtent.startTime) / 1000 / 60 / this._stepInterval);
				}
				
				thumbIndex = thumbIndex < 0 ? 0 : thumbIndex; //clamp at zero index
				thumbIndex = thumbIndex > maxStops - 1 ? maxStops - 1 : thumbIndex; //clamp at max available index
				
				//if (this._displayName == "RADAR")
				//	console.log(thumbIndex, maxStops);
				
				this._timeSlider.setThumbIndexes([thumbIndex, thumbIndex]);
				this._timeSlider.startup();
			}
		},
		GetTimeExtent: function ()
		{ 
			return this._timeExtent;
		},
		GetInitialDate: function ()
		{  
			return this._initialDate;
		},
		SetInitialDate: function(initialDate)
		{
			this._initialDate = initialDate;
			this.SetTimeValue(initialDate);
		},
		GetFormattedDate: function() {
			return this._formattedDate;
		},
		SetTimeValue: function(timeValue) {
			//console.log("timeValue: ", timeValue);
			var localeDate = timeValue.toLocaleDateString();
			var hours = timeValue.getHours() % 12 == 0 ? 12 : timeValue.getHours() % 12;
			var minutes = this.GetTimeUnits() == 'esriTimeUnitsMinutes' ? ((timeValue.getMinutes() <= 9) ? "0" : "") + timeValue.getMinutes() : "00"; 
			var ampm = timeValue.getHours() <= 11 ? "AM" : "PM";
			this._formattedDate = localeDate + " - " + hours + ":" + minutes + ":00 " + ampm;
			this.set("_timeValue", timeValue);
		},
		GetTimeValue: function() {
			return this._timeValue;
		},
		HasMetaData: function() {
			return this._hasMetaData;
		},
		/*GetTimeSlider: function() {
			return this._timeSlider;
		},*/
		SetTimeSlider: function(timeSlider) {
			this._timeSlider = timeSlider;
		},
		showListLoader: function() {
			$("#layer-list-loader-"+this._id).css("display", "block");
		},
		hideListLoader: function() {
			$("#layer-list-loader-"+this._id).css("display", "none");
		},
		spinnerIsVisible: function() {
			return $("#layer-list-loader-"+this._id).css("display") == "block";
		}
	});
});