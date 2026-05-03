/***************************/
//@Author: Adrian "yEnS" Mato Gondelle
//@website: www.yensdesign.com
//@email: yensamg@gmail.com
//@license: Feel free to use it, but keep this credits please!					
/***************************/

//SETTING UP OUR POPUP
//0 means disabled; 1 means enabled;
var popupStatus = 0;
var smspopupStatus = 0;

//loading popup with jQuery magic!
function loadPopup(){
	//loads popup only if it is disabled
	if(popupStatus==0){
		$("#backgroundPopup").css({
			"opacity": "0.7"
		});
		$("#backgroundPopup").fadeIn("fast");
		$("#popupContact").fadeIn("fast");
		popupStatus = 1;
	}
}

function loadSmsPopup(){
	//loads popup only if it is disabled
	if(smspopupStatus==0){
		$("#backgroundSmsPopup").css({
			"opacity": "0.7"
		});
		$("#backgroundSmsPopup").fadeIn("fast");
		$("#sms_popup").fadeIn("fast");
		smspopupStatus = 1;
	}
}

//disabling popup with jQuery magic!
function disablePopup(){
	//disables popup only if it is enabled
	if(popupStatus==1){
		$("#backgroundPopup").fadeOut("fast");
		$("#popupContact").fadeOut("fast");
		popupStatus = 0;
	}
}

function disableSmsPopup(){
	//disables popup only if it is enabled
	if(smspopupStatus==1){
		$("#backgroundSmsPopup").fadeOut("fast");
		$("#sms_popup").fadeOut("fast");
		smspopupStatus = 0;
	}
}

//centering popup
function centerPopup(){
	//request data for centering
	var windowWidth = document.documentElement.clientWidth;
	var windowHeight = document.documentElement.clientHeight;
	var popupHeight = $("#popupContact").height();
	var popupWidth = $("#popupContact").width();
	//centering
	$("#popupContact").css({
		"position": "absolute",
		"top": windowHeight/2-popupHeight/2,
		"left": windowWidth/2-popupWidth/2
	});
	//only need force for IE6
	
	$("#backgroundPopup").css({
		"height": windowHeight
	});
	
}
function centerSmsPopup(){
	//request data for centering
	var windowWidth = document.documentElement.clientWidth;
	var windowHeight = document.documentElement.clientHeight;
	var popupHeight = $("#sms_popup").height();
	var popupWidth = $("#sms_popup").width();
	//centering
	$("#sms_popup").css({
		"position": "absolute",
		"top": windowHeight/2-popupHeight/2,
		"left": windowWidth/2-popupWidth/2
	});
	//only need force for IE6
	
	$("#backgroundSmsPopup").css({
		"height": windowHeight
	});
	
}



//CONTROLLING EVENTS IN jQuery
$(document).ready(function(){
	
	//LOADING POPUP
	//Click the button event!
	$("#button").click(function(){
		//centering with css
		centerPopup();
		//load popup
		loadPopup();
	});
				
	//CLOSING POPUP
	//Click the x event!
	$("#popupContactClose").click(function(){
		disablePopup();
	});
	//Click out event!
	$("#backgroundPopup").click(function(){
		//disablePopup();
	});
	//Press Escape event!
	$(document).keypress(function(e){
		if(e.keyCode==27 && popupStatus==1){
			disablePopup();
		}
	});
	$("#smspopupClose").click(function(){
		disableSmsPopup();
	});
	$("#backgroundSmsPopup").click(function(){
		//disablePopup();
	});
	$(document).keypress(function(e){
		if(e.keyCode==27 && smspopupStatus==1){
			disableSmsPopup();
		}
	});

});