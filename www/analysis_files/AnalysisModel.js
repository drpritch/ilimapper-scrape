var AnalysisModel = function (regionCode) {

    this.currentRegion = regionCode; // current selected region

    this.dates = []; // Date array of data
    this.pctResp = []; // Percent Resp of ED visits
    this.pctResp7DayMA = []; // 7 day moving average of % resp
    this.respVisits = []; // Total resp ED visits
    this.totalVisits = []; // Total ED vists
    this.respStatus = []; // key value of week: color

    this.errorStatus = false;

    this.regionSet = new Event(this);
    this.iliActivitySet = new Event(this);
    this.errorThrown = new Event(this);
}

AnalysisModel.prototype = {

    /**
     *  Calls the getPercentages aces API for a specific PHU/LHIN.
     *  Sets the dates, pctResp, pctResp7DayMA, and respVisits, and totalVisits
     *  @returns nothing
     */
    _setRespData: function() {

        // reset arrays
        this.dates = [];
        this.pctResp = []; 
        this.pctResp7DayMA = []; 
        this.respVisits = [];
        this.totalVisits = [];

        var _this = this;
        //$.ajax('https://aces.kflaphi.ca/aces/ILIMapper/getPercentages?PHU=' + this.currentRegion)
        $.ajax('raw/' + this.currentRegion + '.json')
            .done( function(data) {
                if ( data && data.length ) {
                    // Put data into correct arrays (oldest date to newest date)
                    for (var day = 0; day < data.length; day++) {
                        _this.dates.push(data[day].AdmissionDate);
                        _this.pctResp.push(data[day].PctResp);
                        _this.pctResp7DayMA.push(data[day].PctRespMA7Days);
                        _this.respVisits.push(data[day].RespVisits);
                        _this.totalVisits.push(data[day].AllVisits);
                    }
                }
                else { // no data returned
                    _this.errorStatus = 'Error: No data available for this region.';
                    _this.errorThrown.notify({
                        error: 'Error fetching resp data: ' + _this.errorStatus
                    });
                }
                _this.regionSet.notify({
                    region: _this.currentRegion
                })
                
                if (_this.pctResp[0] == undefined) { // bad API data
                    _this.errorStatus = 'Error: No data available for this region.';
                    _this.errorThrown.notify({
                        error: 'Error fetching resp data: ' + _this.errorStatus
                    });

                }
            })
            .fail( function(err) {
                _this.errorStatus = 'Failure retrieving data for ' + _this.currentRegion;
                _this.errorThrown.notify({
                    error: 'Error fetching resp data: ' + _this.errorStatus
                });
            })
            
    },

    /**
     * Requests data from aces endpoint if the region is a PHU/LHIN or hits the ilimapper /API/ONColours endpoint 
     * for currentRegion=Ontario. The data retrieved is set to this.respStatus
     * _setRespStatus is called once setRegion() in the model is called.
     */
    _setRespStatus: function() {
        this.respStatus = []; // set back to nothing
        var _this = this;
        var error = false;
        if (this.currentRegion != 'ONTARIO') {
            $.ajax('https://aces.kflaphi.ca/aces/ILIMapper/getColours?PHU=' + this.currentRegion)
            .done( function(data) {
                if (data && data.length) {
                    // TODO: this data is currently in the wrong order (should be reverse, but .reverse() seems to not work)
                    _this.respStatus = data; 
                    console.log('Data should load here.')
                }
                else {
                    _this.errorStatus = 'No ILI Weekly Status available for this region.';
                    _this.errorThrown.notify({
                        error: 'Error fetching resp status: ' + _this.errorStatus
                    });
                }
                _this.iliActivitySet.notify({
                    region: _this.currentRegion
                })
            })
            .fail( function(err) {
                _this.errorStatus = 'Failure retrieving Ontario ILI colours data.';
                _this.errorThrown.notify({
                    error: 'Error fetching resp status: ' + _this.errorStatus
                });
                console.log('Data failed.')
            })
        }

        else { // Ontario endpoint is different because we manually add itt in the admin section
            // TODO: Convert the weeks from the flu season "Week x" to the actual date of that week
            $.ajax(ILIMAPPER.getBaseURL() + '/API/ONColors?flu_season=7&getReport=true')
            .done( function(data) {
                if (data && data.length) {
                    for (var week = 0; week < data.length; week++) {
                        var currentWeekUpper = '';
                        var projectedWeekUpper = '';
                        try {
                            // we uppercase the first letter in color to due with data inconsistencies 
                            if(week==0){ 
                                projectedWeekUpper =  data[week].projected_week.charAt(0).toUpperCase() + data[week].projected_week.substr(1);
                            }
                            currentWeekUpper =  data[week].current_week.charAt(0).toUpperCase() + data[week].current_week.substr(1);
                                
                        }
                        catch (err) {
                            console.log('Cant convert to uppercase during ONColors call');
                        } 
						function getPreviousMonday(week)
						{
							var date = new Date();
							var day = date.getDay();
							var prevMonday;
							if(date.getDay() == 0){
								prevMonday = new Date().setDate(date.getDate() - 7);
							}
							else{
								prevMonday = new Date().setDate(date.getDate() - day);
							} 
							//multiply last monday by 'week' to get previous Mondays 
							prevMonday = (new Date(prevMonday)).setDate((new Date(prevMonday)).getDate() - (7*week));   
							return new Date(prevMonday);
						}
						 
						var wk = getPreviousMonday(week+1);
						var title = wk.toISOString();
						title = title.split('T');
						title = title[0];
						if(week == 0 ){  
                            _this.respStatus.push({
                                'AdmissionWeek': 'Current Week Projection',
                                'Colour': projectedWeekUpper
                            }); 
						}
                        _this.respStatus.push({
                            'AdmissionWeek': title,
                            'Colour': currentWeekUpper
                        });
                    }
                    _this.iliActivitySet.notify({
                        region: _this.currentRegion
                    })
                }
                else {
                    _this.errorStatus = 'No ILI Weekly Status available for this region.';
                    _this.errorThrown.notify({
                        error: 'Error fetching resp status: ' + _this.errorStatus
                    });
                }
            })
            .fail( function(err) {
                _this.errorStatus = 'Failure retrieving Ontario ILI colours data.';
                _this.errorThrown.notify({
                    error: 'Error fetching resp status: ' + _this.errorStatus
                });
            })
        }

    },

    // Get latest # of resp visits
    getCurrentRespVisits: function() {
        return this.respVisits[this.respVisits.length - 1];
    },

    // Get latest % of resp percent visits 
    getCurrentPctResp: function() {
        let pctResp = parseFloat(this.pctResp[this.pctResp.length - 1]);
        return pctResp.toFixed(3);
    },

    // Get latest # of total ED visits
    getCurrentTotalVisits: function() {
        return this.totalVisits[this.totalVisits.length - 1];
    },

    // Returns the latest weeks ILI colour
    getCurrentRespColour: function() {
        return this.respStatus[-1]['Colour'];
    },

    // Returns the list of [{Date:, Colour:}]
    getRespStatusData: function() {
        return this.respStatus;
    },

    /**
     * Sets the current region and the gets the relevant resp data and status
     * TODO: I feel like this is a bit of an MVC anti-pattern but idk
     * @param {String} regionCode the code for the region 
     */
    setRegion: function(regionCode) {

        this.currentRegion = regionCode; // set regionCode, very important.

        try {
            this._setRespData();
        }
        catch (err) {
            console.log('Error fetching resp data: ', err);
            this.errorThrown.notify({
                error: 'Error fetching resp data: ' + this.errorStatus
            });
        }
        try{
            this._setRespStatus();
        }
        catch(err) {
            this.errorThrown.notify({
                error: 'Error fetching resp status: ' + this.errorStatus
            });
        }

    }

}
