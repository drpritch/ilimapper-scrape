/* PUT ANY HELPER FUNCTIONS HERE TO BE USED IN VARIOUS PLACES THROUGHOUT THE APPLICATION*/
 
/* CREATE SHIIP NAMESPACE */
var ILIMAPPER = ILIMAPPER || {};

/* Gets the base url of the application */
/* IMPORTANT: The javascript variable ctx must be injected into each page that references this function*/
/* eg: <script>var ctx = "${pageContext.request.contextPath}"</script>                                                                                                    */
ILIMAPPER.getBaseURL = function() {    	
	l = window.location;
	return l.protocol + "//" + l.host + ctx;  
	
};

ILIMAPPER.getAppVersion = function() {    	
	return appVersion;	
};

ILIMAPPER.GREEN = '#1CC084';
ILIMAPPER.YELLOW = '#E4D460';
ILIMAPPER.ORANGE = '#CE774A';
ILIMAPPER.RED = '#A63446';
ILIMAPPER.GREY = '#7C8291';