define(["dojo/_base/declare",
		"dojo/_base/xhr" ], function (declare, xhr)
{
	return declare(null,
	{   
		_data: undefined,  
		_currentSeasonSelected: undefined,
		constructor: function ()
		{     
		},
		Generate: function(season){
			return xhr.get({ 
				url: ILIMAPPER.getBaseURL() + "/API/getMapperContent?flu_season="+season,  
				sync: false,
				load: function(data) {
					var data = JSON.parse(data); 
					for(var i in data){
						var id = (data[i].title).replace(/\s/g , "_"); 
						var desc = decodeURI(data[i].description);  
						if(id=="PHU_Cutoff_Footer_Text"){
							$("."+id).css("opacity", 0).html(desc).animate({ opacity: 1 }, 500, "linear");  
						}
						else if(id=="LTC_and_Retirement_Facilities_in_KFLA"){ 
							$("."+id).css("opacity", 0).html(desc).animate({ opacity: 1 }, 500, "linear");   
							$("."+id+" > table").addClass('table table-bordered');
							$("."+id+" > table>tbody>tr>td").css('padding','5px');  
							break; 
						}else{
							if($("#"+id).length > 0){
								$("#"+id).css("opacity", 0).html(desc).animate({ opacity: 1 }, 500, "linear");
							}  	
						}
					} 		  
				}.bind(this), 
				error: function() { 
				} 
			});  
		}  
	});
});  
