
var scroll_top = 15;
var to_show_the_profile_picture = true;
var to_hide_the_profile_picture = false;

$(window).scroll(function () {
	//annimate();
});

var isHiding = false;
var isShowing = false;
var visible = true;

var annimate = function() {
  if (is_currently_below_scroll_top() && isHiding) {
    return;
  }
  if (!is_currently_below_scroll_top() && isShowing) {
    return;
  }
  
  if (is_currently_below_scroll_top() && visible) {
    hide_logo();
    return;
  }
  if (!is_currently_below_scroll_top() && !visible) {
    show_logo();
    return;
  }
};

var is_currently_below_scroll_top = function (){
	return $(window).scrollTop() >= scroll_top;
}

var hide_logo = function() {
  isHiding = true;
	$('#profile-picture').stop().animate({ width: 0 }, 200, function() { 
	  isHiding = false; 
	  isShowing = false; 
	  visible = false; 
	});
};

var show_logo = function() {
  isShowing = true;
	$('#profile-picture').stop().animate({ width: 222 }, 1000, function() { 
	  isHiding = false; 
	  isShowing = false; 
	  visible = true; 
	});
};

$(document).ready(function(){
	//$('#footer').css('margin-bottom', $(window).height() - 550 + 'px');
});
