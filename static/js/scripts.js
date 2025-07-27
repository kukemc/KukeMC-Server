/* Template: Aria - Business HTML Landing Page Template
   Author: Inovatik
   Created: Jul 2019
   Description: Custom JS file
*/


(function($) {
    "use strict";

    console.log(' __                                       __              \n' +
        '/  \\  _  |_ .  _  . _   _  _|   |_       |__)  _ |_  _  _ \n' +
        '\\__/ |_) |_ | ||| | /_ (- (_|   |_) \\/   |    (- |_ (- |  \n' +
        '     |                              /                     ');

    // 获取古诗

    // 动态加载 navbar.html 内容并插入到 id 为 'navbar' 的 div 中
    fetch('navbar.html')
    .then(response => response.text())
    .then(data => {
        // 将导航栏内容插入到指定的 div 中
        document.getElementById('navbar').innerHTML = data;

        // 自动激活当前页面导航项
        const currentPath = window.location.pathname; // 获取当前路径，例如 /playtime 或 /playtime.html
        const linkBase = document.querySelector('base')?.href || window.location.origin;
    
        // 规范化当前页面路径：去除 .html 扩展名、去除末尾斜杠、去除前导斜杠
        const normalizedCurrentPath = currentPath
            .replace(/index\.html$/i, '') // 移除 index.html
            .replace(/\.html$/i, '')      // 移除 .html
            .replace(/\/$/, '')           // 移除末尾斜杠
            .replace(/^\/+/, '');         // 移除前导斜杠
    
        // 更新导航高亮状态的函数
        function updateNavHighlight() {
            // 移除所有导航项的高亮
            document.querySelectorAll('.nav-link').forEach(link => {
                link.classList.remove('active');
            });
            
            // 处理外部链接
            if (window.location.hostname !== new URL(linkBase).hostname) {
                return;
            }
            
            // 如果是主页，根据锚点确定高亮项
            if (normalizedCurrentPath === '') {
                const hash = window.location.hash;
                if (hash) {
                    // 根据hash值确定应该高亮的导航项
                    document.querySelectorAll('.nav-link').forEach(link => {
                        if (link.getAttribute('href') === `index.html${hash}`) {
                            link.classList.add('active');
                        }
                    });
                } else {
                    // 如果没有hash，默认高亮首页
                    document.querySelectorAll('.nav-link').forEach(link => {
                        if (link.getAttribute('href') === 'index.html#header' || 
                            link.getAttribute('href') === 'index.html') {
                            link.classList.add('active');
                        }
                    });
                }
            } else {
                // 非主页的处理逻辑
                document.querySelectorAll('.nav-link').forEach(link => {
                    try {
                        // 处理外部链接，如状态监控和官方文档
                        if (link.getAttribute('href').startsWith('http')) {
                            // 如果是外部链接，只有当href完全匹配当前URL时才高亮
                            if (link.href === window.location.href) {
                                link.classList.add('active');
                            }
                            return;
                        }
                        
                        const linkObj = new URL(link.href, linkBase);
                        let linkPath = linkObj.pathname;
        
                        // 特殊处理：如果 href 是相对路径或 hash，pathname 可能为空
                        if (!linkPath && link.getAttribute('href').startsWith('#')) {
                            // 对于锚点链接，在主页时应该高亮第一个锚点链接（首页）
                            if (normalizedCurrentPath === '' && link.getAttribute('href') === '#header') {
                                link.classList.add('active');
                            }
                            return;
                        }
        
                        // 规范化导航链接路径
                        const normalizedLinkPath = linkPath
                            .replace(/index\.html$/i, '') // 移除 index.html
                            .replace(/#.*$/, '')          // 移除 # 后面的内容
                            .replace(/\.html$/i, '')      // 移除 .html
                            .replace(/\/$/, '')           // 移除末尾斜杠
                            .replace(/^\//, '');          // 移除前导斜杠
        
                        // 比较两个路径是否匹配
                        if (normalizedLinkPath === normalizedCurrentPath) {
                            link.classList.add('active');
                        }
                    } catch (e) {
                        console.warn('Invalid URL in nav link:', link.href);
                    }
                });
            }
        }

        // 初始更新导航高亮状态
        updateNavHighlight();

        // 监听 hashchange 事件（当用户点击锚点链接时触发）
        window.addEventListener('hashchange', updateNavHighlight);
        
        // 监听滚动事件，实现智能高亮（仅在主页时）
        if (normalizedCurrentPath === '') {
            let isScrolling = false;
            
            window.addEventListener('scroll', function() {
                if (!isScrolling) {
                    window.requestAnimationFrame(function() {
                        updateNavHighlightOnScroll();
                        isScrolling = false;
                    });
                    
                    isScrolling = true;
                }
            });
            
            // 根据滚动位置更新导航高亮
            function updateNavHighlightOnScroll() {
                // 获取所有可滚动到的区域
                const sections = [
                    { id: 'header', link: 'index.html#header' },
                    { id: 'info', link: 'index.html#info' },
                    { id: 'picture', link: 'index.html#picture' }
                ];
                
                // 获取当前视窗中的元素
                let currentSection = '';
                for (let section of sections) {
                    const element = document.getElementById(section.id);
                    if (element) {
                        const rect = element.getBoundingClientRect();
                        // 如果元素在视窗中（元素顶部在视窗上半部分且元素底部在视窗下半部分）
                        if (rect.top <= window.innerHeight/2 && rect.bottom >= window.innerHeight/2) {
                            currentSection = section.link;
                            break;
                        }
                        // 特殊处理：如果元素占据视窗的大部分（超过50%）
                        const elementHeight = rect.bottom - rect.top;
                        const visibleHeight = Math.min(rect.bottom, window.innerHeight) - Math.max(rect.top, 0);
                        if (visibleHeight > elementHeight / 2) {
                            currentSection = section.link;
                        }
                    }
                }
                
                // 移除所有高亮
                document.querySelectorAll('.nav-link').forEach(link => {
                    link.classList.remove('active');
                });
                
                // 设置当前区域对应的导航项为高亮
                if (currentSection) {
                    document.querySelectorAll('.nav-link').forEach(link => {
                        if (link.getAttribute('href') === currentSection) {
                            link.classList.add('active');
                        }
                    });
                } else if (window.scrollY === 0) {
                    // 如果在页面顶部，高亮首页
                    document.querySelectorAll('.nav-link').forEach(link => {
                        if (link.getAttribute('href') === 'index.html#header') {
                            link.classList.add('active');
                        }
                    });
                } else {
                    // 根据当前hash值确定高亮项
                    const hash = window.location.hash;
                    if (hash) {
                        document.querySelectorAll('.nav-link').forEach(link => {
                            if (link.getAttribute('href') === `index.html${hash}`) {
                                link.classList.add('active');
                            }
                        });
                    }
                }
            }
        }
    })
    .catch(error => {
        console.log('Error loading navbar:', error);
    });


    // 动态加载 footer.html 内容并插入到 id 为 'footer' 的 div 中
    fetch('footer.html')
    .then(response => response.text())
    .then(data => {
        document.getElementById('footer').innerHTML = data;
    })
    .catch(error => {
        console.log('Error loading footer:', error);
    });

	/* Preloader */
	$(window).on('load', function() {
		var preloaderFadeOutTime = 500;
		function hidePreloader() {
			var preloader = $('.spinner-wrapper');
			setTimeout(function() {
				preloader.fadeOut(preloaderFadeOutTime);
			}, 500);
		}
		hidePreloader();
	});

	
	$(window).on("scroll load", function () {
        var $navbar = $(".navbar");
        // 如果元素不存在，直接退出
        if ($navbar.length === 0) return; 
      
        if ($navbar.offset().top > 20) {
          $(".fixed-top").addClass("top-nav-collapse");
        } else {
          $(".fixed-top").removeClass("top-nav-collapse");
        }
    });

	// jQuery for page scrolling feature - requires jQuery Easing plugin
	$(function() {
		$(document).on('click', 'a.page-scroll', function(event) {
			var $anchor = $(this);
			var href = $anchor.attr('href');
			
			// 处理外部链接，直接跳转不使用平滑滚动
			if (href.startsWith('http')) {
				return; // 让浏览器处理外部链接
			}
			
			// 处理主页锚点链接的特殊滚动行为
			if (href.startsWith('index.html#')) {
				// 如果当前不在首页，则直接跳转到首页的相应锚点
				if (window.location.pathname !== '/index.html' && window.location.pathname !== '/') {
					// 直接跳转到首页锚点，不使用动画
					window.location.href = href;
					return;
				}
				
				var targetId = href.split('#')[1];
				var targetElement = $('#' + targetId);
				
				if (targetElement.length) {
					$('html, body').stop().animate({
						scrollTop: targetElement.offset().top
					}, 600);
					
					// 更新URL的hash部分但不触发默认跳转
					if (history.pushState) {
						history.pushState(null, null, '#' + targetId);
					} else {
						window.location.hash = targetId;
					}
					
					event.preventDefault();
					return;
				}
			}
			
			// 处理普通锚点链接（如#info）
			if (href.startsWith('#')) {
				var targetElement = $(href);
				if (targetElement.length) {
					$('html, body').stop().animate({
						scrollTop: targetElement.offset().top
					}, 600);
					event.preventDefault();
					return;
				}
			}
			
			// 默认处理其他页面链接
			// 注意：对于其他页面链接，我们不需要阻止默认行为，让浏览器正常跳转
		});
	});

    // closes the responsive menu on menu item click
    $(".navbar-nav li a").on("click", function(event) {
    if (!$(this).parent().hasClass('dropdown'))
        $(".navbar-collapse").collapse('hide');
    });


    /* Rotating Text - Morphtext */
    // Check if Morphext is available before initializing
    if ($.fn.Morphext) {
        $("#js-rotating").Morphext({
            // The [in] animation type. Refer to Animate.css for a list of available animations.
            animation: "fadeIn",
            // An array of phrases to rotate are created based on this separator. Change it if you wish to separate the phrases differently (e.g. So Simple | Very Doge | Much Wow | Such Cool).
            separator: ",",
            // The delay between the changing of each phrase in milliseconds.
            speed: 2000,
            complete: function () {
                // Called after the entrance animation is executed.
            }
        });
    }
    

    /* Card Slider - Swiper */
	var cardSlider = new Swiper('.card-slider', {
		autoplay: {
            delay: 4000,
            disableOnInteraction: false
		},
        loop: true,
        navigation: {
			nextEl: '.swiper-button-next',
			prevEl: '.swiper-button-prev'
		},
		slidesPerView: 3,
		spaceBetween: 20,
        breakpoints: {
            // when window is <= 992px
            992: {
                slidesPerView: 2
            },
            // when window is <= 768px
            768: {
                slidesPerView: 1
            } 
        }
    });

    
    /* Lightbox - Magnific Popup */
	$('.popup-with-move-anim').magnificPopup({
		type: 'inline',
		fixedContentPos: false, /* keep it false to avoid html tag shift with margin-right: 17px */
		fixedBgPos: true,
		overflowY: 'auto',
		closeBtnInside: true,
		preloader: false,
		midClick: true,
		removalDelay: 300,
		mainClass: 'my-mfp-slide-bottom'
    });
    
    // init Isotope
    var $grid = $('.grid').isotope({
        // options
        itemSelector: '.element-item',
        layoutMode: 'fitRows'
    });
    
    // filter items on button click
    $('.filters-button-group').on( 'click', 'a', function() {
        var filterValue = $(this).attr('data-filter');
        $grid.isotope({ filter: filterValue });
    });
    
    // change is-checked class on buttons
    $('.button-group').each( function( i, buttonGroup ) {
        var $buttonGroup = $( buttonGroup );
        $buttonGroup.on( 'click', 'a', function() {
            $buttonGroup.find('.is-checked').removeClass('is-checked');
            $( this ).addClass('is-checked');
        });	
    });
    

    /* Counter - CountTo */
	var a = 0;
	$(window).scroll(function() {
		if ($('#counter').length) { // checking if CountTo section exists in the page, if not it will not run the script and avoid errors	
			var oTop = $('#counter').offset().top - window.innerHeight;
			if (a == 0 && $(window).scrollTop() > oTop) {
			$('.counter-value').each(function() {
				var $this = $(this),
				countTo = $this.attr('data-count');
				$({
				countNum: $this.text()
				}).animate({
					countNum: countTo
				},
				{
					duration: 2000,
					easing: 'swing',
					step: function() {
					$this.text(Math.floor(this.countNum));
					},
					complete: function() {
					$this.text(this.countNum);
					//alert('finished');
					}
				});
			});
			a = 1;
			}
		}
    });


    /* Move Form Fields Label When User Types */
    // for input and textarea fields
    $("input, textarea").keyup(function(){
		if ($(this).val() != '') {
			$(this).addClass('notEmpty');
		} else {
			$(this).removeClass('notEmpty');
		}
    });

    function lsubmitForm() {
        // initiate variables with form content
		var name = $("#lname").val();
		var phone = $("#lphone").val();
		var email = $("#lemail").val();
		var select = $("#lselect").val();
        var terms = $("#lterms").val();
        
        $.ajax({
            type: "POST",
            url: "php/callmeform-process.php",
            data: "name=" + name + "&phone=" + phone + "&email=" + email + "&select=" + select + "&terms=" + terms, 
            success: function(text) {
                if (text == "success") {
                    lformSuccess();
                } else {
                    lformError();
                    lsubmitMSG(false, text);
                }
            }
        });
	}

    function lformSuccess() {
        $("#callMeForm")[0].reset();
        lsubmitMSG(true, "Request Submitted!");
        $("input").removeClass('notEmpty'); // resets the field label after submission
    }

    function lformError() {
        $("#callMeForm").removeClass().addClass('shake animated').one('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', function() {
            $(this).removeClass();
        });
	}

    function lsubmitMSG(valid, msg) {
        if (valid) {
            var msgClasses = "h3 text-center tada animated";
        } else {
            var msgClasses = "h3 text-center";
        }
        $("#lmsgSubmit").removeClass().addClass(msgClasses).text(msg);
    }

    function csubmitForm() {
        // initiate variables with form content
		var name = $("#cname").val();
		var email = $("#cemail").val();
        var message = $("#cmessage").val();
        var terms = $("#cterms").val();
        $.ajax({
            type: "POST",
            url: "php/contactform-process.php",
            data: "name=" + name + "&email=" + email + "&message=" + message + "&terms=" + terms, 
            success: function(text) {
                if (text == "success") {
                    cformSuccess();
                } else {
                    cformError();
                    csubmitMSG(false, text);
                }
            }
        });
	}

    function cformSuccess() {
        $("#contactForm")[0].reset();
        csubmitMSG(true, "Message Submitted!");
        $("input").removeClass('notEmpty'); // resets the field label after submission
        $("textarea").removeClass('notEmpty'); // resets the field label after submission
    }

    function cformError() {
        $("#contactForm").removeClass().addClass('shake animated').one('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', function() {
            $(this).removeClass();
        });
	}

    function csubmitMSG(valid, msg) {
        if (valid) {
            var msgClasses = "h3 text-center tada animated";
        } else {
            var msgClasses = "h3 text-center";
        }
        $("#cmsgSubmit").removeClass().addClass(msgClasses).text(msg);
    }

    function psubmitForm() {
        // initiate variables with form content
		var name = $("#pname").val();
		var email = $("#pemail").val();
        var select = $("#pselect").val();
        var terms = $("#pterms").val();
        
        $.ajax({
            type: "POST",
            url: "php/privacyform-process.php",
            data: "name=" + name + "&email=" + email + "&select=" + select + "&terms=" + terms, 
            success: function(text) {
                if (text == "success") {
                    pformSuccess();
                } else {
                    pformError();
                    psubmitMSG(false, text);
                }
            }
        });
	}

    function pformSuccess() {
        $("#privacyForm")[0].reset();
        psubmitMSG(true, "Request Submitted!");
        $("input").removeClass('notEmpty'); // resets the field label after submission
    }

    function pformError() {
        $("#privacyForm").removeClass().addClass('shake animated').one('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', function() {
            $(this).removeClass();
        });
	}

    function psubmitMSG(valid, msg) {
        if (valid) {
            var msgClasses = "h3 text-center tada animated";
        } else {
            var msgClasses = "h3 text-center";
        }
        $("#pmsgSubmit").removeClass().addClass(msgClasses).text(msg);
    }

	/* Removes Long Focus On Buttons */
	$(".button, a, button").mouseup(function() {
		$(this).blur();
	});

})(jQuery);