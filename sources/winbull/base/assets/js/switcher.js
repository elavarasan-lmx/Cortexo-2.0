jQuery(document).ready(function($) {
    
    $(".switcher").css('left', '-225px');
   	
	$(".switcher-trigger").click(function(){
	
        if ($('.switcher').hasClass('closeswitcher')){
			$('.switcher').animate({left:'-225px'}, 500, function(){
				$('.switcher').removeClass('closeswitcher');
			});
		} else {
			$('.switcher').animate({left:0}, 500, function(){
				$('.switcher').addClass('closeswitcher');
			});
		}
		return false;
    
	});
    
    
    $('#switcher-option-layout').change(function() {
    
        var switcheropLayout = $(this).val();
        
        if( switcheropLayout == 'layout-boxed' ) {
            $('body').removeClass('stretched');
        } else if( switcheropLayout == 'layout-full' ) {
            $('body').addClass('stretched');
        }
        
        $(window).resize();
    
    });
    
    
    $('#switcher-option-color li').click(function() {
    
        var switcheropColor = $(this).attr('data-color');
        
        var switcheropLayout = $('#switcher-option-layout').val();
        
        $('#swcolors-Css').remove();
        
        $('head').append('<link id="swcolors-Css" rel="stylesheet" href="css/colors.php?color=' + switcheropColor + '" type="text/css" />');
    
    });
    
    
    $('#switcher-option-pattern li').click(function() {
    
        var switcherPatternUrl = $(this).attr('data-url');
        
        var switcheropLayout = $('#switcher-option-layout').val();
        
        if( switcheropLayout == 'layout-full' ) {
            alert('Please select Boxed Layout to Preview Patterns.')
        } else {
            $('body').css( 'background-image', 'url("' + switcherPatternUrl + '")');
            $('body').css( 'background-size', 'auto auto');
            $('body').css( 'background-position', '0% 0%');
            $('body').css( 'background-repeat', 'repeat repeat');
        }
    
    });
    
    
    $('#switcher-option-bgimage li').click(function() {
    
        var switcherBgImageUrl = $(this).attr('data-url');
        
        var switcheropLayout = $('#switcher-option-layout').val();
        
        if( switcheropLayout == 'layout-full' ) {
            alert('Please select Boxed Layout to Preview Background Images.')
        } else {
            $('body').css( 'background-image', 'url("' + switcherBgImageUrl + '")');
            $('body').css( 'background-attachment', 'fixed');
            $('body').css( 'background-size', 'cover');
            $('body').css( 'background-position', '50% 50%');
            $('body').css( 'background-repeat', 'no-repeat no-repeat');
        }
    
    });
    
    
    $('#switcher-option-footer a').click(function() {
    
        var switcherFooColor = $(this).attr('data-color');
        
        $('#switcher-option-footer a').removeClass('swfooter-active');
        
        if( switcherFooColor == 'light' ) {
            $('#footer').removeClass('footer-dark');
            $('#copyrights').removeClass('copyrights-dark');
            $(this).addClass('swfooter-active');
        } else if( switcherFooColor == 'dark' ) {
            $('#footer').addClass('footer-dark');
            $('#copyrights').addClass('copyrights-dark');
            $(this).addClass('swfooter-active');
        }
        
        return false;
    
    });


});