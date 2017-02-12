$(document).ready(function() {
	
	var lastButton = null;
	
	//handle active menu buttons
	$('#menuLeft').click(function(e) {
		$('#menuLeft').find('.active').removeClass('active');
		
		var target = $(e.target).attr('class') === 'buttonLeft' ? $(e.target).parent() : $(e.target);
		target.addClass('active');
		
		lastButton = target;
	});

	//align canvas
	$('#myCanvas').css('left',($('#menuLeft')[0].offsetWidth+5)+"px");
	
});