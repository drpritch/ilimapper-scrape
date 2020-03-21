var echartsInstance = echarts.init($('#analysis-graph-container')[0]);
var model = new AnalysisModel('KFLA'),
    view = new AnalysisView(model, {
        'regionSelect': $('#region-select'),
        'pctRespVisitContainer': $('#percent-resp-visits'),
        'respVisitsContainer': $('#total-resp-visits'),
        'totalEDVisitsContainer': $('#total-ed-visits'),
        'iliStatusContainer': $('#ili-status'),
        'iliActivityTable': $('#ili-activity-table'),
        'graph': echartsInstance,
        'loading': $('.loading-spin')
    }),
    controller = new AnalysisController(model, view);

$(document).ready(function() {

    var $regionSelect = $('#region-select').select2();
    $regionSelect.trigger('change'); 

    /*window.onresize = function() {
		try{
			echartsInstance.resize()
		}
		catch(err) {
			console.log(err);
        }
    }*/
})


