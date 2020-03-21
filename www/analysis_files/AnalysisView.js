var AnalysisView = function(analysisModel, elements) {

    this._analysisModel = analysisModel; // analysisModel.js reference
    this._elements = elements; // UI elements reference

    this.regionSelected = new Event(this); // event listened in AnalysisController

    var _this = this;

    // Model listeners
    
    this._analysisModel.regionSet.attach(function () {
        _this.rebuildRespDataView();
    })
    this._analysisModel.iliActivitySet.attach(function() {
        _this.rebuildRespStatusView();
    })
    // On error thrown in model, we toggle the error message
    this._analysisModel.errorThrown.attach(function () {
        _this.displayError();
    })

    // Element Listeners

    // On region select box change, we notify model and update
    this._elements.regionSelect.change(function (e) {
        _this._elements.loading.show();
        _this.regionSelected.notify({
            regionCode: e.target.value
        });
    })
}

AnalysisView.prototype = {

    // Toggle the error notification into the view
    displayError: function() {
        $('#error-notification .error-msg').text(this._analysisModel.errorStatus)
        $('#error-notification').fadeIn(200);
    },

    // Rebuilds the entire graph card UI
    rebuildRespDataView: function () {
        
        // Set text for the last day of data
        this._elements.pctRespVisitContainer.find('.data-value').text(this._analysisModel.getCurrentPctResp() + '%');
        this._elements.respVisitsContainer.find('.data-value').text(this._analysisModel.getCurrentRespVisits());
        this._elements.totalEDVisitsContainer.find('.data-value').text(this._analysisModel.getCurrentTotalVisits());

        // Calculate and set % change
        this._setChange(this._elements.pctRespVisitContainer, this._analysisModel.pctResp);
        this._setChange(this._elements.respVisitsContainer, this._analysisModel.respVisits);
        this._setChange(this._elements.totalEDVisitsContainer, this._analysisModel.totalVisits);

        this._rebuildGraph();
        this._elements.loading.hide();
    },

    // Rebuilds the ILI Status section with colors
    rebuildRespStatusView: function() {
        
        var respData = this._analysisModel.getRespStatusData();

        this._elements.iliActivityTable.find('tbody .date-text').text('');
        this._elements.iliActivityTable.find('tbody .status-text').text('');
        this._elements.iliActivityTable.find('.status-icon').attr('class', 'status-icon');        
        
        // Iterate through the 8 rows of data returned and set the date + status color 
        for (week in respData) {
            this._elements.iliActivityTable.find('tbody tr:nth-child(' + (parseInt(week) + 1) + ') .date-text')
                .text(respData[week].AdmissionWeek)
            this._elements.iliActivityTable.find('tbody tr:nth-child(' + (parseInt(week) + 1) + ') .status-icon')
                .attr('class', 'status-icon ' + respData[week].Colour)

            this._elements.iliActivityTable.find('tbody tr:nth-child(' + (parseInt(week) + 1) + ') .status-text')
                .text(respData[week].Colour)
        }
    },

    _rebuildGraph: function() {
        
        // echarts config. Go to echarts documentation to find out how to configure this
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
                data: this._analysisModel.dates
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
                    data:this._analysisModel.pctResp
                },
                {
                    name:'7 day moving average',
                    type:'line',
                    data:this._analysisModel.pctResp7DayMA
                }
            ],
            color: ['#007582', '#000D29'] // colors to be used
        };

        this._elements.graph.setOption(chartFormat);
    },

    /**
     * Helper Function to set the % change for the 3 analysis sections
     * @param {Object} parentContainer jquery parent container object of the data to se
     * @param {Array} dataArray array of data to use for calculated % change
     */
    _setChange: function(parentContainer, dataArray) {
        try {
            var changePercent = this._calculateChange(dataArray);
        }
        catch (err) {
            console.log(err); // TODO: Send notification
        }
        
        // set the arrow direction, done with css in _analystics.scss
        if (changePercent > 0) { // increasing change
            parentContainer.find('.arrow').attr('class', 'arrow increasing');
        }
        else { // decreasing change
            parentContainer.find('.arrow').attr('class', 'arrow decreasing');
        }

        // set pct value text
        parentContainer.find('.percent-change').text(changePercent);
    },

    /**
     * Function to calculate the percent change at an N day comparison
     * @param {Array} dataArray array of values where the first element is the oldest day
     * @param {Number} dayComparison number of days to compare. Defaults to 7, so 1 week
     * @returns {Mixed} 'no values found' if dataArray doesn't exist, or the percent change
     */
    _calculateChange: function(dataArray, dayComparison) {

        dayComparison = dayComparison || 7; // 1 week if not set
        dataArray = dataArray.slice().reverse(); // we get a new copy and reverse it

        if (!dataArray || dataArray.length < dayComparison) {
            throw 'No Data Found';
        }

        var currentSum = 0; // sum of curent week/# of dayComparisons
        var lastSum = 0; // sum of the week after currentSum
        
        for (let i = 0; i < dataArray.length; i++) {
            if (i < dayComparison) {
                currentSum += parseFloat(dataArray[i]);
            }
            else { // we are in the next week
                if (i === (dayComparison * 2)) { break; } // break once equal amount compared
                lastSum += parseFloat(dataArray[i]);
            }
        }

        return (((currentSum / lastSum) - 1) * 100).toFixed(2) // calculated % change to 2 decimals
    },
}