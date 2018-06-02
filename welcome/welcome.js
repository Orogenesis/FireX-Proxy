(function ($) {
    new Swiper('.swiper-container', {
        direction: 'horizontal',
        loop: true,
        keyboard: {
            enabled: true,
            onlyInViewport: false,
        },
        navigation: {
            nextEl: '.button-next'
        },
        pagination: {
            el: '.swiper-pagination',
            clickable: true
        }
    });

    const popup = class {
        constructor(element, options) {
            this.$element     = $(element);
            this.closeKeyCode = options.closeKeyCode;
            this.closeButton  = options.closeButton;

            $(document).on('keydown.popup', (e) => {
                if (this.closeKeyCode === e.keyCode) {
                    this.close();
                }
            });

            this.$element.on('click.popup', this.closeButton, () => {
                this.close();
            });
        }

        close() {
            $(document).off('keydown.popup');
            this.$element.off('click.popup', this.closeButton);

            this.$element.hide();
        }
    };

    $.fn.window = function(options) {
        let defaults = {
            closeKeyCode: 27
        };

        options = $.extend(defaults, options);

        return $(this).each(function() {
            if ($.data(this, 'popup') === undefined) {
                $.data(this, 'popup', new popup(this, options));
            }
        });
    };

    $(".overlay").window({
        closeButton: '.button-close'
    });
})(jQuery);
