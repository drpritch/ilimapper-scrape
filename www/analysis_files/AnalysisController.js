/**
 * Controller for the /analysis page
 * @param {Object} analysisView 
 * @param {Object} analysisModel 
 */
var AnalysisController = function (analysisModel, analysisView) {
    this._analysisModel = analysisModel;
    this._analysisView = analysisView;

    var _this = this;

    this._analysisView.regionSelected.attach(function (sender, args) {
        _this.updateRespData(args.regionCode);
    })
}

AnalysisController.prototype = {

    updateRespData: function (regionCode) {
        this._analysisModel.setRegion(regionCode);
    },

}