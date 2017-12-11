(function(root, window, $, undefined) {  

    // == Private Definitions ==

    var $window                = $(window);
    var fontSizeUnit           = 'px';
    var defaultActiveMenuClass = 'carte-noir-active';

    /**
     * Determines if an object has been defined and is non-null.
     * 
     * @param {*} target The object to consider
     * 
     * @returns {bool} true if the target was defined; otherwise, false.
     */
    function isDefined(target) {
        return ((target !== undefined) && (target !== null));
    }

    /**
     * Prevents an event object from performing its default action.
     * 
     * @param {object} event [OPTIONAL] The jQuery event object.  If not present, then no special action is taken on the event.
     * 
     * @returns {bool} false is returned to signal to any handlers that they should not bubble the event.
     */
    function preventEventDefault(event) {
        if (isDefined(event)) {
            
            if (event.preventDefault) {
                event.preventDefault();
            }

            if (event.stopPropagation) {
                event.stopPropagation();
            }
        }

        return false;
    }

    // Theme definition

    var theme = {
        /**
         * Initializes the theme behaviors.
         *
         * @param {object} settings The settings to apply to the theme.  Expected members:
         *     adjustArticleListFontSizes : {bool}   A flag indicating whether article list font sizes should be adjusted or not         
         *     slideMenuSelector          : {string} The jQuery selector for the slide menu.
         *     slideMenuTriggerSelector   : {string} The jQuery selector for the slide menu toggle.
         *     articleContainerSelector   : {string} The jQuery selector for elements contain article titles
         *     articleTitleSelector       : {string} The jQuery selector for elements within an Article Container that contain the article title
         *     articleDateSelector        : {string} The jQuery selector for elements within an Article Container that contain the article date
         *     activeMenuToggleClass      : {string} [OPTIONAL] A CSS class to apply to the slide menu toggle when the menu is active
         */
        init : function Theme$init(settings) {
            var sideMenu        = $(settings.slideMenuSelector);
            var menuTrigger     = $(settings.slideMenuTriggerSelector);
            var menuActiveClass = (settings.activeMenuToggleClass || defaultActiveMenuClass);

            // Initialize the sliding menu.  This makes use of the jQuery mMenu plug-in.
           
            var menu    = sideMenu.mmenu();
            var menuApi = menu.data('mmenu');

            menuApi.carteMenuIsOpen = false;

            menuApi.carteOpenMenu = function Theme$carteOpenMenu() {
                menuApi.open();
                menuTrigger.addClass(menuActiveClass);
                menuApi.carteMenuIsOpen = true;
            }

            menuApi.carteCloseMenu = function Theme$carteCloseMenu() {
                menuApi.close();
                menuTrigger.removeClass(menuActiveClass);
                menuApi.carteMenuIsOpen = false;
            }

            menuApi.carteToggleMenu = function Theme$carteToggleMenu() {
                menuTrigger.toggleClass(menuActiveClass);

                if (menuApi.carteMenuIsOpen) {
                    menuApi.close();
                }
                else {
                    menuApi.open();
                }
                
                menuApi.carteMenuIsOpen = (!menuApi.carteMenuIsOpen);
            }

            menuTrigger.click(function(evt) {
                menuApi.carteToggleMenu();
                return preventEventDefault(evt);
            });

            // If the menu trigger is not visible upon initialization, ensure that the
            // menu is open so that it can be used.

            if (menuTrigger.is(':hidden')) {
                menuApi.carteOpenMenu();
            }

            // If article font sizes are to be adjusted to ensure they fit within their container, 
            // then capture the target elements and watch for resizes to the window.

            var resizeArticleTitles = function Theme$resizeArticleTitles() {};

            if (settings.adjustArticleListFontSizes) {
                var articleContainers = $(settings.articleContainerSelector);
                var artitleTitles     = {};
                var articleDates      = {};

                articleContainers.each(function(index, currentElement) {
                    var container = $(this);

                    artitleTitles[container] = container.find(settings.articleTitleSelector);
                    articleDates[container]  = container.find(settings.articleDateSelector);
                });

                var initialFontSize = parseInt(artitleTitles[articleContainers.first()].css('font-size'), 10);
               
                resizeArticleTitles = function Theme$resizeArticleTitles() {                    
                    // Ensure that the article titles and dates are sized to correctly fit within their
                    // container elements.

                    articleContainers.each(function() {
                        var container      = $(this);
                        var titles         = artitleTitles[container];
                        var dates          = articleDates[container];
                        var containerWidth = container.width();
                        var fontSize       = initialFontSize;
                        
                        // Reset the font size to the default.

                        titles.css('font-size', fontSize + fontSizeUnit);

                        // Walk back the font size until it fits within it's container.

                        while (titles.width() + dates.width() >= containerWidth) {
                            fontSize -= 0.5;
                            titles.css('font-size', fontSize + fontSizeUnit);
                        };                        
                    });
                };                
            }

            // Listen to the window resize event to control menu behavior and
            // perform any resizing that is needed for display elements.  Do this only 
            // after the resize has completed to avoid making multiple passes as the
            // window is size is actively changing.

            $window.resize(function() {
                if (this.resizeTimeout) {
                    window.clearTimeout(this.resizeTimeout);
                }

                this.resizeTimeout = window.setTimeout(function() {
                    $(this).trigger('resizeEnd');
                }, 125);
            });

            $window.on('resizeEnd', function() {
                // If there is no trigger and the menu is closed, open it.  This 
                // indicates that the menu should be always active for a larger screen.
                //
                // If there is a trigger and the menu is open, close it.  This indicates
                // that a window has been shrunk down and the user is not currently interacting
                // with it.  In this case, the content should be maximized.

                var menuTriggerVisible = menuTrigger.is(':visible');

                if (((!menuTriggerVisible) && (!menuApi.carteMenuIsOpen)) ||
                    ((menuTriggerVisible) && (menuApi.carteMenuIsOpen))) {
                    
                    menuApi.carteToggleMenu();
                }
                    
                resizeArticleTitles();
            });
        }
    };

    // == Exports ==

    root.Theme = theme;

})(window, window, jQuery);