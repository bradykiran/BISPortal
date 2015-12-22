//jQuery to collapse the navbar on scroll
/*
$(window).scroll(function () {
    if ($(".navbar").offset().top > 50) {
        $(".navbar-fixed-top").addClass("top-nav-collapse");
    } else {
        $(".navbar-fixed-top").removeClass("top-nav-collapse");
    }
});*/

//jQuery for page scrolling feature - requires jQuery Easing plugin
$(function () {
    $('a.page-scroll').bind('click', function (event) {
        var $anchor = $(this);
        $('html, body').stop().animate({
            scrollTop: $($anchor.attr('href')).offset().top
        }, 1500, 'easeInOutExpo');
        event.preventDefault();
    });
});


// jquery to fade in and out bottom navbar
(function ($) {
    $(document).ready(function () {
        
        // hide .navbar first
        $(".navbar-login").hide();
        
        // fade in .navbar
        $(function () {
            $(window).scroll(function () {
                
                // set distance user needs to scroll before we start fadeIn
                if ($(this).scrollTop() > 100) {
                    $('.navbar-login').fadeIn();
                } else {
                    $('.navbar-login').fadeOut();
                }
            });
        });

    });
}(jQuery));