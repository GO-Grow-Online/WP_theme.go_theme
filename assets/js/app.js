jQuery(function($) {
    open_stuff();
    fixed_header();
    dynamic_form();
    smooth_scroll();
    onScroll_animation();
    // collapse();
    // defer_video();
    sliders();
    
    // defer_video();
    init_defer_video();
    ajax_form();
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

      /*
      $('a[href="#reservation"]').on('click', function() {

        const target = $('#contact');
        $('html, body').animate({
          scrollTop: target.offset().top
        }, 300);

        $('#footer-form').addClass('animate');
        $('#footer-form').on('animationend',function() {
          $('#footer-form').removeClass('animate');
        });
      });
      */
    }

    function ajax_form() {

      var msg_empty = "<p>Veuillez compléter les champs mis en avant pour envoyer le formulaire.</p>";
      var msg_php_failed = "<p>L'envois à échoué, veuillez contacter l'hôte du site internet.</p>";
      var msg_email = "<p>Veuillez entrer une adresse email valide.</p>"
      var msg_phone = "<p>Veuillez entrer numéro de téléphone valide.</p>"
      
      $('select option').parent().parent().removeClass('form-field--focus');

      // Add classes to upgrade fields styles and UX
      $('input, textarea, select').on('focus', function() {
        $(this).parent().addClass('form-field--focus');
        $('.form').removeClass('form--failed');
        $('.form').removeClass('form--succes');
      }).on('blur', function() {
        $(this).parent().removeClass('form-field--focus');

        if ($(this).val().trim() !== '') {
            $(this).parent().addClass('form-field--complete');
        } else {
            $(this).parent().removeClass('form-field--complete');
        }
      });


        
      $('#heading-form, #footer-form').on('submit', function(event) {

        var errors = "";

        event.preventDefault();

        var form = $(this);

        form.find('.form-field--error').removeClass('form-field--error');
        form.removeClass('form--sended');
        form.addClass('form--sending');

        var formData = form.serialize();

        // Form loaded serve to detect if form has allready been sent a first time
        let form_valid = true;

        // Check if required field have a value
        var required_fields = form.find(".required textarea, .required select, .required input, .required button");
        required_fields.each(function() {
          if (!$(this).val().trim()) {
            $(this).parent().addClass('form-field--error');
            form_valid = false;
          } 
        });
        errors += !form_valid ? msg_empty : "";

        // Check if email is valid
        var email_field = form.find('input[name="email"]')
        if (email_field.val()) {
          var is_email_valid = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/.test(email_field.val());
          if(!is_email_valid) {
            errors += msg_email;
            email_field.parent().addClass('form-field--error');
            form_valid = false;
          }
        }

        // Check if phone is valid
        var phone_field = form.find('input[name="phone"]')
        if (phone_field.val()) {
          var is_phone_valid = /^(?=[+\d\s]{7,}$)[+\d\s]+$/.test(phone_field.val());
          if(!is_phone_valid) {
            errors += msg_phone;
            phone_field.parent().addClass('form-field--error');
            form_valid = false;
          }
        }

        form.removeClass('form--loaded');
        form.addClass('form--sended');
        form.removeClass('form--sending');

        if(form_valid) {
          // Send the AJAX request
          $.ajax({
            type: 'POST',

            url: form.attr("action"),
            data: formData,
            dataType: 'json',

            success: function(response) {

              // Handle response if not AJAX hapenned
              if (response.success === true) {
                form.addClass('form--succes');
                $('.form--succes .form-field--complete, .form--succes .form-field--focus').removeClass('form-field--focus form-field--complete');
                form.trigger('reset');
                $('.form-field').removeClass('form-field--error');
                // Use this line to redirect the user avec the form was sent
                // window.location.href = 'success-page.html';

              } else {

                form.addClass('form--failed');
                errors += msg_php_failed;
                // response.each(error_field, function() {
                //   $('[name="'+ error_field +'"]').addClass('form-field--error');
                // });

                $('.form-message--failed').text(response.error);
              }
            },
            error: function(response) {
              // Handle AJAX errors, if any
              form.addClass('form--failed');
              $('.form-message--failed').text(response.error);
            }
          });
        }else{
          form.addClass('form--failed');
          $('.form-message--failed').html(errors);
          
        }
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


      $('header').removeClass('hidden-animate');
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

      $('.nav-main ul li a').on('click', function() {
        $('body').removeClass('menu--open');
      })
    }

    function sliders() {

      var tablet_breakpoint = '1200px';

      var nextTextHTML = '<svg width="25" height="42" viewBox="0 0 25 42" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M15.5854 21.4874C15.7509 21.6652 15.7763 21.8874 15.509 22.2113C15.1208 22.6748 14.408 22.7383 14.0261 23.2463C13.5169 23.9257 13.1032 24.294 12.2313 24.5289C11.773 24.6495 10.7993 24.4908 10.7865 25.202C10.7738 25.8433 12.0849 26.1862 12.0213 26.5291C11.9576 26.8719 11.1238 26.7195 10.9011 26.8021C10.6465 26.891 10.5319 27.0815 10.341 27.2783C10.0164 27.6022 9.70455 27.9387 9.39269 28.2816C9.20175 28.4848 8.62894 28.8657 8.52711 29.1007C8.44437 29.2785 8.59075 29.5198 8.52711 29.742C8.44437 30.0785 8.17706 30.2246 7.92884 30.4341C7.51514 30.7897 7.20328 30.9992 6.68138 31.1961C6.52227 31.2532 6.04493 31.3294 5.95582 31.4818C5.77125 31.7803 6.25496 31.958 6.35043 32.2311C6.43953 32.4851 6.36316 32.8343 6.43317 33.101C6.52227 33.4502 6.61774 33.6471 6.45226 34.0026C5.82217 35.3107 3.93189 35.1202 2.77991 35.4059C3.23816 35.7996 4.05918 35.9774 3.61367 36.6314C3.55638 36.714 2.85628 37.7045 2.74172 37.6283C2.97084 37.7744 3.3018 37.7553 3.48001 37.9585C2.91356 38.0919 2.35985 38.403 1.79976 38.5935C1.18877 38.7967 0.736881 39.038 0.32955 39.5396C0.0113221 39.9333 -0.319633 41.0953 0.596863 41.0191C0.673237 40.8286 0.857809 40.6952 0.972372 40.5174C1.06784 40.3714 1.11239 40.1809 1.22059 40.0285C1.69793 39.3364 3.07268 39.7999 3.74096 39.8571C4.98841 39.965 4.66382 39.6094 5.25572 38.8475C5.84763 38.0855 6.92324 37.7299 7.70608 37.26C8.33617 36.8791 8.99808 36.3393 9.30995 35.6536C9.39905 35.4504 9.57726 34.7583 9.73001 34.6503C10.0864 34.4154 11.4357 34.8916 11.8049 34.9615C12.2504 35.0503 12.855 35.1583 12.4413 34.5614C12.0976 34.0661 11.3784 33.736 10.9202 33.3613C11.6076 33.4756 12.2567 33.5836 12.9123 33.3359C13.466 33.12 13.326 32.8851 13.676 32.5168C13.8352 32.3517 14.0897 32.4152 14.2488 32.2946C14.4334 32.1612 14.4271 31.9961 14.5225 31.7612C14.7071 31.2913 15.1653 30.8786 15.1463 30.3452C15.579 30.3198 15.9927 30.4087 16.4192 30.4595C16.7692 30.504 17.1193 30.4976 17.4693 30.4976C17.6793 30.4976 18.2394 30.6056 18.4113 30.4976C18.7231 30.3008 18.3285 29.5388 18.1821 29.2721C17.743 28.4721 17.9085 28.0974 18.6659 27.6085C19.9706 26.7703 17.412 25.0305 17.1065 24.2305C17.6475 24.2305 18.2585 24.6876 18.7613 24.8591C19.5633 25.1321 20.5434 25.4433 21.3963 25.4115C22.2491 25.3798 22.5546 24.8083 23.0192 24.2559C23.6175 23.532 24.2348 22.8526 24.7313 22.0525C24.9731 21.6652 24.8968 21.1001 24.8586 20.6619C24.814 20.1667 25.0177 19.7412 24.9859 19.2523C24.9477 18.6046 24.3176 18.0776 23.7893 17.7728C23.1401 17.3918 22.6883 17.0744 22.2555 16.4203C21.8354 15.7854 21.3963 15.4933 20.7534 15.0869C19.9515 14.5853 18.8313 14.5218 18.4558 13.5439C18.2394 12.9915 18.0421 12.6296 17.673 12.1724C17.4948 11.9565 17.3293 11.7216 17.1511 11.5184C16.9029 11.239 16.6292 10.8643 16.3555 10.6294C15.8082 10.1595 15.1972 9.75315 14.6498 9.31502C14.1916 8.94674 14.1407 8.28637 13.7206 7.87364C13.2242 7.39106 12.2122 7.53076 11.6139 7.7022C10.5065 8.01333 10.0419 7.97523 10.0419 6.73069C10.0419 6.42591 10.1373 5.91158 9.95914 5.63854C9.81275 5.42266 9.40542 5.30836 9.18902 5.16867C8.3489 4.61624 7.76973 3.83523 6.96143 3.27011C6.52227 2.96532 6.07675 2.77483 5.58668 2.57799C5.28755 2.4637 4.54926 2.39385 4.33286 2.18431C4.07192 1.93032 4.4156 1.64459 4.34559 1.3779C4.2374 0.965166 3.81097 1.14931 3.47365 1.13026C3.16815 1.11121 2.88174 1.08581 2.84356 0.749277C2.83719 0.685781 3.09177 0.0127125 3.1045 1.33456e-05C2.75445 0.190504 1.78067 0.660379 1.7043 1.12391C1.67248 1.33345 1.90796 1.58744 2.0098 1.75253C2.28347 2.19701 2.59534 2.64784 2.81173 3.13041C3.00903 3.57489 3.09177 4.04477 3.38454 4.42575C3.7155 4.85753 4.14193 4.64799 4.65109 4.67339C4.66382 4.95913 4.68928 5.28296 4.62563 5.5687C4.54289 5.94968 4.14193 6.29891 4.20557 6.70529C4.67655 6.6672 5.51031 6.5275 5.8349 6.97833C6.03857 7.25137 6.02584 7.68315 6.12767 7.99428C6.43953 8.93404 7.19692 9.7722 7.68062 10.6167C7.96703 11.1247 8.50165 10.9659 9.07446 10.8897C9.41178 10.8453 10.9775 10.4072 11.1429 10.7755C11.232 10.9723 10.9265 11.4231 10.8756 11.6009C10.7674 11.9628 10.672 12.3502 10.5701 12.7185C10.411 13.2963 10.5065 13.7344 10.8184 14.2297C11.1684 14.7821 11.703 15.1631 12.2122 15.5504C12.3713 15.6711 12.7723 15.8362 12.8741 15.9695C13.0459 16.1854 12.9759 16.5283 13.116 16.7759C13.2942 17.0807 13.7588 17.2521 13.8606 17.6014C14.007 18.103 13.5997 18.7888 13.6633 19.3475C13.727 19.9063 13.9879 20.4778 14.4143 20.8207C14.7071 21.0556 15.3117 21.208 15.5727 21.4937L15.5854 21.4874Z" fill="currentColor"/></svg>';
      var prevTextHTML = '<svg width="25" height="42" viewBox="0 0 25 42" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M9.40385 19.5352C9.23837 19.3575 9.21291 19.1352 9.48023 18.8114C9.86846 18.3479 10.5813 18.2844 10.9632 17.7764C11.4723 17.097 11.886 16.7287 12.758 16.4937C13.2162 16.3731 14.19 16.5318 14.2027 15.8207C14.2155 15.1794 12.9044 14.8365 12.968 14.4936C13.0317 14.1507 13.8654 14.3031 14.0882 14.2206C14.3428 14.1317 14.4573 13.9412 14.6483 13.7443C14.9728 13.4205 15.2847 13.084 15.5966 12.7411C15.7875 12.5379 16.3603 12.1569 16.4622 11.922C16.5449 11.7442 16.3985 11.5029 16.4622 11.2806C16.5449 10.9441 16.8122 10.7981 17.0604 10.5885C17.4741 10.2329 17.786 10.0234 18.3079 9.82656C18.467 9.76941 18.9443 9.69322 19.0334 9.54082C19.218 9.24239 18.7343 9.0646 18.6388 8.79156C18.5497 8.53757 18.6261 8.18834 18.5561 7.92165C18.467 7.57242 18.3715 7.37558 18.537 7.01999C19.1671 5.71196 21.0574 5.90245 22.2094 5.61671C21.7511 5.22303 20.9301 5.04524 21.3756 4.39122C21.4329 4.30867 22.133 3.31812 22.2475 3.39432C22.0184 3.24827 21.6875 3.26732 21.5092 3.06413C22.0757 2.93079 22.6294 2.61965 23.1895 2.42916C23.8005 2.22597 24.2524 1.98468 24.6597 1.48306C24.9779 1.08938 25.3089 -0.0726189 24.3924 0.00357751C24.316 0.194068 24.1314 0.327412 24.0169 0.505204C23.9214 0.651247 23.8769 0.841738 23.7687 0.99413C23.2913 1.68625 21.9166 1.22272 21.2483 1.16557C20.0008 1.05763 20.3254 1.41321 19.7335 2.17517C19.1416 2.93714 18.066 3.29272 17.2832 3.7626C16.6531 4.14358 15.9912 4.68331 15.6793 5.36907C15.5902 5.57226 15.412 6.26438 15.2592 6.37232C14.9028 6.60726 13.5535 6.13104 13.1844 6.06119C12.7389 5.97229 12.1342 5.86435 12.5479 6.46122C12.8916 6.9565 13.6108 7.28668 14.0691 7.66131C13.3817 7.54702 12.7325 7.43907 12.077 7.68671C11.5233 7.9026 11.6633 8.13754 11.3132 8.50582C11.1541 8.67092 10.8995 8.60742 10.7404 8.72806C10.5558 8.86141 10.5622 9.0265 10.4667 9.26144C10.2822 9.73132 9.82391 10.144 9.84301 10.6774C9.41022 10.7028 8.99652 10.6139 8.57009 10.5631C8.22004 10.5187 7.86999 10.525 7.51994 10.525C7.30991 10.525 6.74983 10.4171 6.57799 10.525C6.26612 10.7219 6.66073 11.4838 6.80711 11.7505C7.24626 12.5506 7.08079 12.9252 6.3234 13.4141C5.01867 14.2523 7.57722 15.9921 7.88272 16.7922C7.34173 16.7922 6.73074 16.335 6.22793 16.1636C5.426 15.8905 4.44586 15.5794 3.59301 15.6111C2.74015 15.6429 2.43466 16.2144 1.97004 16.7668C1.37177 17.4906 0.754411 18.1701 0.257975 18.9701C0.0161217 19.3575 0.0924965 19.9226 0.130684 20.3607C0.175236 20.856 -0.0284302 21.2814 0.00339261 21.7703C0.04158 22.418 0.671672 22.945 1.19993 23.2498C1.84912 23.6308 2.301 23.9483 2.73379 24.6023C3.15385 25.2373 3.59301 25.5294 4.23583 25.9357C5.03776 26.4374 6.15792 26.5009 6.53343 27.4787C6.74983 28.0311 6.94713 28.3931 7.31628 28.8503C7.49448 29.0661 7.65996 29.3011 7.83817 29.5043C8.08639 29.7837 8.36006 30.1583 8.63374 30.3932C9.18109 30.8631 9.79209 31.2695 10.3394 31.7076C10.7977 32.0759 10.8486 32.7363 11.2687 33.149C11.7651 33.6316 12.7771 33.4919 13.3753 33.3204C14.4828 33.0093 14.9474 33.0474 14.9474 34.292C14.9474 34.5967 14.8519 35.1111 15.0301 35.3841C15.1765 35.6 15.5838 35.7143 15.8002 35.854C16.6404 36.4064 17.2195 37.1874 18.0278 37.7525C18.467 38.0573 18.9125 38.2478 19.4026 38.4447C19.7017 38.5589 20.44 38.6288 20.6564 38.8383C20.9173 39.0923 20.5737 39.3781 20.6437 39.6447C20.7519 40.0575 21.1783 39.8733 21.5156 39.8924C21.8211 39.9114 22.1075 39.9368 22.1457 40.2734C22.1521 40.3369 21.8975 41.0099 21.8848 41.0226C22.2348 40.8321 23.2086 40.3623 23.285 39.8987C23.3168 39.6892 23.0813 39.4352 22.9795 39.2701C22.7058 38.8256 22.3939 38.3748 22.1775 37.8922C21.9802 37.4478 21.8975 36.9779 21.6047 36.5969C21.2738 36.1651 20.8473 36.3746 20.3382 36.3493C20.3254 36.0635 20.3 35.7397 20.3636 35.4539C20.4464 35.073 20.8473 34.7237 20.7837 34.3173C20.3127 34.3554 19.479 34.4951 19.1544 34.0443C18.9507 33.7713 18.9634 33.3395 18.8616 33.0284C18.5497 32.0886 17.7923 31.2504 17.3086 30.4059C17.0222 29.898 16.4876 30.0567 15.9148 30.1329C15.5775 30.1773 14.0118 30.6155 13.8463 30.2472C13.7572 30.0504 14.0627 29.5995 14.1136 29.4217C14.2218 29.0598 14.3173 28.6725 14.4191 28.3042C14.5782 27.7264 14.4828 27.2882 14.1709 26.793C13.8209 26.2405 13.2862 25.8595 12.7771 25.4722C12.618 25.3516 12.217 25.1865 12.1152 25.0531C11.9433 24.8372 12.0133 24.4944 11.8733 24.2467C11.6951 23.9419 11.2305 23.7705 11.1286 23.4213C10.9823 22.9196 11.3896 22.2339 11.3259 21.6751C11.2623 21.1163 11.0014 20.5449 10.5749 20.202C10.2822 19.967 9.67753 19.8146 9.41658 19.5289L9.40385 19.5352Z" fill="currentColor"/></svg>';

      
      var var_height = window.matchMedia('(max-width: '+ tablet_breakpoint +')').matches ? true : false;

      if ($('.slider').length) {
        $('.slider').bxSlider({infiniteLoop : false});
      }

      if (window.matchMedia('(max-width: '+ tablet_breakpoint +')').matches && $('.list-md').length) {
        $('.list-md').bxSlider({
          infiniteLoop : false,
          nextText: nextTextHTML,
          prevText: prevTextHTML,
          buildPager: function(slideIndex){
            return (slideIndex + 1) + '<svg width="23" height="22" viewBox="0 0 23 22" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M21.9777 11.3874C22.0458 12.0486 22.0322 12.6831 21.78 13.1907C21.487 13.7918 20.5125 14.2994 20.124 14.9739C19.5925 15.8889 19.8446 16.9241 19.4221 17.8592C19.0814 18.6072 18.3454 19.2884 18.4271 20.15C16.6417 20.2502 14.8357 19.9229 13.0639 20.1433C12.0008 20.2769 11.7282 20.7043 11.0194 21.4123C10.5697 21.8665 10.3925 22.2138 9.65648 21.8264C8.98181 21.4657 9.23396 21.1919 9.11811 20.6442C8.92729 19.7359 8.61381 19.7493 7.61204 19.4554C5.99011 18.9812 4.41589 18.5538 2.75989 18.2132C0.681369 17.7857 -0.599816 16.864 0.265665 14.7535C0.613221 13.9053 1.15159 13.0438 1.13796 12.0954C1.13115 11.4609 0.729073 11.0468 1.34922 10.5659C2.11248 9.9715 3.55722 10.6461 3.74122 9.30362C3.89115 8.18825 2.54181 7.10629 2.351 6.031C2.11929 4.72863 3.59129 4.8956 3.8707 3.78692C4.02063 3.1925 3.62537 2.63816 3.76167 2.0905C3.95248 1.32244 4.68848 1.44933 5.45855 1.38255C6.07189 1.32912 6.66478 1.3024 7.20996 1.14879C7.68018 1.00853 8.00729 0.721344 8.51841 0.701307C8.70241 1.22225 8.69559 1.80999 8.96818 2.32426C8.93411 2.26415 9.64966 1.32912 9.76552 1.24897C10.3925 0.841562 11.4488 1.02189 12.1575 1.01521C13.1457 1.00185 14.1066 0.935066 15.0879 0.781453C17.1187 0.474228 19.1223 -0.0600769 21.1871 3.23555e-05C24.6831 0.106893 18.2636 3.92717 17.6707 4.46148C19.5107 4.60841 22.7205 5.35644 23.0067 7.55377C22.2434 7.89439 21.746 7.80088 21.6846 8.65577C21.6301 9.42383 21.8891 10.4323 21.9845 11.3807L21.9777 11.3874Z" fill="currentColor"/></svg>';
          }
        });
      }

      $('.list-lg').bxSlider();

      $('.menu_slider-slider').bxSlider({
        infiniteLoop : false,
        nextText : nextTextHTML,
        prevText : prevTextHTML,
        adaptiveHeight : var_height,
        mode : 'fade',
        buildPager: function(slideIndex){
          return (slideIndex + 1) + '<svg width="23" height="22" viewBox="0 0 23 22" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M21.9777 11.3874C22.0458 12.0486 22.0322 12.6831 21.78 13.1907C21.487 13.7918 20.5125 14.2994 20.124 14.9739C19.5925 15.8889 19.8446 16.9241 19.4221 17.8592C19.0814 18.6072 18.3454 19.2884 18.4271 20.15C16.6417 20.2502 14.8357 19.9229 13.0639 20.1433C12.0008 20.2769 11.7282 20.7043 11.0194 21.4123C10.5697 21.8665 10.3925 22.2138 9.65648 21.8264C8.98181 21.4657 9.23396 21.1919 9.11811 20.6442C8.92729 19.7359 8.61381 19.7493 7.61204 19.4554C5.99011 18.9812 4.41589 18.5538 2.75989 18.2132C0.681369 17.7857 -0.599816 16.864 0.265665 14.7535C0.613221 13.9053 1.15159 13.0438 1.13796 12.0954C1.13115 11.4609 0.729073 11.0468 1.34922 10.5659C2.11248 9.9715 3.55722 10.6461 3.74122 9.30362C3.89115 8.18825 2.54181 7.10629 2.351 6.031C2.11929 4.72863 3.59129 4.8956 3.8707 3.78692C4.02063 3.1925 3.62537 2.63816 3.76167 2.0905C3.95248 1.32244 4.68848 1.44933 5.45855 1.38255C6.07189 1.32912 6.66478 1.3024 7.20996 1.14879C7.68018 1.00853 8.00729 0.721344 8.51841 0.701307C8.70241 1.22225 8.69559 1.80999 8.96818 2.32426C8.93411 2.26415 9.64966 1.32912 9.76552 1.24897C10.3925 0.841562 11.4488 1.02189 12.1575 1.01521C13.1457 1.00185 14.1066 0.935066 15.0879 0.781453C17.1187 0.474228 19.1223 -0.0600769 21.1871 3.23555e-05C24.6831 0.106893 18.2636 3.92717 17.6707 4.46148C19.5107 4.60841 22.7205 5.35644 23.0067 7.55377C22.2434 7.89439 21.746 7.80088 21.6846 8.65577C21.6301 9.42383 21.8891 10.4323 21.9845 11.3807L21.9777 11.3874Z" fill="currentColor"/></svg>';
        }
      });

      $('.partners-slider').bxSlider({
        infiniteLoop : false,
        controls: false,
        minSlides: 2,
        maxSlides: 6,
        slideWidth : 110,
        slideMargin: 20, 
        // moveSlides: 2,
        mode: 'horizontal',
        captions: true,
        responsive: true,  
        buildPager: function(slideIndex){
          return (slideIndex + 1) + '<svg width="23" height="22" viewBox="0 0 23 22" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M21.9777 11.3874C22.0458 12.0486 22.0322 12.6831 21.78 13.1907C21.487 13.7918 20.5125 14.2994 20.124 14.9739C19.5925 15.8889 19.8446 16.9241 19.4221 17.8592C19.0814 18.6072 18.3454 19.2884 18.4271 20.15C16.6417 20.2502 14.8357 19.9229 13.0639 20.1433C12.0008 20.2769 11.7282 20.7043 11.0194 21.4123C10.5697 21.8665 10.3925 22.2138 9.65648 21.8264C8.98181 21.4657 9.23396 21.1919 9.11811 20.6442C8.92729 19.7359 8.61381 19.7493 7.61204 19.4554C5.99011 18.9812 4.41589 18.5538 2.75989 18.2132C0.681369 17.7857 -0.599816 16.864 0.265665 14.7535C0.613221 13.9053 1.15159 13.0438 1.13796 12.0954C1.13115 11.4609 0.729073 11.0468 1.34922 10.5659C2.11248 9.9715 3.55722 10.6461 3.74122 9.30362C3.89115 8.18825 2.54181 7.10629 2.351 6.031C2.11929 4.72863 3.59129 4.8956 3.8707 3.78692C4.02063 3.1925 3.62537 2.63816 3.76167 2.0905C3.95248 1.32244 4.68848 1.44933 5.45855 1.38255C6.07189 1.32912 6.66478 1.3024 7.20996 1.14879C7.68018 1.00853 8.00729 0.721344 8.51841 0.701307C8.70241 1.22225 8.69559 1.80999 8.96818 2.32426C8.93411 2.26415 9.64966 1.32912 9.76552 1.24897C10.3925 0.841562 11.4488 1.02189 12.1575 1.01521C13.1457 1.00185 14.1066 0.935066 15.0879 0.781453C17.1187 0.474228 19.1223 -0.0600769 21.1871 3.23555e-05C24.6831 0.106893 18.2636 3.92717 17.6707 4.46148C19.5107 4.60841 22.7205 5.35644 23.0067 7.55377C22.2434 7.89439 21.746 7.80088 21.6846 8.65577C21.6301 9.42383 21.8891 10.4323 21.9845 11.3807L21.9777 11.3874Z" fill="currentColor"/></svg>';
        }
      });
    }
    
    function rand(min, max) {
      return Math.floor(Math.random() * (max - min + 1) + min)
    }    
});