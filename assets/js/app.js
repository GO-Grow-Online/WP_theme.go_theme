jQuery(function($) {
    open_stuff();
    fixed_header();
    dynamic_form();
    smooth_scroll();
    onScroll_animation();
    // collapse();
    // defer_video();
    slick_sliders();
    
    // defer_video();
    init_defer_video();
    // activate_video_controls();
    // my_lightbox();

    function smooth_scroll() {
      document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = $(this.getAttribute('href'));
            const duration = 300; // Durée maximale en millisecondes

            if (target.length) {
              $('html, body').animate({
                scrollTop: target.offset().top
              }, duration);
            }
        });
      });
    }


    function defer_video(video, wrapper) {
      if (video.length) { 
        var sources = video.find('source');

        sources.each(function(index, element) {
          var mediaQuery = $(element).attr('media');
          console.log("mediaQuery" + mediaQuery);
          if (!mediaQuery || window.matchMedia(mediaQuery).matches)  {

            var video_url = $(element).attr('data-src');
            var $source = $(element);

            $.get(video_url, function(data) {
              $source.attr('src', video_url);
              video[0].load();
              video.on('loadeddata', function() {
                wrapper.removeClass('loading');
                activate_video_controls(wrapper);
              });
            });

          }
        });
      }
    }


    function init_defer_video() {
      var videos = $('.vidWrap.defer .video');
      videos.each(function() {
        defer_video($(this), $(this).parent().parent());
      });
    }

    
    function activate_video_controls(videoWrapper) {
      var $videoControls = videoWrapper.find('.vidWrap-controls');
      
      if ($videoControls.length) {
        
        // Find targeted video
        var $video = $videoControls.closest(".vidWrap").find(".video")[0];
    
        // Get buttons & assets
        var $playpause = $videoControls.find(".playpause");
        var $stop = $videoControls.find(".stop");
        var $mute = $videoControls.find(".mute");
        var $progress = $videoControls.find(".progress");
        var $progressBar = $videoControls.find(".progress progress");
        var $fullscreen = videoWrapper.find(".fs");
    
        const supportsProgress =  $progress.max !== undefined;
        if (!supportsProgress) $progress.attr("data-state", "fake");

        // Dynamise progress bar
        $video.addEventListener("timeupdate", function() {
          var currentTime = $video.currentTime;
          var duration = $video.duration;
          if (isFinite(duration)) {
            videoWrapper.removeClass('progress-loading');
            var progress = (currentTime / duration);
            $progressBar.val(progress);
          }
        });


        function handleFullscreen() {
          if (document.fullscreenElement !== null) {
            // Is fullscreen
            document.exitFullscreen();
            setFullscreenData(false);
          } else {
            // Is'nt fullscreen
            $video.requestFullscreen();
            setFullscreenData(true);
          }
        }
        

        // Change play/pause state
        function changeButtonState(type) {
          if (type === "playpause") {
            // Play/Pause button
            if ($video.paused || $video.ended) {
              $playpause.attr("data-state", "play");
            } else {
              $playpause.attr("data-state", "pause");
            }
          } else if (type === "mute") {
            // Mute button
            $mute.attr("data-state", $video.muted ? "unmute" : "mute");
          }
        }
    
        // Manage click on play/pause button
        $playpause.on("click", function() {
          if ($video.paused || $video.ended) {
            $video.play();
          } else {
            $video.pause();
          }
        });
    
        // Manage click on stop button
        $stop.on("click", function() {
          $video.pause();
          $video.currentTime = 0;
        });
    
        // Manage click on mute/unmute button
        $mute.on("click", function() {
          $video.muted = !$video.muted;
          changeButtonState("mute");
        });
    
        // Manage click on progress bar
        $progress.on("click", function(e) {
          var pos = (e.pageX - $progress.offset().left) / $progress.width();
          var duration = $video.duration;
          
          if (isFinite(duration)) {
            var newPosition = pos * duration;
            $video.currentTime = newPosition;
          }
        });
    
        // Manage "play" event
        $video.addEventListener("play", function() {
          changeButtonState("playpause");
        });
    
        // Manage "pause" event
        $video.addEventListener("pause", function() {
          changeButtonState("playpause");
        });

        $fullscreen.on("click", function() {
          handleFullscreen();
        });
      }
    }


    function popup(data_popup, opening_time = 7000, click_close_trigger = null) {
        
      var popup = $(".popup[data-popup='" + data_popup + "']");
      
      popup.addClass('popup--open');
      if (!popup.hasClass('popup-infinite')) {
        var timer;
        var progress_bar = popup.find('.popup-closeDelay > span');    

        // Animate a progression bar for popup
        var startTime = Date.now();
        var endTime = startTime + opening_time;

        function updateProgressBar() {
            var currentTime = Date.now();
            var elapsedTime = currentTime - startTime;
            var progress = (elapsedTime / opening_time) * 100;

            progress_bar.css('width', progress + "%");

            if (currentTime < endTime) {
                // requestanimation is used to close the popup after delay
                // timber will be killed when closing popup to prevent affecting the upcommings ones 
                timer = requestAnimationFrame(updateProgressBar);
            } else {
                popup.removeClass('popup--open');
            }
        }

        updateProgressBar();

        if(click_close_trigger != null) {
            click_close_trigger.on('click', function(){
                // kill animationframe so it does not affect upcomming popups
                cancelAnimationFrame(timer);
                popup.removeClass('popup--open')
            });
        }
      }
    }


    function onScroll_animation() {

      var show_at_breakpoint = '1200px';
      var viewport_portion = window.matchMedia('(max-width: '+ show_at_breakpoint +')').matches ? 0.1 : 0.5;

      const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.remove('hidden-animate');
          } 
        });
      }, {
        threshold: viewport_portion
      });
      
      const hidden_elements = document.querySelectorAll('.hidden-animate');
      hidden_elements.forEach((el) => observer.observe(el));
      
    }


    function my_lightbox() {
      lightbox.option({
        'resizeDuration': 200,
        'fadeDuration': 200,
        'fitImagesInViewport': true,
      });
    }


    function dynamic_form() {
      $('.wpforms-field textarea, .wpforms-field input, .wpforms-field select').on('focus blur', function(event) {
        if (event.type === 'focus') {
          $(this).parent().addClass('js-focus');
        } else if (event.type === 'blur') {
          $(this).parent().removeClass('js-focus');
        }
      });

      if($('.section_contact-form').attr('data-form')) {
        let target = $('.section_contact-form').attr('data-form');
        let select_input = $('.wpforms-container select option[value="' + target + '"]').parent();
        select_input.val(target);
      }

      $('.btn-lg[data-form]').on('click', function() {

        let target = $(this).attr('data-form');

        if($('.wpforms-container select option[value="' + target + '"]').length) { 
          setTimeout(() => {
            let select_input = $('.wpforms-container select option[value="' + target + '"]').parent();
            select_input.addClass('dynamic-selection');
            select_input.val(target);            
          }, 300);

          select_input.on('animationend', function() {
            select_input.removeClass('dynamic-selection');
          });
        }

      });
    }


    function collapse() {
      $('.collapseList .collapseList-item .collapseList-item-header').on('click', function(event) {
        let target = $(this).parent();
        let content = target.find('.collapseList-item-body');
    
        let previous_collapse = $('.collapseList-item.open');
        
        if (target.is(previous_collapse)) {
          previous_collapse.removeClass('open');
          previous_collapse.find('.collapseList-item-body').slideUp();
          previous_collapse.find('.collapseList-item-body').attr('aria-hidden', 'true');
          
          return;
        }
        
        previous_collapse.removeClass('open');
        previous_collapse.find('.collapseList-item-body').slideUp();
        previous_collapse.find('.collapseList-item-body').attr('aria-hidden', 'true');
        
        target.addClass('open');
        content.slideDown();
        content.attr('aria-hidden', 'false');
      });
    }

    function fixed_header() {
      $(window).scroll(function (event) {
        var scroll = $(window).scrollTop();
        if (scroll > $('header').height()) {
          $('body').addClass('scrolled');
        }else{
          $('body').removeClass('scrolled');
        }
      });
    }
    
    function open_stuff() {
      $('.js--open').on('click', function() {
        $('body').addClass($(this).attr('data-open') + "--open");
      })
    
      $('.js--close').on('click', function() {
        $('body').removeClass($(this).attr('data-close') + "--open");
      })
    
      $('.js--toggle').on('click', function() {
        $('body').toggleClass($(this).attr('data-toggle') + "--open");
      })
    }

    function slick_sliders() {

      var tablet_breakpoint = '1200px';

      var nextTextHTML = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
      var prevTextHTML = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M19 12H5M5 12L12 19M5 12L12 5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';

      
      var var_height = window.matchMedia('(max-width: '+ tablet_breakpoint +')').matches ? true : false;

      if ($('.slider').length) {
        $('.slider').bxSlider({infiniteLoop : false});
      }

      if (window.matchMedia('(max-width: '+ tablet_breakpoint +')').matches && $('.list-md').length) {
        $('.list-md').bxSlider({
          infiniteLoop : false,
          nextText: nextTextHTML,
          prevText: prevTextHTML
        });
      }

      $('.list-lg').bxSlider();
    }

    
    function rand(min, max) {
      return Math.floor(Math.random() * (max - min + 1) + min)
    }    
});