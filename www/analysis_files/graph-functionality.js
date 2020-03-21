$("#graphInfo-epicurve1").css("display","block");
$("#border-epicurve1").addClass("thumbnail-borders"); 

$(document).ready(function () {

	// hide resp graph on close button click
	$('#resp-graph-container button').click(function () {
		$('#resp-graph-container').hide();
	})
	
	// echarts resizing on window resize
	window.onresize = function() {
		var id = $('#resp-graph').attr('_echarts_instance_')
		if (id !== undefined) window.echarts.getInstanceById(id).resize();
		try{
			if (echartsInstance) echartsInstance.resize()
		}
		catch(err) {
			console.log(err);
        }
	}

	$('#error-notification .close').click(function() {
		$('#error-notification').fadeOut(200);
	})
})


/*$( ".thumbnails img" ).click(function(e) { 
	//$("#imageViewer").slideDown(1000).attr("src",e.target.src); 
	console.log(e.target.id);
	var image = $("#imageViewer");
    image.fadeOut('fast', function () {
        image.attr('src', e.target.src);
        image.fadeIn('fast');
    }); 
	var images = $( ".thumbnails img" ); 
	for(var i = 0; i < images.length;i++)
	{ 
		if(images[i].id == e.target.id)
		{ 
			$("#graphInfo-"+ images[i].id).css("display","block");  
			$("#border-"+ images[i].id).addClass("thumbnail-borders"); 
		}
		else
		{ 
			$("#graphInfo-"+ images[i].id).css("display","none");
			$("#border-"+ images[i].id).removeClass("thumbnail-borders");  
		}
	} 
}); 
*/ 
