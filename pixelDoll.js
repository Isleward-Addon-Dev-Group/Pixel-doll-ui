addons.register({
    init: function(events)
    {
        // Filters
        this.includeFilter = [];
        this.excludeFilter = [];
        this.levelFilter   = {
            'level'    : 0,
            'operator' : null,
            'limit'    : 10
        };
        // Items
        this.equipedItems  = [];

        // Events
        events.on('onGetItems', this.onItemsLoad.bind(this));
        events.on('onGetStats', this.onChangeStats.bind(this));
        events.on('onShowInventory', this.toggleInventory.bind(this));
        events.on('onKeyDown', this.onKeyDown.bind(this));
        events.on('onDestroyItems', this.destroyItems.bind(this));

    },
    toggleInventory: function()
    {
        // UI Elements
        this.uiInventory  = $('.uiInventory');
        this.uiPixelDoll  = $('.pixelDoll');
        this.uiFilterDoll = $('.filterDoll');
        this.uiCompareTip = $('.pixelDollCompare');

        // Conditions
        if(this.uiCompareTip.length <= 0)
        {
            this.uiCompareTip = $('<div class="pixelDollCompare"></div>').appendTo(this.uiInventory);
        }

        // Functions
        this.addInventoryTabs();
        this.buildPixelDoll();
        this.buildFilterDoll();
        this.inventoryBuilders();
    },
    onItemsLoad: function(items)
    {
        // Variables
        this.items = items;

        // Conditions
        this.equipedItems = this.loadEquipedItems();

        // Functions
        this.addItemsToPixelDoll();
        this.inventoryBuilders();
    },
    inventoryBuilders: function()
    {
        this.addQualityBorders();
        setTimeout(this.filterInventory.bind(this), 1);
        setTimeout(this.addCompareTooltips.bind(this), 1);
    },
    loadEquipedItems: function()
    {
        var items = this.items;
        var equipedItems = [];
        for(var i = 0; i < items.length; i++)
        {
            if(items[i].eq == true)
            {
                equipedItems.push(items[i]);
            }
        }
        return equipedItems;
    },
    addInventoryTabs: function()
    {
        var btnPixelDoll  = $('.pdCharacter');
        var btnFilterDoll = $('.pdFilters');
        var btnStatWindow = $('.pdStats');
        var that          = this;

        if(btnPixelDoll.length <= 0 && btnFilterDoll.length <= 0 && btnStatWindow.length <= 0 )
        {
            btnPixelDoll  = $('<div class="pixelDoll-Button pdCharacter pdActive"></div>').appendTo(this.uiInventory);
            btnStatWindow = $('<div class="pixelDoll-Button pdStats"></div>').appendTo(this.uiInventory);
            btnFilterDoll = $('<div class="pixelDoll-Button pdFilters"></div>').appendTo(this.uiInventory);
        }

        btnPixelDoll.on('click', function() {
            that.uiPixelDoll.show()
            that.uiFilterDoll.hide();
            btnFilterDoll.removeClass('pdActive');
            btnStatWindow.removeClass('pdActive');
            $(this).addClass('pdActive');
        })

        btnStatWindow.on('click', function() {
            that.uiPixelDoll.hide()
            that.uiFilterDoll.hide();
            btnPixelDoll.removeClass('pdActive');
            btnFilterDoll.removeClass('pdActive');
            $(this).addClass('pdActive');
        });

        btnFilterDoll.on('click', function() {
            that.uiPixelDoll.hide()
            that.uiFilterDoll.show();
            btnPixelDoll.removeClass('pdActive');
            btnStatWindow.removeClass('pdActive');
            $(this).addClass('pdActive');
        })
    },
    buildPixelDoll: function()
    {
        if(this.uiPixelDoll.length <= 0)
        {
            this.uiPixelDoll = $('<div class="pixelDoll"></div>').appendTo(this.uiInventory);
        }
        if( ! this.uiPixelDoll.html())
        {

            $('<div class="pdHeading">'+window.player.name+'</div>').appendTo(this.uiPixelDoll);
            $('<div class="pdLevel pdText">level '+window.player.level+'</div>').appendTo(this.uiPixelDoll);
            $('<div class="pdClass pdText">class '+window.player.class+'</div>').appendTo(this.uiPixelDoll);

            // add player's character
            var characterFrame = $('<div class="pdCharacterFrame"></div>').appendTo(this.uiPixelDoll);
            spriteY = ~~(window.player.cell / 8);
            spriteX = window.player.cell - (spriteY * 8);
            spriteY = -(spriteY * 32);
            spriteX = -(spriteX * 32);
            var character = $('<div class="pdCharacterPreview"></div>').appendTo(characterFrame);
            character.css('background', 'url("../../../images/charas.png") ' + spriteX + 'px ' + spriteY + 'px');

            var pdSlots = ['head','neck','chest','hands','twoHanded','waist','legs','feet','finger','trinket'];
            for(var i = 0; i < pdSlots.length; i++)
            {
                $('<div class="pdItem" data-quality="0" data-slot="'+pdSlots[i]+'"></div>').appendTo(this.uiPixelDoll);
            }

            this.addItemsToPixelDoll();
        }
    },
    addItemsToPixelDoll: function()
    {
        var equipedItems = this.equipedItems;
        for(var j = 0; j < equipedItems.length; j++)
        {
            var item = equipedItems[j];
            var imgX = item.sprite[0] * 64;
            var imgY = item.sprite[1] * 64;
            var eqpi = $('.pdItem[data-slot="'+item.slot+'"]');

            eqpi.attr('data-quality', item.quality)
                .html('<div class="icon" style="background: url(\'../../../images/items.png\') -'+imgX+'px -'+imgY+'px;"></div></div>')
                .on('mouseenter', this.showEqTooltip.bind(this, item, eqpi))
                .on('mouseleave', this.hideEqTooltip.bind());
        }
    },
    showEqTooltip: function(item, element, e)
    {
        var elOffset = $(element).offset();
        var uiOffset = this.uiInventory.offset();
        var tooltip  = $('.uiTooltipItem .tooltip');
        tooltip.show();
        tooltip.css({
            left: ~~(elOffset.left + 74),
            top:  ~~(elOffset.top + 4)
        })
        tooltip.attr('data-quality', item.quality);

        stats = Object.keys(item.stats).map(function(s) {
                return s + ': ' + item.stats[s];
            }).join('<br />');

        tooltip.html(
        "<div class='name q"+item.quality+"'>"+item.name+"</div>"+
        "<div class='stats'>"+stats+"</div>"+
        "<div class='level'>level: "+item.level+"</div>"
        );
    },
    hideEqTooltip: function()
    {
        $('.uiTooltipItem .tooltip').hide();
    },
    addQualityBorders: function()
    {
        var items = this.items;
        if(this.uiInventory != undefined)
        {
            if(this.uiInventory.children('.grid .item').length <= 0)
            {
                setTimeout(function() {
                    for(var i = 0; i < items.length; i++)
                    {
                        var item  = $('.uiInventory .grid .item').eq(i);
                        if(item.attr('data-quality') == undefined)
                        {
                            item.attr('data-quality', items[i].quality);
                            var imgX = -(items[i].sprite[0] * 64) - 4;
                            var imgY = -(items[i].sprite[1] * 64) - 4;
                            item.children('.icon').css('background-position', imgX + 'px ' + imgY + 'px');
                        }
                    }
                }, 1);
            }
        }
        else
        {
            return;
        }
    },
    addCompareTooltips: function()
    {
        var invItems = $('.uiInventory .grid .item');
        for(var i = 0; i < invItems.length; i++)
        {
            invItems.eq(i).on('mouseenter', this.buildCompareTooltip.bind(this, invItems.eq(i), invItems.eq(i).data('item'))).on('mouseleave', this.hideCompareTooltip.bind(this));
        }
    },
    buildCompareTooltip: function(el, item, e)
    {
        var tooltip = $('.uiTooltipItem .tooltip');
        tooltip.attr('data-quality', item.quality);

        if(item.material == undefined)
        {
            var equipedItems = this.equipedItems;
            var elOffset     = el.offset();
            var uiOffset     = this.uiInventory.offset();

            tooltip = $('.pixelDollCompare');
            tooltip.css({
                left: ~~(elOffset.left - uiOffset.left + 292),
                top:  ~~(elOffset.top - uiOffset.top + 4)
            })

            for(var i = 0; i < equipedItems.length; i++)
            {
                var eqItem = equipedItems[i];
                if(eqItem.slot == item.slot)
                {
                    stats = Object.keys(eqItem.stats).map(function(s) {
                            return s + ': ' + eqItem.stats[s];
                        }).join('<br />');
                    tooltip.attr('data-quality', eqItem.quality);
                    tooltip.html(
                    "<div class='info'>currently equipped</div>"+
                    "<div class='name q"+eqItem.quality+"'>"+eqItem.name+"</div>"+
                    "<div class='stats'>"+stats+"</div>"+
                    "<div class='level'>level: "+eqItem.level+"</div>"
                    );
                    tooltip.show();
                }

            }

        }
    },
    hideCompareTooltip: function()
    {
        $('.pixelDollCompare').hide();
    },
    onChangeStats: function(stats)
    {
        if(this.uiPixelDoll != undefined && this.uiPixelDoll.children('.pdLevel').html())
        {
            var currentLevel = parseInt($('.pdLevel').html().slice(6));
            if(currentLevel != stats.level)
            {
                $('.pixelDoll .pdLevel').html('level ' + stats.level);
            }
        }
    },
    buildFilterDoll: function()
    {
        if(this.uiFilterDoll.length <= 0)
        {
            this.uiFilterDoll = $('<div class="filterDoll"></div>').appendTo(this.uiInventory);
        }

        if( ! this.uiFilterDoll.html())
        {
            $('<div class="fdHeading">Filters</div>').appendTo(this.uiFilterDoll);

            // Input box
            $('<div class="fdLevelMinus fdMiniButton">-</div><input type="text" class="fdLevelInput" value="0" /><div class="fdLevelPlus fdMiniButton">+</div>').appendTo(this.uiFilterDoll);

            // Filter buttons
            var fdStats = ['manaMax','regenMana','hpMax','regenHp','str','int','dex','magicFind','addCritChance','armor', 'clear filters'];
            for(var i = 0; i < fdStats.length; i++)
            {
                $('<div class="fdButton" data-state="0" data-stat="'+fdStats[i]+'">'+fdStats[i]+'</div>').appendTo(this.uiFilterDoll);
            }
        }

        $('.fdMiniButton').unbind('click').click(this.changeLevelValue.bind(this));
        $('.fdButton').unbind('click').click(this.fillFilters.bind(this));
        $('.fdLevelInput').change(this.fillFilters.bind(this));

    },
    changeLevelValue: function(el)
    {
        var levelValue = $('.fdLevelInput').val();
        var trigger    = $(el.target);
        var value      = levelValue.split(' ');
        var level      = 0;
        var number     = 0;

        if(trigger.attr('class') == 'fdLevelMinus fdMiniButton')
        {
            if(value.length == 1)
            {
                value  = value[0].replace(/[^0-9]/g, '');
                number = parseInt(value);
                level  = number - 1;
            }
            else if(value.length >= 2 && value.length <= 3)
            {
                number = parseInt(value[1]);
                value[1] = number - 1;
                limit = '';
                if(value[2] !== undefined) limit = ' '+value[2];
                level = value[0] + ' ' + value[1] + limit;
            }
        }
        else if(trigger.attr('class') == 'fdLevelPlus fdMiniButton')
        {
            if(value.length == 1)
            {
                value  = value[0].replace(/[^0-9]/g, '');
                number = parseInt(value) + 1;
                level  = number;
            }
            else if(value.length >= 2 && value.length <= 3)
            {
                number = parseInt(value[1]) + 1;
                value[1] = number;
                limit = '';
                if(value[2] !== undefined) limit = ' '+value[2];
                level = value[0] + ' ' + value[1] + limit;
            }
        }

        if(number > 0)
        {
            $('.fdLevelInput').val(level);
            $('.fdLevelInput').trigger("change");
        }
    },
    fillFilters: function(el)
    {
        var includeFilter = this.includeFilter;
        var excludeFilter = this.excludeFilter;
        var levelFilter   = this.levelFilter;
        var level         = $('.fdLevelInput').val();
        var trigger       = $(el.target);

        if(trigger.attr('class') == 'fdButton' && trigger.attr('data-stat') != 'clear filters')
        {
            var data  = trigger.attr('data-stat');
            var state = trigger.attr('data-state');

            switch(state)
            {
                case '0':
                    includeFilter.push(data);
                    trigger.attr('data-state', 1);
                break;
                case '1':
                    if($.inArray(data, includeFilter) != -1)
                    {
                        includeFilter.splice( $.inArray(data, includeFilter), 1);
                    }
                    excludeFilter.push(data);
                    trigger.attr('data-state', 2);
                break;
                case '2':
                    if($.inArray(data, includeFilter) != -1)
                    {
                        includeFilter.splice( $.inArray(data, includeFilter), 1);
                    }
                    if($.inArray(data, excludeFilter) != -1)
                    {
                        excludeFilter.splice( $.inArray(data, excludeFilter), 1);
                    }
                    trigger.attr('data-state', 0);
                break;
            }
        }
        else if(trigger.attr('class') == 'fdLevelInput')
        {
            trigger.blur();
            var value = level.split(' ');
            if(value.length == 1)
            {
                levelFilter['operator'] = null;
                var value = value[0].replace(/[^0-9]/g, '');
                levelFilter['level'] = parseInt(value);
            }
            else
            {
                if(value.length >= 2 && value.length <= 3)
                {
                    levelFilter['level']    = parseInt(value[1]);
                    levelFilter['operator'] = value[0];
                    if(value[2] !== undefined ) levelFilter['limit'] = value[2];
                }
            }
        }
        else if(trigger.attr('data-stat') == 'clear filters')
        {
            $('.fdButton').attr('data-state', '0');
            includeFilter.length = 0;
            excludeFilter.length = 0;
            $('.fdLevelInput').val(0);
            levelFilter['level'] = 0;
            levelFilter['operator'] = null;
            levelFilter['limit'] = 10;
        }

        this.filterInventory();
    },
    filterInventory: function()
    {
        var includeFilter = this.includeFilter;
        var excludeFilter = this.excludeFilter;
        var levelFilter   = this.levelFilter;
        var items         = this.items;
        var filterable    = [];
        var invItems      = $('.uiInventory .grid .item');

        for(var i = 0; i < invItems.length; i++)
        {
            var item = invItems.eq(i);

            if(item.data('item').slot !== undefined)
            {
                var relevance  = 0;
                var itemStats  = item.data('item').stats;
                var itemLevel  = item.data('item').level;
                var itemStatsL = Object.keys(itemStats).length;

                for(var k = 0; k < itemStatsL; k++)
                {
                    var itemStatsKey = Object.keys(itemStats)[k];

                    // Inclusion
                    if($.inArray(itemStatsKey, includeFilter) >= 0)
                    {
                        relevance = relevance + itemStats[itemStatsKey];

                        if(levelFilter['operator'] == '+')
                        {
                            if(itemLevel >= levelFilter['level'])
                            {relevance = (relevance * 10) + itemStats[itemStatsKey]}
                            else{relevance = -1}
                        }
                        else if(levelFilter['operator'] == '-')
                        {
                            if(itemLevel <= levelFilter['level'])
                            {relevance = (relevance * 10) + itemStats[itemStatsKey]}
                            else{relevance = -1}
                        }
                        else if(levelFilter['operator'] == '!')
                        {
                            if(itemLevel == levelFilter['level'])
                            {relevance = -1}
                        }
                        else if(levelFilter['operator'] == '-+')
                        {
                            relevance = -1;
                            var upLimit   = parseInt(levelFilter['level']) + parseInt(levelFilter['limit']);
                            var downLimit = parseInt(levelFilter['level']) - parseInt(levelFilter['limit']);
                            if(itemLevel > downLimit && itemLevel < upLimit)
                            {relevance = (relevance + itemStats[itemStatsKey]) + itemLevel}
                        }
                        else if(itemLevel == levelFilter['level'] && levelFilter['operator'] == null)
                        {
                            relevance = (relevance * 10) + itemLevel;
                        }
                    }
                    else if(levelFilter['level'] > 0 && levelFilter['operator'] == '+' && $.inArray(itemStatsKey, includeFilter) <= 0 || levelFilter['level'] > 0 && levelFilter['operator'] == '-' && $.inArray(itemStatsKey, includeFilter) <= 0 || levelFilter['level'] > 0 && levelFilter['operator'] == '-+' && $.inArray(itemStatsKey, includeFilter) <= 0)
                    {
                        if(relevance <= 0) relevance = -1;
                    }

                    // Exclusion
                    if($.inArray(itemStatsKey, excludeFilter) >= 0)
                    {
                        relevance--;
                    }

                    // Levelusion
                    if(excludeFilter.length == 0 && includeFilter.length == 0 && levelFilter['level'] > 0)
                    {
                        if(levelFilter['operator'] == '+')
                        {
                            if(itemLevel >= levelFilter['level'])
                            {relevance = itemLevel * 10}
                            else{relevance = -1}
                        }
                        else if(levelFilter['operator'] == '-')
                        {
                            if(itemLevel <= levelFilter['level'])
                            {relevance = itemLevel * 10}
                            else{relevance = -1}
                        }
                        else if(levelFilter['operator'] == '!')
                        {
                            if(itemLevel == levelFilter['level'])
                            {relevance = -1}
                        }
                        else if(levelFilter['operator'] == '-+')
                        {
                            relevance = -1;
                            var upLimit   = parseInt(levelFilter['level']) + parseInt(levelFilter['limit']);
                            var downLimit = parseInt(levelFilter['level']) - parseInt(levelFilter['limit']);
                            if(itemLevel > downLimit && itemLevel < upLimit)
                            {relevance = itemLevel * 10}
                        }
                        else if(itemLevel == levelFilter['level'] && levelFilter['operator'] == null)
                        {
                            relevance = itemLevel * 10;
                        }
                    }
                }

                // relevance negation
                relevance = relevance * -1;

                // setting attributes, because data are not accessible
                item.attr('data-relevance', relevance);
                item.attr('data-type', 'equip');
                item.attr('data-id', item.data('item').id);
                item.attr('data-slot', item.data('item').slot);
            }
            else if(excludeFilter.length > 0 || includeFilter.length > 0 || levelFilter['level'] > 0)
            {
                item.attr('data-type', 'material');
                item.attr('data-relevance', 999999);
                item.attr('data-id', item.data('item').id);
            }
            else
            {
                item.attr('data-relevance', 0);
            }

            if(item.attr('data-relevance') > 0)
            {
                item.addClass('fdNoRelevant');
            }
            else
            {
                item.removeClass('fdNoRelevant');
            }
        }
        this.sortInventory();
    },
    sortInventory: function()
    {

        var includeFilter = this.includeFilter;
        var excludeFilter = this.excludeFilter;
        var levelFilter   = this.levelFilter;
        var items         = $('.uiInventory .grid .item');

        if(excludeFilter.length > 0 || includeFilter.length > 0 || levelFilter['level'] > 0)
        {
            items.sort(function(a, b) {
                if(+a.dataset.relevance > +b.dataset.relevance)
                {
                    return 1;
                }
                else if(+a.dataset.relevance < +b.dataset.relevance)
                {
                    return -1;
                }
                else if(+a.dataset.relevance == +b.dataset.relevance)
                {
                    return a.dataset.id - b.dataset.id;
                }
            }).appendTo('.uiInventory>.grid');
        }
        else if(excludeFilter.length == 0 && includeFilter.length == 0 && levelFilter['level'] == 0)
        {
            if($('.uiInventory .grid .item').attr('data-id') != undefined)
            {
                items.sort(function(a, b) {
                    if((a.dataset.type == 'material') && (b.dataset.type !== 'material'))
                    {
                        return -1;
                    }
                    else if((b.dataset.type == 'material') && (a.dataset.type !== 'material'))
                    {
                        return 1;
                    }

                    if(a.dataset.slot > b.dataset.slot)
                    {
                        return -1;
                    }
                    else if(a.dataset.slot < b.dataset.slot)
                    {
                        return 1;
                    }
                    else
                    {
                        return b.dataset.id - a.dataset.id;
                    }
                }).appendTo('.uiInventory>.grid');
            }
        }
    },
    destroyItems: function()
    {
        this.toggleInventory();
    },
    onKeyDown: function(key)
    {
        if(key == 'i')
        {
            this.toggleInventory();
        }
    }
});