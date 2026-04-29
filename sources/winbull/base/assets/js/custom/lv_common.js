//Google Analtics
/* (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
(i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
})(window,document,'script','//www.google-analytics.com/analytics.js','ga');
ga('create', 'UA-37298582-1', 'auto');
ga('send', 'pageview'); */
var browserName=navigator.appName; 
if (browserName=="Microsoft Internet Explorer")
{
    var x=confirm("Kindly Use Google Chrome or Mozila Firefox For Live Rates!");
    if(x)
    window.open("http://www.google.com/chrome", '_self');
    else
    window.open("http://www.google.com/chrome", '_self');
}
var message="Sorry, right-click has been disabled"; 
/////////////////////////////////// 
function clickIE() {if (document.all) {(message);return false;}} 
function clickNS(e) {if 
(document.layers||(document.getElementById&&!document.all)) { 
if (e.which==2||e.which==3) {(message);return false;}}} 
if (document.layers) 
{document.captureEvents(Event.MOUSEDOWN);document.onmousedown=clickNS;} 
else{document.onmouseup=clickNS;document.oncontextmenu=clickIE;} 
document.oncontextmenu=new Function("return false") 

document.onkeydown=disableCtrlKeyCombination;
function disableCtrlKeyCombination(e)
{
	//list all CTRL + key combinations you want to disable
	//alert(1);
	var forbiddenKeys = new Array('a', 'n', 'c', 'x', 'v', 'j', 's');
	var key;
	var isCtrl;
	if(window.event)
	{
			key = window.event.keyCode;     //IE
			if(window.event.ctrlKey)
					isCtrl = true;
			else
					isCtrl = false;
	}
	else
	{
			key = e.which;     //firefox
			if(e.ctrlKey)
					isCtrl = true;
			else
					isCtrl = false;
	}
	//if ctrl is pressed check if other key is in forbidenKeys array
	if(isCtrl)
	{
			for(i=0; i<forbiddenKeys.length; i++)
			{
					//case-insensitive comparation
					if(forbiddenKeys[i].toLowerCase() == String.fromCharCode(key).toLowerCase())
					{
							alert('Key combination CTRL + '
									+String.fromCharCode(key)
									+' has been disabled.');
							return false;
					}
			}
	}
	return true;
}
function get_MarqueNews()
{
	var $ = jQuery.noConflict();
    $.ajax({						
        type: "POST",	
        dataType: "json",	   
        url: SITE_BASE_URL+"index.php/c_ajax/get_MarqueNews",
        success: function(data){
            $("#marquee").html("");
            $("#newsevents").html("");
            if(data.marque != undefined)
            {
                $("#marquee").append("<marquee scrollamount='4' onmouseover='this.stop();' onmouseout='this.start();' >"+decodeURIComponent((data.marque+'').replace(/\+/g,'%20'))+"</marquee>");
                $("#newsevents").html("");
            }
            if(data.news != undefined)
            {
                var news_events = data.news;
                $(".newsevents").append('<marquee direction="up" onmouseover="this.stop();" onmouseout="this.start();" scrollamount="2" align="middle" style="height: 184px; padding-left: 8px;">'+news_events+'</marquee>');
            }
        },
        error: function(request,error) {
        console.log(error);
        }
    });
}

function IND_money_format(x)
{
	x=x.toString();
	var afterPoint = '';
	if(x.indexOf('.') > 0)
	   afterPoint = x.substring(x.indexOf('.'),x.length);
	x = Math.floor(x);
	x=x.toString();
	var lastThree = x.substring(x.length-3);
	var otherNumbers = x.substring(0,x.length-3);
	if(otherNumbers != '')
		lastThree = ',' + lastThree;
	var res = otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ",") + lastThree + afterPoint;

	return res;
}
function remove_commas(string)
{
	if(typeof string != 'undefined' && string.length > 0)
	{
		return parseFloat(string.replace(/,/g, ''), 10);
	}
	else
	{
		return string;
	}
}

// Resizes the content2 to fit with image height
function fnResizeImage (e) {
    var imgHeight = $('div.image_container > img').outerHeight(true);
    var cnt1Height = $('div.content > div.content1').outerHeight(true);
    var cnt2 = $('div.content > div.content2').outerHeight(imgHeight - cnt1Height);
}

function calcTime(duboffset,lonoffset,usoffset,japanoffset) {
    // create Date object for current location
    days =new Array('Sun','Mon','Tue','Wed','Thu','Fri','Sat');
    d = new Date();
    // alert(d.getTime());
    // convert to msec
    // add local time zone offset 
    // get UTC time in msec
    utc = d.getTime() + (d.getTimezoneOffset() * 60000);
    // create new Date object for different city
    // using supplied offset
    dub = new Date(utc + (3600000*duboffset));
    lon = new Date(utc + (3600000*lonoffset));
    us	= new Date(utc + (3600000*usoffset));
    jpn	= new Date(utc + (3600000*japanoffset));
    
    //Dubai
    var dhours = dub.getHours();
    var dminutes = dub.getMinutes();
    var dseconds = dub.getSeconds();
    var dsuffix = "AM";
    var dday=(dub.getDay());
    //London
    var lhours = lon.getHours();
    var lminutes = lon.getMinutes();
    var lseconds = lon.getSeconds();
    var lsuffix = "AM";
    var lday=(lon.getDay());
    //Us
    var uhours = us.getHours();
    var uminutes = us.getMinutes();
    var useconds = us.getSeconds();
    var usuffix = "AM";
    var uday=(us.getDay());
    //japan
    var jhours = jpn.getHours();
    var jminutes = jpn.getMinutes();
    var jseconds = jpn.getSeconds();
    var jsuffix = "AM";
    var jday=(jpn.getDay());
    
    //dubai
    if (dhours >= 12) {
        dsuffix = "PM";
        dhours = dhours - 12;
    }
    if (dhours == 0) {
        dhours = 12;
    }
    
    if (dminutes < 10)
    {
        dminutes = "0" + dminutes;
    }
    if(dseconds < 10)
    {
        dseconds = "0" + dseconds;
    }
        
    //london
    if (lhours >= 12) {
        lsuffix = "PM";
        lhours = lhours - 12;
    }
    if (lhours == 0) {
        lhours = 12;
    }
    if (lminutes < 10)
    {
        lminutes = "0" + lminutes;
    }
    if(lseconds < 10)
    {
        lseconds = "0" + lseconds;
    }
    //US
    if (uhours >= 12) {
        spuffix = "PM";
        uhours = uhours - 12;
    }
    if (uhours == 0) {
        uhours = 12;
    }
    
    if (uminutes < 10)
    {
        uminutes = "0" + uminutes;
    }
    if(useconds < 10)
    {
        useconds = "0" + useconds;
    }
    //japan
    
    if (jhours >= 12) {
        jsuffix = "PM";
        jhours = jhours - 12;
    }
    if (jhours == 0) {
        jhours = 12;
    }
    
    if (jminutes < 10)
    {
        jminutes = "0" + jminutes;
    }
    if(jseconds < 10)
    {
        jseconds = "0" + jseconds;
    }
    // return time as a string
    //return "The local time in " + city + " is " + nd.toLocaleString();
	var $ = jQuery.noConflict();
    $('.dubtime').html(""+days[dday]+ " " +dhours + ":" + dminutes + ":" + dseconds + " " + dsuffix);
    $('.lontime').html(""+days[dday]+ " " +lhours + ":" + lminutes + ":" + lseconds + " " + lsuffix);
    $('.ustime').html(""+days[dday]+ " " +uhours + ":" + uminutes + ":" + useconds + " " + usuffix);
    $('.jsuffix').html(""+days[dday]+ " " +jhours + ":" + jminutes + ":" + jseconds + " " + jsuffix);
}
var $ = jQuery.noConflict();
	$(function() {
		window.setInterval(function() { calcTime('5.51','1.00','-4.03'); },1000);
	});
function manual_roundoff(round_value, round_method, type) 
{
	if(round_method == 0)
	{
		var convert_value = 0;
		if(type == 'ask')
		{
			convert_value = Math.ceil(round_value);
		}
		else
		{
			convert_value = Math.floor(round_value);
		}
		return parseFloat(convert_value).toFixed(2);
	}
	else
	{
		var convert_value = 0;
		if(type == 'ask')
		{
			convert_value = Math.ceil(round_value / round_method) * round_method;
		}
		else
		{
			convert_value = Math.floor(round_value / round_method) * round_method;
		}
		return parseFloat(convert_value).toFixed(2);
	}
}

function gold_spotrateconversion(con_value, com_weight) {
	return parseFloat((con_value / 1000) * com_weight).toFixed(2);
}
function gold_conversion(con_value, com_weight) {
	return parseFloat((con_value / 10) * com_weight).toFixed(2);
}
function silver_conversion(con_value, com_weight) {
	return parseFloat((con_value / 1000) * com_weight).toFixed(2);
}
 
$(window).load(function(){
	var $ = jQuery.noConflict();
	$('.flexslider').flexslider({
		animation: "slide",
		start: function(slider){
		$('body').removeClass('loading');
		}
	});
});

// Can also be used with $(document).ready()
$(document).ready(function(){
	
	$.ajax({
		url : SITE_BASE_URL+"index.php/C_booking/getadvertisements",
		type : "GET",
		dataType : "json",
		data: "",
		async: false,
		success: function(xmlDoc){
			var adv1 = "<section class='slider'><div class='flexslider'><ul class='slides'>";
			var adv2 = "<section class='slider'><div class='flexslider'><ul class='slides'>";
			$.each(xmlDoc,function(key,value){
				if(value.type == 0){
					adv1 += '<li><img src="'+SITE_BASE_URL+value.location+'"  height="auto" style="width:100%";/></li>';
				}else if(value.type == 1){
					adv2 += '<li><img src="'+SITE_BASE_URL+value.location+'" height="auto" style="width:100%"; /></li>';
				}
			});
			adv1 += "</ul></div></section>";
			adv2 += "</ul></div></section>";
			$('.adv1').html(adv1);
			$('#adv2').html(adv2);		
		},
		error: function(request,error){
			console.log(error);
		}
	});
	/* $('.adv1').flexslider({ 
		animation: "fade",
		pauseOnHover: true,
		controlNav: false,
		directionNav: false,
		slideshow: true
	}); */
	
	/* $('#adv2').flexslider({ 
		animation: "fade",
		pauseOnHover: true,
		controlNav: false,
		directionNav: false,
		slideshow: true
	}); */
});