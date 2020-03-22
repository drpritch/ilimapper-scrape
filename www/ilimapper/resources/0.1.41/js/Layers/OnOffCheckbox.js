define(["dojo/_base/declare"], function(declare) {
	
	return declare(null, {
		constructor: function(parentLayer) {
			this.isChecked = false;
			this.parentLayer = parentLayer;
		},

		check: function() {
			this.isChecked = true;
			$("#layer-checkbox-"+this._id).click();
		},
		
		uncheck: function() {
			console.log(this);
			this.isChecked = false;
			this.parentLayer.hideListLoader();
		},
		
		click: function() {
			$("#layer-checkbox-"+this._id).click();
		}
	});
});