/*!
 * FooTable - Awesome Responsive Tables
 * Version : 2.0.3
 * http://fooplugins.com/plugins/footable-jquery/
 *
 * Requires jQuery - http://jquery.com/
 *
 * Copyright 2014 Steven Usher & Brad Vincent
 * Released under the MIT license
 * You are free to use FooTable in commercial projects as long as this copyright header is left intact.
 *
 * Date: 11 Nov 2014
 */
(function ($, w, undefined) {
    w.footable = {
        options: {
            delay: 100, // The number of millseconds to wait before triggering the react event
            breakpoints: { // The different screen resolution breakpoints
                phone: 480,
                tablet: 1024
            },
            parsers: {  // The default parser to parse the value out of a cell (values are used in building up row detail)
                alpha: function (cell) {
                    return $(cell).data('value') || $.trim($(cell).text());
                },
                numeric: function (cell) {
                    var val = $(cell).data('value') || $(cell).text().replace(/[^0-9.\-]/g, '');
                    val = parseFloat(val);
                    if (isNaN(val)) val = 0;
                    return val;
                }
            },
            addRowToggle: true,
            calculateWidthOverride: null,
            toggleSelector: ' > tbody > tr:not(.footable-row-detail)', //the selector to show/hide the detail row
            columnDataSelector: '> thead > tr:last-child > th, > thead > tr:last-child > td', //the selector used to find the column data in the thead
            detailSeparator: ':', //the separator character used when building up the detail row
            toggleHTMLElement: '<span />', // override this if you want to insert a click target rather than use a background image.
            createGroupedDetail: function (data) {
                var groups = { '_none': { 'name': null, 'data': [] } };
                for (var i = 0; i < data.length; i++) {
                    var groupid = data[i].group;
                    if (groupid !== null) {
                        if (!(groupid in groups))
                            groups[groupid] = { 'name': data[i].groupName || data[i].group, 'data': [] };

                        groups[groupid].data.push(data[i]);
                    } else {
                        groups._none.data.push(data[i]);
                    }
                }
                return groups;
            },
            createDetail: function (element, data, createGroupedDetail, separatorChar, classes) {
                /// <summary>This function is used by FooTable to generate the detail view seen when expanding a collapsed row.</summary>
                /// <param name="element">This is the div that contains all the detail row information, anything could be added to it.</param>
                /// <param name="data">
                ///  This is an array of objects containing the cell information for the current row.
                ///  These objects look like the below:
                ///    obj = {
                ///      'name': String, // The name of the column
                ///      'value': Object, // The value parsed from the cell using the parsers. This could be a string, a number or whatever the parser outputs.
                ///      'display': String, // This is the actual HTML from the cell, so if you have images etc you want moved this is the one to use and is the default value used.
                ///      'group': String, // This is the identifier used in the data-group attribute of the column.
                ///      'groupName': String // This is the actual name of the group the column belongs to.
                ///    }
                /// </param>
                /// <param name="createGroupedDetail">The grouping function to group the data</param>
                /// <param name="separatorChar">The separator charactor used</param>
                /// <param name="classes">The array of class names used to build up the detail row</param>

                var groups = createGroupedDetail(data);
                for (var group in groups) {
                    if (groups[group].data.length === 0) continue;
                    if (group !== '_none') element.append('<div class="' + classes.detailInnerGroup + '">' + groups[group].name + '</div>');

                    for (var j = 0; j < groups[group].data.length; j++) {
                        var separator = (groups[group].data[j].name) ? separatorChar : '';
                        element.append($('<div></div>').addClass(classes.detailInnerRow).append($('<div></div>').addClass(classes.detailInnerName)
                                .append(groups[group].data[j].name + separator)).append($('<div></div>').addClass(classes.detailInnerValue)
                                .attr('data-bind-value', groups[group].data[j].bindName).append(groups[group].data[j].display)));
                    }
                }
            },
            classes: {
                main: 'footable',
                loading: 'footable-loading',
                loaded: 'footable-loaded',
                toggle: 'footable-toggle',
                disabled: 'footable-disabled',
                detail: 'footable-row-detail',
                detailCell: 'footable-row-detail-cell',
                detailInner: 'footable-row-detail-inner',
                detailInnerRow: 'footable-row-detail-row',
                detailInnerGroup: 'footable-row-detail-group',
                detailInnerName: 'footable-row-detail-name',
                detailInnerValue: 'footable-row-detail-value',
                detailShow: 'footable-detail-show'
            },
            triggers: {
                initialize: 'footable_initialize',                      //trigger this event to force FooTable to reinitialize
                resize: 'footable_resize',                              //trigger this event to force FooTable to resize
                redraw: 'footable_redraw',                              //trigger this event to force FooTable to redraw
                toggleRow: 'footable_toggle_row',                       //trigger this event to force FooTable to toggle a row
                expandFirstRow: 'footable_expand_first_row',            //trigger this event to force FooTable to expand the first row
                expandAll: 'footable_expand_all',                       //trigger this event to force FooTable to expand all rows
                collapseAll: 'footable_collapse_all'                    //trigger this event to force FooTable to collapse all rows
            },
            events: {
                alreadyInitialized: 'footable_already_initialized',     //fires when the FooTable has already been initialized
                initializing: 'footable_initializing',                  //fires before FooTable starts initializing
                initialized: 'footable_initialized',                    //fires after FooTable has finished initializing
                resizing: 'footable_resizing',                          //fires before FooTable resizes
                resized: 'footable_resized',                            //fires after FooTable has resized
                redrawn: 'footable_redrawn',                            //fires after FooTable has redrawn
                breakpoint: 'footable_breakpoint',                      //fires inside the resize function, when a breakpoint is hit
                columnData: 'footable_column_data',                     //fires when setting up column data. Plugins should use this event to capture their own info about a column
                rowDetailUpdating: 'footable_row_detail_updating',      //fires before a detail row is updated
                rowDetailUpdated: 'footable_row_detail_updated',        //fires when a detail row is being updated
                rowCollapsed: 'footable_row_collapsed',                 //fires when a row is collapsed
                rowExpanded: 'footable_row_expanded',                   //fires when a row is expanded
                rowRemoved: 'footable_row_removed',                     //fires when a row is removed
                reset: 'footable_reset'                                 //fires when FooTable is reset
            },
            debug: false, // Whether or not to log information to the console.
            log: null
        },

        version: {
            major: 0, minor: 5,
            toString: function () {
                return w.footable.version.major + '.' + w.footable.version.minor;
            },
            parse: function (str) {
                var version = /(\d+)\.?(\d+)?\.?(\d+)?/.exec(str);
                return {
                    major: parseInt(version[1], 10) || 0,
                    minor: parseInt(version[2], 10) || 0,
                    patch: parseInt(version[3], 10) || 0
                };
            }
        },

        plugins: {
            _validate: function (plugin) {
                ///<summary>Simple validation of the <paramref name="plugin"/> to make sure any members called by FooTable actually exist.</summary>
                ///<param name="plugin">The object defining the plugin, this should implement a string property called "name" and a function called "init".</param>

                if (!$.isFunction(plugin)) {
                  if (w.footable.options.debug === true) console.error('Validation failed, expected type "function", received type "{0}".', typeof plugin);
                  return false;
                }
                var p = new plugin();
                if (typeof p['name'] !== 'string') {
                    if (w.footable.options.debug === true) console.error('Validation failed, plugin does not implement a string property called "name".', p);
                    return false;
                }
                if (!$.isFunction(p['init'])) {
                    if (w.footable.options.debug === true) console.error('Validation failed, plugin "' + p['name'] + '" does not implement a function called "init".', p);
                    return false;
                }
                if (w.footable.options.debug === true) console.log('Validation succeeded for plugin "' + p['name'] + '".', p);
                return true;
            },
            registered: [], // An array containing all registered plugins.
            register: function (plugin, options) {
                ///<summary>Registers a <paramref name="plugin"/> and its default <paramref name="options"/> with FooTable.</summary>
                ///<param name="plugin">The plugin that should implement a string property called "name" and a function called "init".</param>
                ///<param name="options">The default options to merge with the FooTable's base options.</param>

                if (w.footable.plugins._validate(plugin)) {
                    w.footable.plugins.registered.push(plugin);
                    if (typeof options === 'object') $.extend(true, w.footable.options, options);
                }
            },
            load: function(instance){
              var loaded = [], registered, i;
              for(i = 0; i < w.footable.plugins.registered.length; i++){
                try {
                  registered = w.footable.plugins.registered[i];
                  loaded.push(new registered(instance));
                } catch (err) {
                  if (w.footable.options.debug === true) console.error(err);
                }
              }
              return loaded;
            },
            init: function (instance) {
                ///<summary>Loops through all registered plugins and calls the "init" method supplying the current <paramref name="instance"/> of the FooTable as the first parameter.</summary>
                ///<param name="instance">The current instance of the FooTable that the plugin is being initialized for.</param>

                for (var i = 0; i < instance.plugins.length; i++) {
                    try {
                      instance.plugins[i]['init'](instance);
                    } catch (err) {
                        if (w.footable.options.debug === true) console.error(err);
                    }
                }
            }
        }
    };

    var instanceCount = 0;

    $.fn.footable = function (options) {
        ///<summary>The main constructor call to initialize the plugin using the supplied <paramref name="options"/>.</summary>
        ///<param name="options">
        ///<para>A JSON object containing user defined options for the plugin to use. Any options not supplied will have a default value assigned.</para>
        ///<para>Check the documentation or the default options object above for more information on available options.</para>
        ///</param>

        options = options || {};
        var o = $.extend(true, {}, w.footable.options, options); //merge user and default options
        return this.each(function () {
            instanceCount++;
            var footable = new Footable(this, o, instanceCount);
            $(this).data('footable', footable);
        });
    };

    //helper for using timeouts
    function Timer() {
        ///<summary>Simple timer object created around a timeout.</summary>
        var t = this;
        t.id = null;
        t.busy = false;
        t.start = function (code, milliseconds) {
            ///<summary>Starts the timer and waits the specified amount of <paramref name="milliseconds"/> before executing the supplied <paramref name="code"/>.</summary>
            ///<param name="code">The code to execute once the timer runs out.</param>
            ///<param name="milliseconds">The time in milliseconds to wait before executing the supplied <paramref name="code"/>.</param>

            if (t.busy) {
                return;
            }
            t.stop();
            t.id = setTimeout(function () {
                code();
                t.id = null;
                t.busy = false;
            }, milliseconds);
            t.busy = true;
        };
        t.stop = function () {
            ///<summary>Stops the timer if its runnning and resets it back to its starting state.</summary>

            if (t.id !== null) {
                clearTimeout(t.id);
                t.id = null;
                t.busy = false;
            }
        };
    }

    function Footable(t, o, id) {
        ///<summary>Inits a new instance of the plugin.</summary>
        ///<param name="t">The main table element to apply this plugin to.</param>
        ///<param name="o">The options supplied to the plugin. Check the defaults object to see all available options.</param>
        ///<param name="id">The id to assign to this instance of the plugin.</param>

        var ft = this;
        ft.id = id;
        ft.table = t;
        ft.options = o;
        ft.breakpoints = [];
        ft.breakpointNames = '';
        ft.columns = {};
        ft.plugins = w.footable.plugins.load(ft);

        var opt = ft.options,
            cls = opt.classes,
            evt = opt.events,
            trg = opt.triggers,
            indexOffset = 0;

        // This object simply houses all the timers used in the FooTable.
        ft.timers = {
            resize: new Timer(),
            register: function (name) {
                ft.timers[name] = new Timer();
                return ft.timers[name];
            }
        };

        ft.init = function () {
            var $window = $(w), $table = $(ft.table);

            w.footable.plugins.init(ft);

            if ($table.hasClass(cls.loaded)) {
                //already loaded FooTable for the table, so don't init again
                ft.raise(evt.alreadyInitialized);
                return;
            }

            //raise the initializing event
            ft.raise(evt.initializing);

            $table.addClass(cls.loading);

            // Get the column data once for the life time of the plugin
            $table.find(opt.columnDataSelector).each(function () {
                var data = ft.getColumnData(this);
                ft.columns[data.index] = data;
            });

            // Create a nice friendly array to work with out of the breakpoints object.
            for (var name in opt.breakpoints) {
                ft.breakpoints.push({ 'name': name, 'width': opt.breakpoints[name] });
                ft.breakpointNames += (name + ' ');
            }

            // Sort the breakpoints so the smallest is checked first
            ft.breakpoints.sort(function (a, b) {
                return a['width'] - b['width'];
            });

            $table
                .unbind(trg.initialize)
                //bind to FooTable initialize trigger
                .bind(trg.initialize, function () {
                    //remove previous "state" (to "force" a resize)
                    $table.removeData('footable_info');
                    $table.data('breakpoint', '');

                    //trigger the FooTable resize
                    $table.trigger(trg.resize);

                    //remove the loading class
                    $table.removeClass(cls.loading);

                    //add the FooTable and loaded class
                    $table.addClass(cls.loaded).addClass(cls.main);

                    //raise the initialized event
                    ft.raise(evt.initialized);
                })
                .unbind(trg.redraw)
                //bind to FooTable redraw trigger
                .bind(trg.redraw, function () {
                    ft.redraw();
                })
                .unbind(trg.resize)
                //bind to FooTable resize trigger
                .bind(trg.resize, function () {
                    ft.resize();
                })
                .unbind(trg.expandFirstRow)
                //bind to FooTable expandFirstRow trigger
                .bind(trg.expandFirstRow, function () {
                    $table.find(opt.toggleSelector).first().not('.' + cls.detailShow).trigger(trg.toggleRow);
                })
                .unbind(trg.expandAll)
                //bind to FooTable expandFirstRow trigger
                .bind(trg.expandAll, function () {
                    $table.find(opt.toggleSelector).not('.' + cls.detailShow).trigger(trg.toggleRow);
                })
                .unbind(trg.collapseAll)
                //bind to FooTable expandFirstRow trigger
                .bind(trg.collapseAll, function () {
                    $table.find('.' + cls.detailShow).trigger(trg.toggleRow);
                });

            //trigger a FooTable initialize
            $table.trigger(trg.initialize);

            //bind to window resize
            $window
                .bind('resize.footable', function () {
                    ft.timers.resize.stop();
                    ft.timers.resize.start(function () {
                        ft.raise(trg.resize);
                    }, opt.delay);
                });
        };

        ft.addRowToggle = function () {
            if (!opt.addRowToggle) return;

            var $table = $(ft.table),
                hasToggleColumn = false;

            //first remove all toggle spans
            $table.find('span.' + cls.toggle).remove();

            for (var c in ft.columns) {
                var col = ft.columns[c];
                if (col.toggle) {
                    hasToggleColumn = true;
                    var selector = '> tbody > tr:not(.' + cls.detail + ',.' + cls.disabled + ') > td:nth-child(' + (parseInt(col.index, 10) + 1) + '),' +
                                            '> tbody > tr:not(.' + cls.detail + ',.' + cls.disabled + ') > th:nth-child(' + (parseInt(col.index, 10) + 1) + ')';
                    $table.find(selector).not('.' + cls.detailCell).prepend($(opt.toggleHTMLElement).addClass(cls.toggle));
                    return;
                }
            }
            //check if we have an toggle column. If not then add it to the first column just to be safe
            if (!hasToggleColumn) {
                $table
                    .find('> tbody > tr:not(.' + cls.detail + ',.' + cls.disabled + ') > td:first-child')
                                        .add('> tbody > tr:not(.' + cls.detail + ',.' + cls.disabled + ') > th:first-child')
                    .not('.' + cls.detailCell)
                    .prepend($(opt.toggleHTMLElement).addClass(cls.toggle));
            }
        };

        ft.setColumnClasses = function () {
            var $table = $(ft.table);
            for (var c in ft.columns) {
                var col = ft.columns[c];
                if (col.className !== null) {
                    var selector = '', first = true;
                    $.each(col.matches, function (m, match) { //support for colspans
                        if (!first) selector += ', ';
                        selector += '> tbody > tr:not(.' + cls.detail + ') > td:nth-child(' + (parseInt(match, 10) + 1) + ')';
                        first = false;
                    });
                    //add the className to the cells specified by data-class="blah"
                    $table.find(selector).not('.' + cls.detailCell).addClass(col.className);
                }
            }
        };

        //moved this out into it's own function so that it can be called from other add-ons
        ft.bindToggleSelectors = function () {
            var $table = $(ft.table);

            if (!ft.hasAnyBreakpointColumn()) return;

            $table.find(opt.toggleSelector).unbind(trg.toggleRow).bind(trg.toggleRow, function (e) {
                var $row = $(this).is('tr') ? $(this) : $(this).parents('tr:first');
                ft.toggleDetail($row);
            });

            $table.find(opt.toggleSelector).unbind('click.footable').bind('click.footable', function (e) {
                if ($table.is('.breakpoint') && $(e.target).is('td,th,.'+ cls.toggle)) {
                    $(this).trigger(trg.toggleRow);
                }
            });
        };

        ft.parse = function (cell, column) {
            var parser = opt.parsers[column.type] || opt.parsers.alpha;
            return parser(cell);
        };

        ft.getColumnData = function (th) {
            var $th = $(th), hide = $th.data('hide'), index = $th.index();
            hide = hide || '';
            hide = jQuery.map(hide.split(','), function (a) {
                return jQuery.trim(a);
            });
            var data = {
                'index': index,
                'hide': { },
                'type': $th.data('type') || 'alpha',
                'name': $th.data('name') || $.trim($th.text()),
                'ignore': $th.data('ignore') || false,
                'toggle': $th.data('toggle') || false,
                'className': $th.data('class') || null,
                'matches': [],
                'names': { },
                'group': $th.data('group') || null,
                'groupName': null,
                'isEditable': $th.data('editable')
            };

            if (data.group !== null) {
                var $group = $(ft.table).find('> thead > tr.footable-group-row > th[data-group="' + data.group + '"], > thead > tr.footable-group-row > td[data-group="' + data.group + '"]').first();
                data.groupName = ft.parse($group, { 'type': 'alpha' });
            }

            var pcolspan = parseInt($th.prev().attr('colspan') || 0, 10);
            indexOffset += pcolspan > 1 ? pcolspan - 1 : 0;
            var colspan = parseInt($th.attr('colspan') || 0, 10), curindex = data.index + indexOffset;
            if (colspan > 1) {
                var names = $th.data('names');
                names = names || '';
                names = names.split(',');
                for (var i = 0; i < colspan; i++) {
                    data.matches.push(i + curindex);
                    if (i < names.length) data.names[i + curindex] = names[i];
                }
            } else {
                data.matches.push(curindex);
            }

            data.hide['default'] = ($th.data('hide') === "all") || ($.inArray('default', hide) >= 0);

            var hasBreakpoint = false;
            for (var name in opt.breakpoints) {
                data.hide[name] = ($th.data('hide') === "all") || ($.inArray(name, hide) >= 0);
                hasBreakpoint = hasBreakpoint || data.hide[name];
            }
            data.hasBreakpoint = hasBreakpoint;
            var e = ft.raise(evt.columnData, { 'column': { 'data': data, 'th': th } });
            return e.column.data;
        };

        ft.getViewportWidth = function () {
            return window.innerWidth || (document.body ? document.body.offsetWidth : 0);
        };

        ft.calculateWidth = function ($table, info) {
            if (jQuery.isFunction(opt.calculateWidthOverride)) {
                return opt.calculateWidthOverride($table, info);
            }
            if (info.viewportWidth < info.width) info.width = info.viewportWidth;
            if (info.parentWidth < info.width) info.width = info.parentWidth;
            return info;
        };

        ft.hasBreakpointColumn = function (breakpoint) {
            for (var c in ft.columns) {
                if (ft.columns[c].hide[breakpoint]) {
                    if (ft.columns[c].ignore) {
                        continue;
                    }
                    return true;
                }
            }
            return false;
        };

        ft.hasAnyBreakpointColumn = function () {
            for (var c in ft.columns) {
                if (ft.columns[c].hasBreakpoint) {
                    return true;
                }
            }
            return false;
        };

        ft.resize = function () {
            var $table = $(ft.table);

            if (!$table.is(':visible')) {
                return;
            } //we only care about FooTables that are visible

            if (!ft.hasAnyBreakpointColumn()) {
				$table.trigger(trg.redraw);
				return;
            } //we only care about FooTables that have breakpoints

            var info = {
                'width': $table.width(),                  //the table width
                'viewportWidth': ft.getViewportWidth(),   //the width of the viewport
                'parentWidth': $table.parent().width()    //the width of the parent
            };

            info = ft.calculateWidth($table, info);

            var pinfo = $table.data('footable_info');
            $table.data('footable_info', info);
            ft.raise(evt.resizing, { 'old': pinfo, 'info': info });

            // This (if) statement is here purely to make sure events aren't raised twice as mobile safari seems to do
            if (!pinfo || (pinfo && pinfo.width && pinfo.width !== info.width)) {

                var current = null, breakpoint;
                for (var i = 0; i < ft.breakpoints.length; i++) {
                    breakpoint = ft.breakpoints[i];
                    if (breakpoint && breakpoint.width && info.width <= breakpoint.width) {
                        current = breakpoint;
                        break;
                    }
                }

                var breakpointName = (current === null ? 'default' : current['name']),
                    hasBreakpointFired = ft.hasBreakpointColumn(breakpointName),
                    previousBreakpoint = $table.data('breakpoint');

                $table
                    .data('breakpoint', breakpointName)
                    .removeClass('default breakpoint').removeClass(ft.breakpointNames)
                    .addClass(breakpointName + (hasBreakpointFired ? ' breakpoint' : ''));

                //only do something if the breakpoint has changed
                if (breakpointName !== previousBreakpoint) {
                    //trigger a redraw
                    $table.trigger(trg.redraw);
                    //raise a breakpoint event
                    ft.raise(evt.breakpoint, { 'breakpoint': breakpointName, 'info': info });
                }
            }

            ft.raise(evt.resized, { 'old': pinfo, 'info': info });
        };

        ft.redraw = function () {
            //add the toggler to each row
            ft.addRowToggle();

            //bind the toggle selector click events
            ft.bindToggleSelectors();

            //set any cell classes defined for the columns
            ft.setColumnClasses();

            var $table = $(ft.table),
                breakpointName = $table.data('breakpoint'),
                hasBreakpointFired = ft.hasBreakpointColumn(breakpointName);

            $table
                .find('> tbody > tr:not(.' + cls.detail + ')').data('detail_created', false).end()
                .find('> thead > tr:last-child > th')
                .each(function () {
                    var data = ft.columns[$(this).index()], selector = '', first = true;
                    $.each(data.matches, function (m, match) {
                        if (!first) {
                            selector += ', ';
                        }
                        var count = match + 1;
                        selector += '> tbody > tr:not(.' + cls.detail + ') > td:nth-child(' + count + ')';
                        selector += ', > tfoot > tr:not(.' + cls.detail + ') > td:nth-child(' + count + ')';
                        selector += ', > colgroup > col:nth-child(' + count + ')';
                        first = false;
                    });

                    selector += ', > thead > tr[data-group-row="true"] > th[data-group="' + data.group + '"]';
                    var $column = $table.find(selector).add(this);
                    if (breakpointName !== '') {
                      if (data.hide[breakpointName] === false) $column.addClass('footable-visible').show();
                      else $column.removeClass('footable-visible').hide();
                    }

                    if ($table.find('> thead > tr.footable-group-row').length === 1) {
                        var $groupcols = $table.find('> thead > tr:last-child > th[data-group="' + data.group + '"]:visible, > thead > tr:last-child > th[data-group="' + data.group + '"]:visible'),
                            $group = $table.find('> thead > tr.footable-group-row > th[data-group="' + data.group + '"], > thead > tr.footable-group-row > td[data-group="' + data.group + '"]'),
                            groupspan = 0;

                        $.each($groupcols, function () {
                            groupspan += parseInt($(this).attr('colspan') || 1, 10);
                        });

                        if (groupspan > 0) $group.attr('colspan', groupspan).show();
                        else $group.hide();
                    }
                })
                .end()
                .find('> tbody > tr.' + cls.detailShow).each(function () {
                    ft.createOrUpdateDetailRow(this);
                });

            $table.find("[data-bind-name]").each(function () {
                ft.toggleInput(this);
            });

            $table.find('> tbody > tr.' + cls.detailShow + ':visible').each(function () {
                var $next = $(this).next();
                if ($next.hasClass(cls.detail)) {
                    if (!hasBreakpointFired) $next.hide();
                    else $next.show();
                }
            });

            // adding .footable-first-column and .footable-last-column to the first and last th and td of each row in order to allow
            // for styling if the first or last column is hidden (which won't work using :first-child or :last-child)
            $table.find('> thead > tr > th.footable-last-column, > tbody > tr > td.footable-last-column').removeClass('footable-last-column');
            $table.find('> thead > tr > th.footable-first-column, > tbody > tr > td.footable-first-column').removeClass('footable-first-column');
            $table.find('> thead > tr, > tbody > tr')
                .find('> th.footable-visible:last, > td.footable-visible:last')
                .addClass('footable-last-column')
                .end()
                .find('> th.footable-visible:first, > td.footable-visible:first')
                .addClass('footable-first-column');

            ft.raise(evt.redrawn);
        };

        ft.toggleDetail = function (row) {
            var $row = (row.jquery) ? row : $(row),
                $next = $row.next();

            //check if the row is already expanded
            if ($row.hasClass(cls.detailShow)) {
                $row.removeClass(cls.detailShow);

                //only hide the next row if it's a detail row
                if ($next.hasClass(cls.detail)) $next.hide();

                ft.raise(evt.rowCollapsed, { 'row': $row[0] });

            } else {
                ft.createOrUpdateDetailRow($row[0]);
                $row.addClass(cls.detailShow)
                    .next().show();

                ft.raise(evt.rowExpanded, { 'row': $row[0] });
            }
        };

        ft.removeRow = function (row) {
            var $row = (row.jquery) ? row : $(row);
            if ($row.hasClass(cls.detail)) {
                $row = $row.prev();
            }
            var $next = $row.next();
            if ($row.data('detail_created') === true) {
                //remove the detail row
                $next.remove();
            }
            $row.remove();

            //raise event
            ft.raise(evt.rowRemoved);
        };

        ft.appendRow = function (row) {
            var $row = (row.jquery) ? row : $(row);
            $(ft.table).find('tbody').append($row);

            //redraw the table
            ft.redraw();
        };

        ft.getColumnFromTdIndex = function (index) {
            /// <summary>Returns the correct column data for the supplied index taking into account colspans.</summary>
            /// <param name="index">The index to retrieve the column data for.</param>
            /// <returns type="json">A JSON object containing the column data for the supplied index.</returns>
            var result = null;
            for (var column in ft.columns) {
                if ($.inArray(index, ft.columns[column].matches) >= 0) {
                    result = ft.columns[column];
                    break;
                }
            }
            return result;
        };

        ft.createOrUpdateDetailRow = function (actualRow) {
            var $row = $(actualRow), $next = $row.next(), $detail, values = [];
            if ($row.data('detail_created') === true) return true;

            if ($row.is(':hidden')) return false; //if the row is hidden for some reason (perhaps filtered) then get out of here
            ft.raise(evt.rowDetailUpdating, { 'row': $row, 'detail': $next });
            $row.find('> td:hidden').each(function () {
                var index = $(this).index(), column = ft.getColumnFromTdIndex(index), name = column.name;
                if (column.ignore === true) return true;

                if (index in column.names) name = column.names[index];

                var bindName = $(this).attr("data-bind-name");
                if (bindName != null && $(this).is(':empty')) {
                    var bindValue = $('.' + cls.detailInnerValue + '[' + 'data-bind-value="' + bindName + '"]');
                    $(this).html($(bindValue).contents().detach());
                }
                var display;
                if (column.isEditable !== false && (column.isEditable || $(this).find(":input").length > 0)) {
                    if(bindName == null) {
                        bindName = "bind-" + $.now() + "-" + index;
                        $(this).attr("data-bind-name", bindName);
                    }
                    display = $(this).contents().detach();
                }
                if (!display) display = $(this).contents().clone(true, true);
                values.push({ 'name': name, 'value': ft.parse(this, column), 'display': display, 'group': column.group, 'groupName': column.groupName, 'bindName': bindName });
                return true;
            });
            if (values.length === 0) return false; //return if we don't have any data to show
            var colspan = $row.find('> td:visible').length;
            var exists = $next.hasClass(cls.detail);
            if (!exists) { // Create
                $next = $('<tr class="' + cls.detail + '"><td class="' + cls.detailCell + '"><div class="' + cls.detailInner + '"></div></td></tr>');
                $row.after($next);
            }
            $next.find('> td:first').attr('colspan', colspan);
            $detail = $next.find('.' + cls.detailInner).empty();
            opt.createDetail($detail, values, opt.createGroupedDetail, opt.detailSeparator, cls);
            $row.data('detail_created', true);
            ft.raise(evt.rowDetailUpdated, { 'row': $row, 'detail': $next });
            return !exists;
        };

        ft.raise = function (eventName, args) {

            if (ft.options.debug === true && $.isFunction(ft.options.log)) ft.options.log(eventName, 'event');

            args = args || { };
            var def = { 'ft': ft };
            $.extend(true, def, args);
            var e = $.Event(eventName, def);
            if (!e.ft) {
                $.extend(true, e, def);
            } //pre jQuery 1.6 which did not allow data to be passed to event object constructor
            $(ft.table).trigger(e);
            return e;
        };

        //reset the state of FooTable
        ft.reset = function() {
            var $table = $(ft.table);
            $table.removeData('footable_info')
                .data('breakpoint', '')
                .removeClass(cls.loading)
                .removeClass(cls.loaded);

            $table.find(opt.toggleSelector).unbind(trg.toggleRow).unbind('click.footable');

            $table.find('> tbody > tr').removeClass(cls.detailShow);

            $table.find('> tbody > tr.' + cls.detail).remove();

            ft.raise(evt.reset);
        };

        //Switch between row-detail and detail-show.
        ft.toggleInput = function (column) {
            var bindName = $(column).attr("data-bind-name");
            if(bindName != null) {
                var bindValue = $('.' + cls.detailInnerValue + '[' + 'data-bind-value="' + bindName + '"]');
                if(bindValue != null) {
                    if($(column).is(":visible")) {
                        if(!$(bindValue).is(':empty')) $(column).html($(bindValue).contents().detach());
                    } else if(!$(column).is(':empty')) {
                        $(bindValue).html($(column).contents().detach());
                    }
                }
            }
        };

        ft.init();
        return ft;
    }
})(jQuery, window);
;
(function ($, w, undefined) {
    if (w.footable === undefined || w.footable === null)
        throw new Error('Please check and make sure footable.js is included in the page and is loaded prior to this script.');

    var defaults = {
        filter: {
            enabled: true,
            input: '.footable-filter',
            timeout: 300,
            minimum: 2,
            disableEnter: false,
            filterFunction: function(index) {
                var $t = $(this),
                    $table = $t.parents('table:first'),
                    filter = $table.data('current-filter').toUpperCase(),
                    text = $t.find('td').text();
                if (!$table.data('filter-text-only')) {
                    $t.find('td[data-value]').each(function () {
                        text += $(this).data('value');
                    });
                }
                return text.toUpperCase().indexOf(filter) >= 0;
            }
        }
    };

    function Filter() {
        var p = this;
        p.name = 'Footable Filter';
        p.init = function (ft) {
            p.footable = ft;
            if (ft.options.filter.enabled === true) {
                if ($(ft.table).data('filter') === false) return;
                ft.timers.register('filter');
                $(ft.table)
                    .unbind('.filtering')
                    .bind({
                        'footable_initialized.filtering': function (e) {
                            var $table = $(ft.table);
                            var data = {
                                'input': $table.data('filter') || ft.options.filter.input,
                                'timeout': $table.data('filter-timeout') || ft.options.filter.timeout,
                                'minimum': $table.data('filter-minimum') || ft.options.filter.minimum,
                                'disableEnter': $table.data('filter-disable-enter') || ft.options.filter.disableEnter
                            };
                            if (data.disableEnter) {
                                $(data.input).keypress(function (event) {
                                    if (window.event)
                                        return (window.event.keyCode !== 13);
                                    else
                                        return (event.which !== 13);
                                });
                            }
                            $table.bind('footable_clear_filter', function () {
                                $(data.input).val('');
                                p.clearFilter();
                            });
                            $table.bind('footable_filter', function (event, args) {
                                p.filter(args.filter);
                            });
                            $(data.input).keyup(function (eve) {
                                ft.timers.filter.stop();
                                if (eve.which === 27) {
                                    $(data.input).val('');
                                }
                                ft.timers.filter.start(function () {
                                    var val = $(data.input).val() || '';
                                    p.filter(val);
                                }, data.timeout);
                            });
                        },
                        'footable_redrawn.filtering': function (e) {
                            var $table = $(ft.table),
                                filter = $table.data('filter-string');
                            if (filter) {
                                p.filter(filter);
                            }
                        }
                })
                //save the filter object onto the table so we can access it later
                .data('footable-filter', p);
            }
        };

        p.filter = function (filterString) {
            var ft = p.footable,
                $table = $(ft.table),
                minimum = $table.data('filter-minimum') || ft.options.filter.minimum,
                clear = !filterString;

            //raise a pre-filter event so that we can cancel the filtering if needed
            var event = ft.raise('footable_filtering', { filter: filterString, clear: clear });
            if (event && event.result === false) return;
            if (event.filter && event.filter.length < minimum) {
              return; //if we do not have the minimum chars then do nothing
            }

          if (event.clear) {
                p.clearFilter();
            } else {
                var filters = event.filter.split(' ');

                $table.find('> tbody > tr').hide().addClass('footable-filtered');
                var rows = $table.find('> tbody > tr:not(.footable-row-detail)');
                $.each(filters, function (i, f) {
                    if (f && f.length > 0) {
                        $table.data('current-filter', f);
                        rows = rows.filter(ft.options.filter.filterFunction);
                    }
                });
                rows.each(function () {
                    p.showRow(this, ft);
                    $(this).removeClass('footable-filtered');
                });
                $table.data('filter-string', event.filter);
                ft.raise('footable_filtered', { filter: event.filter, clear: false });
            }
        };

        p.clearFilter = function () {
            var ft = p.footable,
                $table = $(ft.table);

            $table.find('> tbody > tr:not(.footable-row-detail)').removeClass('footable-filtered').each(function () {
                p.showRow(this, ft);
            });
            $table.removeData('filter-string');
            ft.raise('footable_filtered', { clear: true });
        };

        p.showRow = function (row, ft) {
            var $row = $(row), $next = $row.next(), $table = $(ft.table);
            if ($row.is(':visible')) return; //already visible - do nothing
            if ($table.hasClass('breakpoint') && $row.hasClass('footable-detail-show') && $next.hasClass('footable-row-detail')) {
                $row.add($next).show();
                ft.createOrUpdateDetailRow(row);
            }
            else $row.show();
        };
    }

    w.footable.plugins.register(Filter, defaults);

})(jQuery, window);
;
/*! jRespond.js v 0.10 | Author: Jeremy Fields [jeremy.fields@viget.com], 2013 | License: MIT */
!function(a,b,c){"object"==typeof module&&module&&"object"==typeof module.exports?module.exports=c:(a[b]=c,"function"==typeof define&&define.amd&&define(b,[],function(){return c}))}(this,"jRespond",function(a,b,c){"use strict";return function(a){var b=[],d=[],e=a,f="",g="",i=0,j=100,k=500,l=k,m=function(){var a=0;return a="number"!=typeof window.innerWidth?0!==document.documentElement.clientWidth?document.documentElement.clientWidth:document.body.clientWidth:window.innerWidth},n=function(a){if(a.length===c)o(a);else for(var b=0;b<a.length;b++)o(a[b])},o=function(a){var e=a.breakpoint,h=a.enter||c;b.push(a),d.push(!1),r(e)&&(h!==c&&h.call(null,{entering:f,exiting:g}),d[b.length-1]=!0)},p=function(){for(var a=[],e=[],h=0;h<b.length;h++){var i=b[h].breakpoint,j=b[h].enter||c,k=b[h].exit||c;"*"===i?(j!==c&&a.push(j),k!==c&&e.push(k)):r(i)?(j===c||d[h]||a.push(j),d[h]=!0):(k!==c&&d[h]&&e.push(k),d[h]=!1)}for(var l={entering:f,exiting:g},m=0;m<e.length;m++)e[m].call(null,l);for(var n=0;n<a.length;n++)a[n].call(null,l)},q=function(a){for(var b=!1,c=0;c<e.length;c++)if(a>=e[c].enter&&a<=e[c].exit){b=!0;break}b&&f!==e[c].label?(g=f,f=e[c].label,p()):b||""===f||(f="",p())},r=function(a){if("object"==typeof a){if(a.join().indexOf(f)>=0)return!0}else{if("*"===a)return!0;if("string"==typeof a&&f===a)return!0}},s=function(){var a=m();a!==i?(l=j,q(a)):l=k,i=a,setTimeout(s,l)};return s(),{addFunc:function(a){n(a)},getBreakpoint:function(){return f}}}}(this,this.document));;
// make console.log safe to use
window.console||(console={log:function(){}});;
// call jRespond and add breakpoints
var jRes = jRespond([
    {
        label: 'small',
        enter: 0,
        exit: 740
    },{
        label: 'medium',
        enter: 741,
        exit: 980
    },{
        label: 'large',
        enter: 981,
        exit: 999999
    }
]);

var stateHandler = function() {
  stateChanged = false;
  initState = false;
  if (typeof lastState === 'undefined') {
    lastState = jRes.getBreakpoint();
    initState = true;
  } else {
    lastState = currentState;
  }
  currentState = jRes.getBreakpoint();
  
  if (currentState!=lastState || initState) {
    if (initState) {
      initializeState(jQuery);
    }
    switch (currentState) {
      case 'small':
        smallState(jQuery);
        break;
      case 'medium':
        mediumState(jQuery);
        break;
      case 'large':
        largeState(jQuery);
        break;
    }
    stateChanged = true;
  }
  if (stateChanged) {
    setHandleBy(currentState);
  }
}

var initializeState = function($) {
  // Init footables
  $('.footable').footable();
  $(window).resize(function() {
    if($("#search-block").is(":hidden") && $(window).width() > 583) {
      $("#search-block").show();
    }
  });

  //Mobile search box toggle
  $("#expand-search-button").on("click", function() {
    if($("#search-block").is(':visible')) {
      $("#expand-search-button").css("background-position","78px 4px");
    }
    else {
      $("#expand-search-button").css("background-position","78px 107%");
    }
    $("#expand-search-button").css("background-size","25px");
    $("#search-block").slideToggle();
    $("#search-block .form-text").focus();

  });
  
  // Program summary toggle box
  $('.program-summary h3').click(function() {
    if ($(this).hasClass('expanded')) {
      $(this).removeClass('expanded');
    $('.program-summary div.content').slideToggle('400');
    } else {
      $('.program-summary div.content').slideToggle('400');
      $(this).addClass('expanded');
    }
  });
  
  // Embedded RFI toggle box
  $('.embedded-rfi-right h3').click(function() {
    if ($(this).hasClass('expanded')) {
      $(this).removeClass('expanded');
      $('.embedded-rfi-right #rfi-embed').slideToggle('400');
    } else {
      $('.embedded-rfi-right #rfi-embed').slideToggle('400');
      $(this).addClass('expanded');
    }
  });
  
  // Related programs toggle box
  $('.related-programs h3').click(function() {
    if ($(this).hasClass('expanded')) {
      $(this).removeClass('expanded');
    $('.related-programs div.content').slideToggle('400');
    } else {
      $('.related-programs div.content').slideToggle('400');
      $(this).addClass('expanded');
    }
  });
  // Secondary menu: copy secondary links to the mobile section menu
  $('.mobile-secondary-menu-links').append($('#block-menu-block-prospects-left').children().clone());
  $('.mobile-secondary-menu-links').append($('#block-psu-program-program-menu').children().clone());
  $('.mobile-secondary-menu-links').append($('div.menu-name-menu-military-nav').children().clone());
  $('.mobile-secondary-menu-links').append($('#block-psu-prospects-b2b-b2b-menu').children().clone());
  
  // Repeated menu: copy secondary links to the bottom of the page   
  $('#mobile-menu-repeat-links').append($('#block-menu-block-prospects-left').children().clone());
  $('#mobile-menu-repeat-links').append($('#block-psu-program-program-menu').children().clone());
  $('#mobile-menu-repeat-links').append($('div.menu-name-menu-military-nav').children().clone());
  $('#mobile-menu-repeat-links').append($('#block-psu-prospects-b2b-b2b-menu').children().clone());
  
  // Mobile menu buttons click events
  $('#mobile-main-menu-button').click(function() {
    $('.mobile-main-menu-links').slideToggle('slow');
    $('.mobile-secondary-menu-links').hide();
  });
  $('#mobile-secondary-menu-button').click(function() {
    $('.mobile-secondary-menu-links').slideToggle('slow');
    $('.mobile-main-menu-links').hide();
  });
	  
  // TIML: Move block to the first column
  $('div.field-name-field-prgm-be-stories-ref').insertAfter('nav.psu-sidemenu');
  $('div.field-name-field-p-be-stories-ref').insertAfter('nav.block-menu-block-prospects-left');
  $('div.field-name-field-p-be-stories-ref').insertAfter('nav.block-psu-prospects-page-military');
  $('article.block-psu-prospects-events').insertAfter('nav.psu-sidemenu');
  $('div.field-name-field-p-be-stories-ref').insertAfter('article.block-psu-prospects-events');
  if ($('div.field-name-field-p-be-stories-ref').length != 0) {
    $('div.be-pager').remove().insertAfter('div.field-name-field-p-be-stories-ref div.story-row:last');
  }
  // THML: Start on a random story
  var random = Math.floor(Math.random() * $('a.story-link').length);
  $('a.story-link-' + random + ', div.story-row-' + random).addClass('active');
  
  // TIML: Hide the quote if a TIML story exists
  if ($('div.field-name-field-p-be-stories-ref').length != 0) {
    $('article#block-psu-quote-random-quote').remove();
  }
  
  // TIML: Pager functions
  $('a.story-link').each(function(i) {
    $(this).click(function() {
      $(this).addClass('active');
      $('a.story-link').not(this).removeClass('active');
      $('.story-row-'+(i)).fadeIn('slow'); 
      $('.story-row').not('.story-row-'+(i)).css('display','none'); 
      return false;
    });
  });
  programSelectFix = [];
  programSelectFix.push('#webform-component-step-3-of-3 .fieldset-wrapper .fieldset-wrapper select');
  programSelectFix.push('#webform-component-program-interest--fieldset-more-both-prog select');
  programSelectFix.push('form.admissions-reqs #edit-undergraduate');
  programSelectFix.push('form.admissions-reqs #edit-graduate');
  programSelectFix.push('#edit-estimator #edit-graduate');
  programSelectFix.push('#psu-cc-get-program-form #edit-program');
  jQuery( window ).load(jQuery.each(programSelectFix,function(index, value) {
    iOsSelectWrap(value);
  }));
}

// Large breakpoint above 980px
var largeState = function($) {
  $('.group-full-right-inner').appendTo($('.group-full-right'));
  if ($('#admissions-result-right').length) {
    // Admission reqs hack
    $('#admissions-result-right').appendTo($('.admissions-right.group-full-right'));
  }
  // Move program summer to right column
  $('.program-summary').prependTo($('.group-full-right'));
  
  // Hide mobile menus for larger displays
  $('div.mobile-section-menu').hide();
  $('#mobile-menu-repeat').hide();
  
  // Homepage: Move title for tablet and mobile (I'm ugly - Rob, help!)
  $('#we-are-block .item1 h2').appendTo($('#we-are-block .item1 .we-are-above'));
  $('#we-are-block .item2 h2').appendTo($('#we-are-block .item2 .we-are-above'));
  $('#we-are-block .item3 h2').appendTo($('#we-are-block .item3 .we-are-above'));
  
}

// Medium breakpoint between 741px and 980px
var mediumState = function($) {
  $('.group-full-right-inner').appendTo($('#second-sidebar-tablet'));
  if ($('#admissions-result-right').length) {
    // Admission reqs hack
    $('#admissions-result-right').appendTo($('#second-sidebar-tablet'));
  }
  // Move program summery to main content area
  $('.program-summary').insertBefore($('.program-overview .field-name-body'));
  
  // Hide mobile menus for larger displays
  $('div.mobile-section-menu').hide();
  $('#mobile-menu-repeat').hide();
  
  // Homepage: Move title for tablet and mobile (I'm ugly - Rob, help!)
  $('#we-are-block .item1 h2').appendTo($('#we-are-block .item1 .we-are-right'));
  $('#we-are-block .item2 h2').appendTo($('#we-are-block .item2 .we-are-right'));
  $('#we-are-block .item3 h2').appendTo($('#we-are-block .item3 .we-are-right'));
}

// Small breakoint up to 740px
var smallState = function($) {
  $('.group-full-right-inner').appendTo($('#second-sidebar-tablet'));
  if ($('#admissions-result-right').length) {
    // Admission reqs hack
    $('#admissions-result-right').appendTo($('#second-sidebar-tablet'));
  }
  // Move program summery to main content area
  $('.program-summary').insertBefore($('.program-overview .field-name-body'));
	
  // If a secondary menu exists, show it and make room
  if ($('.mobile-secondary-menu-links ul').length != 0) {
    $('div.mobile-site-menu').css('width', '50%');
    $('div.mobile-section-menu').show();
    $('#mobile-menu-repeat').show();
  }	
}

var setHandleBy = function(state) {
  if (jQuery("[name='submitted[handle_by]']").length) {
    handle_by = state=='large' ? 1 : 8;
    jQuery("[name='submitted[handle_by]']").val(handle_by);
  }
}

var iOsSelectWrap = function(element) {
  jQuery(element).append('<optgroup label=""></optgroup>');
}

jQuery( window ).load(stateHandler);

jQuery(function() {
    var timer_id;
    jQuery(window).resize(function() {
        clearTimeout(timer_id);
        timer_id = setTimeout(function() {
            stateHandler();
        }, 200);
    });
});	

;
(function ($) {
  $( document ).ready(function() {
    function is_touch_device() {
      return ('ontouchstart' in window)       // works on most browsers
          || (navigator.msMaxTouchPoints > 0);  // works on IE10 with some false positives
    }

    function isElementInViewport(el) {
      if (typeof jQuery === "function" && el instanceof jQuery) {
        el = el[0];
      }
      var rect = el.getBoundingClientRect();
      return (
        rect.top <= (window.innerHeight || document.documentElement.clientHeight) && /*or $(window).height() */
        rect.left >= 0 &&
        rect.right <= (window.innerWidth || document.documentElement.clientWidth) /*or $(window).width() */
      );
    }
    function loadVideo(e, video_id, is_mobile) {
      is_mobile = is_mobile || false;
      var player = new YT.Player(video_id, {
        videoId: video_id,
        playerVars: {
          'wmode': 'opaque',
          'modestbranding': 1,
          'rel': 0,
          'origin': 'https://www.worldcampus.psu.edu'
        },
        events: {
          'onReady': function( event ) {
            onPlayerReady( event, is_mobile );
          },
          'onStateChange': function( event ) {
            onStateChangeHandler( event, video_id );
          }
        }
      });
      function onPlayerReady(event, is_mobile) {
        if( !is_mobile ) {
          event.target.playVideo();
        }
      }
      e.next('.media-youtube-container').show();
    }
    // TIML: Load Youtube iframe when clicked
    $('.media-youtube-video a').click(function(e) {
      e.preventDefault();
      $(this).hide();

      loadVideo($(this), $(this).attr('video-id'), false);
    });
    function checkVideos() {
      if(is_touch_device()) {
        $('.media-youtube-wrapper').each(function(index) {
          if(isElementInViewport($(this))) {
            var video = $(this).find('a');
            video.hide();
            loadVideo(video, video.attr('video-id'), true);
          }
        });
      }
    }
    $(window).on('scroll resize touchmove touchend', function() {
      checkVideos();
    });

    var tag = document.createElement('script');
    tag.src = "https://www.youtube.com/iframe_api";
    document.getElementsByTagName('head')[0].appendChild(tag);

    window.onYouTubeIframeAPIReady = function(){
      checkVideos();
    }

    var config = {
        'events': {
        'Play': true,
        'Pause': true,
        'Watch to End': true
      },
      'percentageTracking': {
        'every': 25,
        'each': [ 10, 90 ]
      }
    }
    var _config = config || {};
    var forceSyntax = _config.forceSyntax || 0;
    var dataLayerName = _config.dataLayerName || 'dataLayer';
    // Default configuration for events
    var eventsFired = {
      'Play'        : true,
      'Pause'       : true,
      'Watch to End': true
    };

    // Returns key/value pairs of percentages: number of seconds to achieve
    function getMarks(duration) {

      var marks = {};

      // For full support, we're handling Watch to End with percentage viewed
      if (_config.events[ 'Watch to End' ] ) {

        marks[ 'Watch to End' ] = duration * 99 / 100;

      }

      if( _config.percentageTracking ) {

        var points = [];
        var i;

        if( _config.percentageTracking.each ) {

          points = points.concat( _config.percentageTracking.each );

        }

        if( _config.percentageTracking.every ) {

          var every = parseInt( _config.percentageTracking.every, 10 );
          var num = 100 / every;

          for( i = 1; i < num; i++ ) {

            points.push(i * every);

          }

        }

        for(i = 0; i < points.length; i++) {

          var _point = points[i];
          var _mark = _point + '%';
          var _time = duration * _point / 100;

          marks[_mark] = Math.floor( _time );

        }

      }

      return marks;

    }

    function checkCompletion(player, marks, videoId) {

      var duration     = player.getDuration();
      var currentTime  = player.getCurrentTime();
      var playbackRate = player.getPlaybackRate();
      var targetVideoData   = player.getVideoData();
      var targetVideoTitle  = targetVideoData['title'];
      player[videoId] = player[videoId] || {};
      var key;

      for( key in marks ) {

        if( marks[key] <= currentTime && !player[videoId][key] ) {

          player[videoId][key] = true;
          fireAnalyticsEvent( videoId, key, targetVideoTitle );

        }

      }

    }

    // Event handler for events emitted from the YouTube API
    function onStateChangeHandler( evt ) {

      var stateIndex     = evt.data;
      var player         = evt.target;
      var targetVideoUrl = player.getVideoUrl();
      var targetVideoId  = targetVideoUrl.match( /[?&]v=([^&#]*)/ )[ 1 ];  // Extract the ID
      var playerState    = player.getPlayerState();
      var duration       = player.getDuration();
      var marks          = getMarks(duration);
      var targetVideoData   = player.getVideoData();
      var targetVideoTitle  = targetVideoData['title'];
      var playerStatesIndex = {
        '1' : 'Play',
        '2' : 'Pause'
      };
      var state = playerStatesIndex[ stateIndex ];

      player.playTracker = player.playTracker || {};

      if( playerState === 1 && !player.timer ) {

        clearInterval(player.timer);

        player.timer = setInterval(function() {

          // Check every second to see if we've hit any of our percentage viewed marks
          checkCompletion(player, marks, player.videoId);

        }, 1000);

      } else {

        clearInterval(player.timer);
        player.timer = false;

      }

      // Playlist edge-case handler
      if( stateIndex === 1 ) {

        player.playTracker[ targetVideoId ] = true;
        player.videoId = targetVideoId;
        player.pauseFlag = false;

      }

      if( !player.playTracker[ player.videoId ] ) {

        // This video hasn't started yet, so this is spam
        return false;

      }

      if( stateIndex === 2 ) {

        if( !player.pauseFlag ) {

          player.pauseFlag = true;

        } else {

          // We don't want to fire consecutive pause events
          return false;

        }

      }

      // If we're meant to track this event, fire it
      if( eventsFired[ state ] ) {

        fireAnalyticsEvent( player.videoId, state, targetVideoTitle );

      }

    }

    // Fire an event to Google Analytics or Google Tag Manager
    // Update 2016-03-31 JLV161: Added third param for video title
    // and replacing the videoUrl with the title as GA Event Label
    function fireAnalyticsEvent( videoId, state, title ) {
      var videoUrl = 'https://www.youtube.com/watch?v=' + videoId;
      var _ga = window.GoogleAnalyticsObject;

      if( typeof window[ dataLayerName ] !== 'undefined' && !_config.forceSyntax ) {

        window[ dataLayerName ].push( {

          'event'     : 'youTubeTrack',
          'attributes': {

            'videoUrl': videoUrl,
            'videoAction': state,
            'videoTitle': title

          }

        } );

      } else if( typeof window[ _ga ] === 'function' &&
                 typeof window[ _ga ].getAll === 'function' &&
                 _config.forceSyntax !== 2 )
      {

        window[ _ga ]( 'send', 'event', 'Videos', state, videoUrl );

      } else if( typeof window._gaq !== 'undefined' && forceSyntax !== 1 ) {

        window._gaq.push( [ '_trackEvent', 'Videos', state, w ] );

      }

    }
  });
})(jQuery);;
