addons.register({
    init: function(events)
    {
        this.includeFilter = [];
        this.excludeFilter = [];
        this.itemEquipped  = [];
        events.on('onGetItems', this.onItemsLoad.bind(this));
        events.on('onGetStats', this.onGetStats.bind(this));

        // binds to default inventory actions
        events.on('onShowInventory', this.inventoryClick.bind(this));
        events.on('onKeyDown', this.inventoryKeyDown.bind(this));
        events.on('onDestroyItems', this.inventoryDestroyItem.bind(this));
    },
    inventoryDestroyItem: function()
    {
        this.buildFilteredInventory();
        this.addQualityBorders();
        setTimeout(this.addCompareTooltips.bind(this), 1);
    },
    inventoryClick: function()
    {
        this.buildFilteredInventory();
        this.addQualityBorders();
        setTimeout(this.addCompareTooltips.bind(this), 1);
    },
    inventoryKeyDown: function(key)
    {
        if (key == 'i')
        {
            this.buildFilteredInventory();
            this.addQualityBorders();
            setTimeout(this.addCompareTooltips.bind(this), 1);
        }
    },
    addCompareTooltips: function()
    {
        var invItem  = $('.uiInventory .grid > .item');
        var invItemL = invItem.length;
        for (var i = 0; i < invItemL; i++)
        {
            invItem.eq(i).on('mouseenter', this.addCompareTooltip.bind(this, invItem.eq(i), invItem.eq(i).data('item'))).on('mouseleave', this.hideCompareTooltip.bind(this));
        }
    },
    hideCompareTooltip: function()
    {
        $('.pixelDollCompare').hide();
    },
    addCompareTooltip: function(el, item, e)
    {
        var equipped  = this.itemEquipped;
        var equippedL = equipped.length;
        var elOffset = el.offset();
        var uiOffset = $('.uiInventory').offset();
        var tooltip  = $('.pixelDollCompare');
        tooltip.show();
        tooltip.css({
            left: ~~(elOffset.left - uiOffset.left + 260),
            top:  ~~(elOffset.top - uiOffset.top)
        })
        for(var i = 0; i < equippedL; i++)
        {
            if(equipped[i].slot == item.slot)
            {
                item = equipped[i];
                stats = Object.keys(item.stats).map(function(s) {
                        return s + ': ' + item.stats[s];
                    }).join('<br />');

                tooltip.html(
                "<div class='info'>currently equipped</div>"+
                "<div class='name q"+item.quality+"'>"+item.name+"</div>"+
                "<div class='stats'>"+stats+"</div>"+
                "<div class='level'>level: "+item.level+"</div>"
                );
            }
        }
    },
    onItemsLoad: function(items)
    {
        this.uiInventory = $('.uiInventory');
        // prevent duplication
        if( ! this.uiPixelDoll)
        {
            this.uiPixelDoll = $('<div class="pixelDoll"></div>').appendTo(this.uiInventory);
            $('<div class="pixelDollCompare"></div>').appendTo(this.uiInventory);
        }
        $('.pixelDoll').empty();
        this.addTabs();
        // load items and filter only equipped
        var equipped = this.loadEquippedItems(items, this);
        // build PixelDoll
        this.buildPixelDoll(this.itemEquipped);
        this.buildFilteredInventory();
        this.addQualityBorders();
        setTimeout(this.addCompareTooltips.bind(this), 1);
        // Timeout because player data are available later
        setTimeout(function(){
            $('<div class="pdCharacterFrame"></div>').appendTo('.pixelDoll');
            $('<div class="pdHeading">'+window.player.name+'</div>').appendTo('.pixelDoll');
            $('<div class="pdLevel pdText">level '+window.player.level+'</div>').appendTo('.pixelDoll');
            $('<div class="pdClass pdText">class '+window.player.class+'</div>').appendTo('.pixelDoll');

            spriteY = ~~(window.player.cell / 8);
            spriteX = window.player.cell - (spriteY * 8);
            spriteY = -(spriteY * 32);
            spriteX = -(spriteX * 32);

            var character = $('<div class="pdCharacterPreview"></div>').appendTo('.pdCharacterFrame');
            character.css('background', 'url("../../../images/charas.png") ' + spriteX + 'px ' + spriteY + 'px');
        }, 0.1);
    },
    onGetStats: function(stats)
    {
        if($('.pixelDoll>.pdLevel').html())
        {
            var currentLevel = parseInt($('.pdLevel').html().slice(6));
            if(currentLevel != stats.level)
            {
                $('.pixelDoll>.pdLevel').html('level ' + stats.level);
            }
        }
    },
    addQualityBorders: function()
    {
        setTimeout(function(){
            var item = $('.uiInventory .grid > .item');
            var itemLength = item.length;

            for(var i = 0; i < itemLength; i++ )
            {
                var bgPosition = item.eq(i).children('.icon').css('background-position').split(' ');
                item.eq(i).attr('data-quality', item.eq(i).data('item').quality);
                item.eq(i).children('.icon').css('background-position', (parseInt(bgPosition[0],10)-4) + 'px ' + (parseInt(bgPosition[1],10)-4) + 'px');
            }
        },0.1)
    },
    addTabs: function()
    {
        // prevent duplication
        if( ! this.buttonPixelDoll && ! this.buttonStats)
        {
            this.buttonPixelDoll = $('<div class="pixelDoll-Button pdCharacter pdActive"></div>').appendTo(this.uiInventory);
            this.buttonStats     = $('<div class="pixelDoll-Button pdStats"></div>').appendTo(this.uiInventory);
            this.buttonFilters   = $('<div class="pixelDoll-Button pdFilters"></div>').appendTo(this.uiInventory);
        }
        // click on pixelDoll
        this.buttonStats.on('click', function() {
            $('.pixelDoll').hide();
            $('.filterDoll').hide();
            $(this).addClass('pdActive');
            if($('.pdCharacter').hasClass('pdActive'))
            {
                $('.pdCharacter').removeClass('pdActive');
            }
            if($('.pdFilters').hasClass('pdActive'))
            {
                $('.pdFilters').removeClass('pdActive');
            }
        });
        // click on stats button
        this.buttonPixelDoll.on('click', function() {
            $('.pixelDoll').show();
            $('.filterDoll').hide();
            $(this).addClass('pdActive');
            if($('.pdStats').hasClass('pdActive'))
            {
                $('.pdStats').removeClass('pdActive');
            }
            if($('.pdFilters').hasClass('pdActive'))
            {
                $('.pdFilters').removeClass('pdActive');
            }
        });
        // click on filters button
        $('.pdFilters').on('click', this.buildFilterBox.bind(this));
    },
    loadEquippedItems: function(items, e)
    {
        var equipped;
        $(items).each(function(){
            if(this.eq)
            {
                equipped = e.itemEquipped.push(this);
            }
        })
        return equipped;
    },
    buildPixelDoll: function(items)
    {
        // build stat slots
        var pdSlots = ['head','neck','chest','hands','twoHanded','waist','legs','feet','finger','trinket'];
        var pdSlotsLength = pdSlots.length;
        for(var i = 0; i < pdSlotsLength; i++)
        {
            $('<div class="pdItem" data-quality="0" data-slot="'+pdSlots[i]+'"></div>').appendTo(this.uiPixelDoll);
        }
        // get items
        var itemsLength = items.length;
        // bind items to slots
        for(var i = 0; i < itemsLength; i++)
        {
            var item = items[i];
            var imgX = item.sprite[0] * 64;
            var imgY = item.sprite[1] * 64;
            var eqItem = $('.pdItem[data-slot="'+item.slot+'"]');
            eqItem.attr('data-quality', item.quality)
                  .html('<div class="icon" style="background: url(\'../../../images/items.png\') -'+imgX+'px -'+imgY+'px;"></div></div>')
                  .on('mouseenter', this.showEqTooltip.bind(this, item, eqItem))
                  .on('mouseleave', this.hideEqTooltip.bind());
        }
    },
    buildFilteredInventory: function(data)
    {
        var exl   = this.excludeFilter;
        var incl  = this.includeFilter;
        var level = ($('.fdLevelInput').val()) ? parseInt($('.fdLevelInput').val()) : '0';
        if(data)
        {
            exl   = data.exclude;
            incl  = data.include;
            level = data.level;
        }
        setTimeout(function(){
            var item  = $('.uiInventory .grid > .item');
            var itemL = item.length;
            for(var i = 0; i < itemL; i++)
            {
                var rel = 0;
                var iStats  = item.eq(i).data('item').stats;
                var iLevel  = item.eq(i).data('item').level;
                var iStatsL = Object.keys(iStats).length;
                for(var s = 0; s < iStatsL; s++)
                {
                    var iStatsK = Object.keys(iStats)[s];
                    if($.inArray(iStatsK, incl) >= 0)
                    {
                        rel = rel + iStats[iStatsK];
                        // if level is set
                        if(iLevel == level)
                        {
                            rel = rel * 10;
                        }
                    }
                    if($.inArray(iStatsK, exl) >= 0)
                    {
                        rel--;
                    }
                    // level filtering
                    if(exl.length == 0 && incl.length == 0 && level > 0)
                    {
                        if(iLevel == level)
                        {
                            rel = iLevel;
                        }
                    }
                }
                item.eq(i).attr({'data-id': item.eq(i).data('item').id, 'data-slot': item.eq(i).data('item').slot})
                item.eq(i).attr('data-relevance', rel * -1);
                if(item.eq(i).attr('data-relevance') > 0)
                {
                    item.eq(i).addClass('fdNoRelevant');
                }
                if(item.eq(i).attr('data-relevance') <= 0)
                {
                    item.eq(i).removeClass('fdNoRelevant');
                }
            }
            if(exl.length > 0 || incl.length > 0 || level > 0)
            {
                item.sort(function(a, b)
                {
                    return +a.dataset.relevance - +b.dataset.relevance;
                }).appendTo('.uiInventory>.grid');
            }
            else
            {
                item.sort(function(a, b){
                    if (a.dataset.slot > b.dataset.slot)
                    {
                        return -1;
                    }
                    else if (a.dataset.slot < b.dataset.slot)
                    {
                        return 1;
                    }
                    else
                    {
                        return b.dataset.id - a.dataset.id;
                    }
                }).appendTo('.uiInventory>.grid');
            }
        }, 1);
    },
    buildFilterBox: function()
    {
        // hide Pixeldoll if is open
        $('.pixelDoll').hide();
        // set button state
        $('.pdFilters').addClass('pdActive');
        if($('.pdStats').hasClass('pdActive'))
        {
            $('.pdStats').removeClass('pdActive');
        }
        if($('.pdCharacter').hasClass('pdActive'))
        {
            $('.pdCharacter').removeClass('pdActive');
        }
        // build filters if not exist
        if( ! this.uiPixelDollFilters)
        {

            var pdStats = ['manaMax','regenMana','hpMax','regenHp','str','int','dex','magicFind','addCritChance','armor', 'clear filters'];
            var pdStatsLength = pdStats.length;

            this.uiPixelDollFilters = $('<div class="filterDoll"></div>').appendTo('.uiInventory');
            var pdFilters = $('.filterDoll').empty();
            $('<div class="fdHeading">Filter</div>').appendTo(pdFilters);
            $('<div class="fdLevelMinus fdMiniButton">-</div><input type="text" class="fdLevelInput" value="0" /><div class="fdLevelPlus fdMiniButton">+</div>').appendTo(pdFilters);
            for(var i = 0; i < pdStatsLength; i++)
            {
                $('<div class="fdButton" data-state="0" data-stat="'+pdStats[i]+'">'+pdStats[i]+'</div>').appendTo(pdFilters);
            }
        }
        else
        {
            $('.filterDoll').show();
        }
        // minus button
        $('.fdLevelMinus').click(function()
        {
            var cVal = parseInt($('.fdLevelInput').val());
            if(cVal > 0)
            {
                $('.fdLevelInput').val(cVal - 1);
                $('.fdLevelInput').trigger("change");
            }
        })
        // plus button
        $('.fdLevelPlus').click(function()
        {
            var cVal = parseInt($('.fdLevelInput').val());
            if(cVal >= 0)
            {
                $('.fdLevelInput').val(cVal + 1);
                $('.fdLevelInput').trigger("change");
            }
        })
        // input filterInv trigger
        $('.fdLevelInput').change({include: this.includeFilter, exclude: this.excludeFilter, filterInv: this.buildFilteredInventory, equipped: this.itemEquipped}, function(event) {
            $('.fdLevelInput').blur();
            event.data.level = parseInt($(this).val());
            event.data.filterInv(event.data);
        })
        // .statButton action, it's here because passing event to another function fired error
        $('.filterDoll .fdButton').unbind('click').click({include: this.includeFilter, exclude: this.excludeFilter, filterInv: this.buildFilteredInventory, equipped: this.itemEquipped}, function(event)
        {
            var includeFilter = event.data.include;
            var excludeFitler = event.data.exclude;
            event.data.level  = parseInt($('.fdLevelInput').val());
            var stat   = $(this).data('stat');
            var state  = $(this).attr('data-state');
            // clear all selected filters
            if(stat == 'clear filters')
            {
                $('.fdButton').attr('data-state', '0');
                includeFilter.length = 0;
                excludeFitler.length = 0;
                $('.fdLevelInput').val(0);
                event.data.level = 0;
            }
            else
            {
                switch(state)
                {
                case '0':
                    includeFilter.push(stat);
                    $(this).attr('data-state', 1);
                    break;
                case '1':
                    if($.inArray(stat, includeFilter) != -1)
                    {
                        includeFilter.splice( $.inArray(stat, includeFilter), 1);
                    }
                    excludeFitler.push(stat);
                    $(this).attr('data-state', 2);
                    break;
                case '2':
                    if($.inArray(stat, includeFilter) != -1)
                    {
                        includeFilter.splice( $.inArray(stat, includeFilter), 1);
                    }
                    if($.inArray(stat, excludeFitler) != -1)
                    {
                        excludeFitler.splice( $.inArray(stat, excludeFitler), 1);
                    }
                    $(this).attr('data-state', 0);
                    break;
                }
            }
            event.data.filterInv(event.data);
        });
    },
    hideEqTooltip: function()
    {
        $('.tooltip').hide();
    },
    showEqTooltip: function(item, element, e)
    {
        var elOffset = $(element).offset();
        var uiOffset = $('.uiInventory').offset();
        var tooltip  = $('.tooltip');
        tooltip.show();
        tooltip.css({
            left: ~~(elOffset.left - uiOffset.left + 64),
            top:  ~~(elOffset.top - uiOffset.top)
        })

        stats = Object.keys(item.stats).map(function(s) {
                return s + ': ' + item.stats[s];
            }).join('<br />');

        tooltip.html(
        "<div class='name q"+item.quality+"'>"+item.name+"</div>"+
        "<div class='stats'>"+stats+"</div>"+
        "<div class='level'>level: "+item.level+"</div>"
        );
    },
});