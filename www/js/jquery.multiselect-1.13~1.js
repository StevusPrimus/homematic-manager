/* jshint forin:true, noarg:true, noempty:true, eqeqeq:true, boss:true, undef:true, curly:true, browser:true, jquery:true */
/*
 * jQuery MultiSelect UI Widget 1.13
 * Copyright (c) 2012 Eric Hynds
 *
 * http://www.erichynds.com/jquery/jquery-ui-multiselect-widget/
 *
 * Depends:
 *   - jQuery 1.4.2+
 *   - jQuery UI 1.8 widget factory
 *
 * Optional:
 *   - jQuery UI effects
 *   - jQuery UI position utility
 *
 * Dual licensed under the MIT and GPL licenses:
 *   http://www.opensource.org/licenses/mit-license.php
 *   http://www.gnu.org/licenses/gpl.html
 *
 */
(function ($, undefined) {
    let multiselectID = 0;

    $.widget('ech.multiselect', {

        // Default options
        options: {
            header: true,
            height: 175,
            minWidth: 225,
            classes: '',
            checkAllText: 'Check all',
            uncheckAllText: 'Uncheck all',
            noneSelectedText: 'Select options',
            selectedText: '# selected',
            selectedList: 0,
            show: null,
            hide: null,
            autoOpen: false,
            multiple: true,
            position: {}
        },

        _create() {
            let el = this.element.hide(),
                o = this.options;

            this.speed = $.fx.speeds._default; // Default speed for effects
            this._isOpen = false; // Assume no

            let
                button = (this.button = $('<button type="button"><span class="ui-icon ui-icon-triangle-2-n-s"></span></button>'))
                    .addClass('ui-multiselect ui-widget ui-state-default ui-corner-all')
                    .addClass(o.classes)
                    .attr({title: el.attr('title'), 'aria-haspopup': true, tabIndex: el.attr('tabIndex')})
                    .insertAfter(el),

                buttonlabel = (this.buttonlabel = $('<span />'))
                    .html(o.noneSelectedText)
                    .appendTo(button),

                menu = (this.menu = $('<div />'))
                    .addClass('ui-multiselect-menu ui-widget ui-widget-content ui-corner-all')
                    .addClass(o.classes)
                    .appendTo(document.body),

                header = (this.header = $('<div />'))
                    .addClass('ui-widget-header ui-corner-all ui-multiselect-header ui-helper-clearfix')
                    .appendTo(menu),

                headerLinkContainer = (this.headerLinkContainer = $('<ul />'))
                    .addClass('ui-helper-reset')
                    .html(() => {
                        if (o.header === true) {
                            // Return '<li><a class="ui-multiselect-all" href="#"><span class="ui-icon ui-icon-check"></span><span>' + o.checkAllText + '</span></a></li><li><a class="ui-multiselect-none" href="#"><span class="ui-icon ui-icon-closethick"></span><span>' + o.uncheckAllText + '</span></a></li>';
                            return '<li><a class="ui-multiselect-all"><span class="ui-icon ui-icon-check"></span><span>' + o.checkAllText + '</span></a></li><li><a class="ui-multiselect-none"><span class="ui-icon ui-icon-closethick"></span><span>' + o.uncheckAllText + '</span></a></li>';
                        } else if (typeof o.header === 'string') {
                            return '<li>' + o.header + '</li>';
                        }
                        return '';
                    })
                    // .append('<li class="ui-multiselect-close"><a href="#" class="ui-multiselect-close"><span class="ui-icon ui-icon-circle-close"></span></a></li>')
                    .append('<li class="ui-multiselect-close"><a class="ui-multiselect-close"><span class="ui-icon ui-icon-circle-close"></span></a></li>')
                    .appendTo(header),

                checkboxContainer = (this.checkboxContainer = $('<ul />'))
                    .addClass('ui-multiselect-checkboxes ui-helper-reset')
                    .appendTo(menu);

            // Perform event bindings
            this._bindEvents();

            // Build menu
            this.refresh(true);

            // Some addl. logic for single selects
            if (!o.multiple) {
                menu.addClass('ui-multiselect-single');
            }
        },

        _init() {
            if (this.options.header === false) {
                this.header.hide();
            }
            if (!this.options.multiple) {
                this.headerLinkContainer.find('.ui-multiselect-all, .ui-multiselect-none').hide();
            }
            if (this.options.autoOpen) {
                this.open();
            }
            if (this.element.is(':disabled')) {
                this.disable();
            }
        },

        refresh(init) {
            let el = this.element,
                o = this.options,
                menu = this.menu,
                checkboxContainer = this.checkboxContainer,
                optgroups = [],
                html = '',
                id = el.attr('id') || multiselectID++; // Unique ID for the label & option tags

            // build items
            el.find('option').each(function (i) {
                let $this = $(this),
                    parent = this.parentNode,
                    title = this.innerHTML,
                    description = this.title,
                    value = this.value,
                    inputID = 'ui-multiselect-' + (this.id || id + '-option-' + i),
                    isDisabled = this.disabled,
                    isSelected = this.selected,
                    labelClasses = ['ui-corner-all'],
                    liClasses = (isDisabled ? 'ui-multiselect-disabled ' : ' ') + this.className,
                    optLabel;

                // Is this an optgroup?
                if (parent.tagName === 'OPTGROUP') {
                    optLabel = parent.getAttribute('label');

                    // Has this optgroup been added already?
                    if ($.inArray(optLabel, optgroups) === -1) {
                        // Html += '<li class="ui-multiselect-optgroup-label ' + parent.className + '"><a href="#">' + optLabel + '</a></li>';
                        html += '<li class="ui-multiselect-optgroup-label ' + parent.className + '"><a>' + optLabel + '</a></li>';
                        optgroups.push(optLabel);
                    }
                }

                if (isDisabled) {
                    labelClasses.push('ui-state-disabled');
                }

                // Browsers automatically select the first option
                // by default with single selects
                if (isSelected && !o.multiple) {
                    labelClasses.push('ui-state-active');
                }

                html += '<li class="' + liClasses + '">';

                // Create the label
                html += '<label for="' + inputID + '" title="' + description + '" class="' + labelClasses.join(' ') + '">';
                html += '<input id="' + inputID + '" name="multiselect_' + id + '" type="' + (o.multiple ? 'checkbox' : 'radio') + '" value="' + value + '" title="' + title + '"';

                // Pre-selected?
                if (isSelected) {
                    html += ' checked="checked"';
                    html += ' aria-selected="true"';
                }

                // Disabled?
                if (isDisabled) {
                    html += ' disabled="disabled"';
                    html += ' aria-disabled="true"';
                }

                // Add the title and close everything off
                html += ' /><span>' + title + '</span></label></li>';
            });

            // Insert into the DOM
            checkboxContainer.html(html);

            // Cache some moar useful elements
            this.labels = menu.find('label');
            this.inputs = this.labels.children('input');

            // Set widths
            this._setButtonWidth();
            this._setMenuWidth();

            // Remember default value
            this.button[0].defaultValue = this.update();

            // Broadcast refresh event; useful for widgets
            if (!init) {
                this._trigger('refresh');
            }
        },

        // Updates the button text. call refresh() to rebuild
        update() {
            let o = this.options,
                $inputs = this.inputs,
                $checked = $inputs.filter(':checked'),
                numChecked = $checked.length,
                value;

            if (numChecked === 0) {
                value = o.noneSelectedText;
            } else if ($.isFunction(o.selectedText)) {
                value = o.selectedText.call(this, numChecked, $inputs.length, $checked.get());
            } else if (/\d/.test(o.selectedList) && o.selectedList > 0 && numChecked <= o.selectedList) {
                value = $checked.map(function () {
                    return $(this).next().html();
                }).get().join(', ');
            } else {
                value = o.selectedText.replace('#', numChecked).replace('#', $inputs.length);
            }

            this.buttonlabel.html(value);
            return value;
        },

        // Binds events
        _bindEvents() {
            let self = this,
                button = this.button;

            function clickHandler() {
                self[self._isOpen ? 'close' : 'open']();
                return false;
            }

            // Webkit doesn't like it when you click on the span :(
            button
                .find('span')
                .bind('click.multiselect', clickHandler);

            // Button events
            button.bind({
                click: clickHandler,
                keypress(e) {
                    switch (e.which) {
                        case 27: // Esc
                        case 38: // Up
                        case 37: // Left
                            self.close();
                            break;
                        case 39: // Right
                        case 40: // Down
                            self.open();
                            break;
                    }
                },
                mouseenter() {
                    if (!button.hasClass('ui-state-disabled')) {
                        $(this).addClass('ui-state-hover');
                    }
                },
                mouseleave() {
                    $(this).removeClass('ui-state-hover');
                },
                focus() {
                    if (!button.hasClass('ui-state-disabled')) {
                        $(this).addClass('ui-state-focus');
                    }
                },
                blur() {
                    $(this).removeClass('ui-state-focus');
                }
            });

            // Header links
            this.header
                .delegate('a', 'click.multiselect', function (e) {
                    // Close link
                    if ($(this).hasClass('ui-multiselect-close')) {
                        self.close();

                        // Check all / uncheck all
                    } else {
                        self[$(this).hasClass('ui-multiselect-all') ? 'checkAll' : 'uncheckAll']();
                    }

                    e.preventDefault();
                });

            // Optgroup label toggle support
            this.menu
                .delegate('li.ui-multiselect-optgroup-label a', 'click.multiselect', function (e) {
                    e.preventDefault();

                    let $this = $(this),
                        $inputs = $this.parent().nextUntil('li.ui-multiselect-optgroup-label').find('input:visible:not(:disabled)'),
                        nodes = $inputs.get(),
                        label = $this.parent().text();

                    // Trigger event and bail if the return is false
                    if (self._trigger('beforeoptgrouptoggle', e, {inputs: nodes, label}) === false) {
                        return;
                    }

                    // Toggle inputs
                    self._toggleChecked(
                        $inputs.filter(':checked').length !== $inputs.length,
                        $inputs
                    );

                    self._trigger('optgrouptoggle', e, {
                        inputs: nodes,
                        label,
                        checked: nodes[0].checked
                    });
                })
                .delegate('label', 'mouseenter.multiselect', function () {
                    if (!$(this).hasClass('ui-state-disabled')) {
                        self.labels.removeClass('ui-state-hover');
                        $(this).addClass('ui-state-hover').find('input').focus();
                    }
                })
                .delegate('label', 'keydown.multiselect', function (e) {
                    e.preventDefault();

                    switch (e.which) {
                        case 9: // Tab
                        case 27: // Esc
                            self.close();
                            break;
                        case 38: // Up
                        case 40: // Down
                        case 37: // Left
                        case 39: // Right
                            self._traverse(e.which, this);
                            break;
                        case 13: // Enter
                            $(this).find('input')[0].click();
                            break;
                    }
                })
                .delegate('input[type="checkbox"], input[type="radio"]', 'click.multiselect', function (e) {
                    let $this = $(this),
                        val = this.value,
                        checked = this.checked,
                        tags = self.element.find('option');

                    // Bail if this input is disabled or the event is cancelled
                    if (this.disabled || self._trigger('click', e, {value: val, text: this.title, checked}) === false) {
                        e.preventDefault();
                        return;
                    }

                    // Make sure the input has focus. otherwise, the esc key
                    // won't close the menu after clicking an item.
                    $this.focus();

                    // Toggle aria state
                    $this.attr('aria-selected', checked);

                    // Change state on the original option tags
                    tags.each(function () {
                        if (this.value === val) {
                            this.selected = checked;
                        } else if (!self.options.multiple) {
                            this.selected = false;
                        }
                    });

                    // Some additional single select-specific logic
                    if (!self.options.multiple) {
                        self.labels.removeClass('ui-state-active');
                        $this.closest('label').toggleClass('ui-state-active', checked);

                        // Close menu
                        self.close();
                    }

                    // Fire change on the select box
                    self.element.trigger('change');

                    // SetTimeout is to fix multiselect issue #14 and #47. caused by jQuery issue #3827
                    // http://bugs.jquery.com/ticket/3827
                    setTimeout($.proxy(self.update, self), 10);
                });

            // Close each widget when clicking on any other element/anywhere else on the page
            $(document).bind('mousedown.multiselect', e => {
                if (self._isOpen && !$.contains(self.menu[0], e.target) && !$.contains(self.button[0], e.target) && e.target !== self.button[0]) {
                    self.close();
                }
            });

            // Deal with form resets.  the problem here is that buttons aren't
            // restored to their defaultValue prop on form reset, and the reset
            // handler fires before the form is actually reset.  delaying it a bit
            // gives the form inputs time to clear.
            $(this.element[0].form).bind('reset.multiselect', () => {
                setTimeout($.proxy(self.refresh, self), 10);
            });
        },

        // Set button width
        _setButtonWidth() {
            let width = this.element.outerWidth(),
                o = this.options;

            if (/\d/.test(o.minWidth) && width < o.minWidth) {
                width = o.minWidth;
            }

            // Set widths
            this.button.width(width);
        },

        // Set menu width
        _setMenuWidth() {
            let m = this.menu,
                width = this.button.outerWidth() -
                    parseInt(m.css('padding-left'), 10) -
                    parseInt(m.css('padding-right'), 10) -
                    parseInt(m.css('border-right-width'), 10) -
                    parseInt(m.css('border-left-width'), 10);

            m.width(width || this.button.outerWidth());
        },

        // Move up or down within the menu
        _traverse(which, start) {
            let $start = $(start),
                moveToLast = which === 38 || which === 37,

            // Select the first li that isn't an optgroup label / disabled
                $next = $start.parent()[moveToLast ? 'prevAll' : 'nextAll']('li:not(.ui-multiselect-disabled, .ui-multiselect-optgroup-label)')[moveToLast ? 'last' : 'first']();

            // If at the first/last element
            if (!$next.length) {
                const $container = this.menu.find('ul').last();

                // Move to the first/last
                this.menu.find('label')[moveToLast ? 'last' : 'first']().trigger('mouseover');

                // Set scroll position
                $container.scrollTop(moveToLast ? $container.height() : 0);
            } else {
                $next.find('label').trigger('mouseover');
            }
        },

        // This is an internal function to toggle the checked property and
        // other related attributes of a checkbox.
        //
        // The context of this function should be a checkbox; do not proxy it.
        _toggleState(prop, flag) {
            return function () {
                if (!this.disabled) {
                    this[prop] = flag;
                }

                if (flag) {
                    this.setAttribute('aria-selected', true);
                } else {
                    this.removeAttribute('aria-selected');
                }
            };
        },

        _toggleChecked(flag, group) {
            let $inputs = (group && group.length) ? group : this.inputs,
                self = this;

            // Toggle state on inputs
            $inputs.each(this._toggleState('checked', flag));

            // Give the first input focus
            $inputs.eq(0).focus();

            // Update button text
            this.update();

            // Gather an array of the values that actually changed
            const values = $inputs.map(function () {
                return this.value;
            }).get();

            // Toggle state on original option tags
            this.element
                .find('option')
                .each(function () {
                    if (!this.disabled && $.inArray(this.value, values) > -1) {
                        self._toggleState('selected', flag).call(this);
                    }
                });

            // Trigger the change event on the select
            if ($inputs.length) {
                this.element.trigger('change');
            }
        },

        _toggleDisabled(flag) {
            this.button
                .attr({disabled: flag, 'aria-disabled': flag})[flag ? 'addClass' : 'removeClass']('ui-state-disabled');

            let inputs = this.menu.find('input');
            const key = 'ech-multiselect-disabled';

            if (flag) {
                // Remember which elements this widget disabled (not pre-disabled)
                // elements, so that they can be restored if the widget is re-enabled.
                inputs = inputs.filter(':enabled')
                    .data(key, true);
            } else {
                inputs = inputs.filter(function () {
                    return $.data(this, key) === true;
                }).removeData(key);
            }

            inputs
                .attr({disabled: flag, 'arial-disabled': flag})
                .parent()[flag ? 'addClass' : 'removeClass']('ui-state-disabled');

            this.element
                .attr({disabled: flag, 'aria-disabled': flag});
        },

        // Open the menu
        open(e) {
            let self = this,
                button = this.button,
                menu = this.menu,
                speed = this.speed,
                o = this.options,
                args = [];

            // Bail if the multiselectopen event returns false, this widget is disabled, or is already open
            if (this._trigger('beforeopen') === false || button.hasClass('ui-state-disabled') || this._isOpen) {
                return;
            }

            let $container = menu.find('ul').last(),
                effect = o.show,
                pos = button.offset();

            // Figure out opening effects/speeds
            if ($.isArray(o.show)) {
                effect = o.show[0];
                speed = o.show[1] || self.speed;
            }

            // If there's an effect, assume jQuery UI is in use
            // build the arguments to pass to show()
            if (effect) {
                args = [effect, speed];
            }

            // Set the scroll of the checkbox container
            $container.scrollTop(0).height(o.height);

            // Position and show menu
            if ($.ui.position && !$.isEmptyObject(o.position)) {
                o.position.of = o.position.of || button;

                menu
                    .show()
                    .position(o.position)
                    .hide();

                // If position utility is not available...
            } else {
                menu.css({
                    top: pos.top + button.outerHeight(),
                    left: pos.left
                });
            }

            // Show the menu, maybe with a speed/effect combo
            $.fn.show.apply(menu, args);

            // Select the first option
            // triggering both mouseover and mouseover because 1.4.2+ has a bug where triggering mouseover
            // will actually trigger mouseenter.  the mouseenter trigger is there for when it's eventually fixed
            this.labels.eq(0).trigger('mouseover').trigger('mouseenter').find('input').trigger('focus');

            button.addClass('ui-state-active');
            this._isOpen = true;
            this._trigger('open');
        },

        // Close the menu
        close() {
            if (this._trigger('beforeclose') === false) {
                return;
            }

            let o = this.options,
                effect = o.hide,
                speed = this.speed,
                args = [];

            // Figure out opening effects/speeds
            if ($.isArray(o.hide)) {
                effect = o.hide[0];
                speed = o.hide[1] || this.speed;
            }

            if (effect) {
                args = [effect, speed];
            }

            $.fn.hide.apply(this.menu, args);
            this.button.removeClass('ui-state-active').trigger('blur').trigger('mouseleave');
            this._isOpen = false;
            this._trigger('close');
        },

        enable() {
            this._toggleDisabled(false);
        },

        disable() {
            this._toggleDisabled(true);
        },

        checkAll(e) {
            this._toggleChecked(true);
            this._trigger('checkAll');
        },

        uncheckAll() {
            this._toggleChecked(false);
            this._trigger('uncheckAll');
        },

        getChecked() {
            return this.menu.find('input').filter(':checked');
        },

        destroy() {
            // Remove classes + data
            $.Widget.prototype.destroy.call(this);

            this.button.remove();
            this.menu.remove();
            this.element.show();

            return this;
        },

        isOpen() {
            return this._isOpen;
        },

        widget() {
            return this.menu;
        },

        getButton() {
            return this.button;
        },

        // React to option changes after initialization
        _setOption(key, value) {
            const menu = this.menu;

            switch (key) {
                case 'header':
                    menu.find('div.ui-multiselect-header')[value ? 'show' : 'hide']();
                    break;
                case 'checkAllText':
                    menu.find('a.ui-multiselect-all span').eq(-1).text(value);
                    break;
                case 'uncheckAllText':
                    menu.find('a.ui-multiselect-none span').eq(-1).text(value);
                    break;
                case 'height':
                    menu.find('ul').last().height(parseInt(value, 10));
                    break;
                case 'minWidth':
                    this.options[key] = parseInt(value, 10);
                    this._setButtonWidth();
                    this._setMenuWidth();
                    break;
                case 'selectedText':
                case 'selectedList':
                case 'noneSelectedText':
                    this.options[key] = value; // These all needs to update immediately for the update() call
                    this.update();
                    break;
                case 'classes':
                    menu.add(this.button).removeClass(this.options.classes).addClass(value);
                    break;
                case 'multiple':
                    menu.toggleClass('ui-multiselect-single', !value);
                    this.options.multiple = value;
                    this.element[0].multiple = value;
                    this.refresh();
            }

            $.Widget.prototype._setOption.apply(this, arguments);
        }
    });
})(jQuery);
