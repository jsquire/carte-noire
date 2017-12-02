(function(root, window, $, undefined) {  

    // == Private Definitions ==

    var menuEvents = {
        open    : 'open.mm',
        closed  : 'closed.mm'
    };

    var $window  = $(window);
    var elements = null;

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

    // Site definition

    var site = {

        /**
         * Initializes the site functionality.
         *
         * @param {object} settings The settings to apply to the site.  Expected members:
         *     adjustArticleListFontSizes : A flag indicating whether article list font sizes should be adjusted or not
         *     slideMenuSelector          : The jQuery selector for the slide menu.
         *     slideMenuTriggerSelector   : The jQuery selector for the slide menu toggle.
         *     articleContainerSelector   : The jQuery selector for elements contain article titles
         *     articleTitleSelector       : The jQuery selector for elements within an Article Container that contain the article title
         *     articleDateSelector        : The jQuery selector for elements within an Article Container that contain the article date
         *     
         */
        init : function Site$init(settings) {
            elements = {
                sideMenu    : $(settings.slideMenuSelector),
                menuTrigger : $(settings.slideMenuTriggerSelector)
            };

            // Initialize the sliding menu.  This makes use of the jQuery mMenu plug-in.
           
            var menu = elements.sideMenu.mmenu({
                //offCanvas : false
            });

            menu.on(menuEvents.closed, function() { elements.menuTrigger.show(); });

            elements.menuTrigger.click(function(evt) {
                elements.menuTrigger.hide();
                menu.trigger(menuEvents.open);
                
                return preventeventDefault(evt);
            });

            // If article font sizes are to be adjusted to ensure they fit within their container, 
            // then capture the target elements and watch for resizes to the window.

            var resizeArticleTitles = function() {};

            if (settings.adjustArticleListFontSizes) {

                elements.articleContainers = $(settings.articleContainerSelector);
                elements.artitleTitles     = {};
                elements.articleDates      = {};

                elements.articleContainers.each(function(index, currentElement) {
                    var container = $(this);

                    elements.artitleTitles[container] = container.find(settings.articleTitleSelector);
                    elements.articleDates[container]  = container.find(settings.articleDateSelector);
                });

                var initialFontSize = parseInt(elements.artitleTitles[elements.articleContainers.first()].css('font-size'), 10);
               
                resizeArticleTitles = function() {
                    
                    // Ensure that the article titles and dates are sized to correctly fit within their
                    // container elements.

                    elements.articleContainers.each(function(index, currentElement) {
                        var container      = $(this);
                        var titles         = elements.artitleTitles[container];
                        var dates          = elements.articleDates[container];
                        var containerWidth = container.width();
                        var fontSize       = initialFontSize;
                        
                        // Reset the font size to the default.

                        titles.css('font-size', fontSize + 'px');

                        // Walk back the font size until it fits within it's container.

                        while (titles.width() + dates.width() >= containerWidth) {
                            fontSize -= 0.5;
                            titles.css('font-size', fontSize + 'px');
                        };                        
                    });
                };                
            }

            // Listen to the window resize event to control menu behavior and
            // perform any resizing that is needed for display elements.

            $window.resize(function() {
                resizeArticleTitles();
            });
        }
    };

    // == Exports ==

    root.Site = site;

})(window, window, jQuery);