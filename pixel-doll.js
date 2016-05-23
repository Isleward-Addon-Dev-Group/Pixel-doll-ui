addons.register({
    init: function(events)
    {
        this.itemFilter = [];
        events.on('onGetItems', this.onItemsLoad.bind(this));

        // binds to default inventory actions
        events.on('onShowInventory', this.inventoryClick.bind(this));
        events.on('onKeyDown', this.inventoryKeyDown.bind(this));
    },
    inventoryClick: function()
    {
        this.buildFilteredInventory();
        this.addQualityBorders();
    },
    inventoryKeyDown: function(key)
    {
        if (key == 'i')
        {
            this.buildFilteredInventory();
            this.addQualityBorders();
        }
    },
    addQualityBorders: function()
    {
        setTimeout(function(){
            var item = $('.item');
            var itemLength = item.length;

            for(var i = 0; i < itemLength; i++ )
            {
                var bgPosition = item.eq(i).children('.icon').css('background-position').split(' ');
                item.eq(i).attr('data-quality', item.eq(i).data('item').quality);
                item.eq(i).children('.icon').css('background-position', (parseInt(bgPosition[0],10)-4) + 'px ' + (parseInt(bgPosition[1],10)-4) + 'px');
            }
        },1)
    },
    onItemsLoad: function(items)
    {
        this.uiInventory = $('.uiInventory');
        // prevent duplication
        if( ! this.uiPixelDoll)
        {
            this.uiPixelDoll = $('<div class="pixelDoll"></div>').appendTo(this.uiInventory);
        }
        $('.pixelDoll').empty();
        this.addTabs();
        // load items and filter only equipped
        var equipped = this.loadEquippedItems(items);
        // build PixelDoll
        this.buildPixelDoll(equipped);
        this.buildFilteredInventory();
        this.addQualityBorders();
        // Timeout because player data are available later
        setTimeout(function(){
            $('<div class="pixelDoll-character-box"></div>').appendTo('.pixelDoll');
            $('<div class="pixelDoll-heading">'+window.player.name+'</div>').appendTo('.pixelDoll');
            $('<div class="pixelDoll-level pixelDoll-text">level '+window.player.level+'</div>').appendTo('.pixelDoll');
            $('<div class="pixelDoll-class pixelDoll-text">class '+window.player.class+'</div>').appendTo('.pixelDoll');

            spriteY = ~~(window.player.cell / 8);
            spriteX = window.player.cell - (spriteY * 8);
            spriteY = -(spriteY * 32);
            spriteX = -(spriteX * 32);

            var character = $('<div class="pixelDoll-character"></div>').appendTo('.pixelDoll-character-box');
            character.css('background', 'url("../../../images/charas.png") ' + spriteX + 'px ' + spriteY + 'px');
        }, 0.1);
    },
    addTabs: function()
    {
        // prevent duplication
        if( ! this.buttonPixelDoll && ! this.buttonStats)
        {
            this.buttonPixelDoll = $('<div class="pixelDoll-charsButton pixelDoll-active"></div>').appendTo(this.uiInventory);
            this.buttonStats     = $('<div class="pixelDoll-statsButton"></div>').appendTo(this.uiInventory);
            this.buttonFilters   = $('<div class="pixelDoll-filtersButton"></div>').appendTo(this.uiInventory);
        }
        // click on pixelDoll
        this.buttonStats.on('click', function() {
            $('.pixelDoll').hide();
            $('.pixelDoll-filters').hide();
            $(this).addClass('pixelDoll-active');
            if($('.pixelDoll-charsButton').hasClass('pixelDoll-active'))
            {
                $('.pixelDoll-charsButton').removeClass('pixelDoll-active');
            }
            if($('.pixelDoll-filtersButton').hasClass('pixelDoll-active'))
            {
                $('.pixelDoll-filtersButton').removeClass('pixelDoll-active');
            }
        });
        // click on stats button
        this.buttonPixelDoll.on('click', function() {
            $('.pixelDoll').show();
            $('.pixelDoll-filters').hide();
            $(this).addClass('pixelDoll-active');
            if($('.pixelDoll-statsButton').hasClass('pixelDoll-active'))
            {
                $('.pixelDoll-statsButton').removeClass('pixelDoll-active');
            }
            if($('.pixelDoll-filtersButton').hasClass('pixelDoll-active'))
            {
                $('.pixelDoll-filtersButton').removeClass('pixelDoll-active');
            }
        });
        // click on filters button
        $('.pixelDoll-filtersButton').on('click', this.buildFilterBox.bind(this));
    },
    loadEquippedItems: function(items)
    {
        var equipped = [];
        $(items).each(function(){
            if(this.eq)
            {
                equipped.push(this);
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
            $('<div class="pixelDoll-item" data-quality="0" data-slot="'+pdSlots[i]+'"></div>').appendTo(this.uiPixelDoll);
        }
        // get items
        var itemsLength = items.length;
        // bind items to slots
        for(var i = 0; i < itemsLength; i++)
        {
            var item = items[i];
            var imgX = item.sprite[0] * 64;
            var imgY = item.sprite[1] * 64;
            var eqItem = $('.pixelDoll-item[data-slot="'+item.slot+'"]');
            eqItem.attr('data-quality', item.quality)
                  .html('<div class="pixelDoll-icon" style="background: url(\'../../../images/items.png\') -'+imgX+'px -'+imgY+'px;"></div></div>')
                  .on('mouseenter', this.showEqTooltip.bind(this, item, eqItem))
                  .on('mouseleave', this.hideEqTooltip.bind());
        }
    },
    buildFilteredInventory: function()
    {
        // get all items in inventory
        var itemFilter = this.itemFilter;
        var itemFilterLength = itemFilter.length;
        var item = $('.item');
        var itemLength = item.length;
        // TimeOut because inventory is rebuilded every onGetItems event and it must wait until all items are present
        setTimeout(function(){
            // if filter is not present
            if(itemFilterLength == 0)
            {
                for(var c = 0; c < itemLength; c++)
                {
                    if($('.item').eq(c).data('item').eq != true)
                    {
                         $('.item').eq(c).show();
                    }
                }
            }
            // if is filter present
            else
            {
                $('.item').hide();
                // loop through filters
                for(var a = 0; a < itemFilterLength; a++)
                {
                    // loop through items
                    for(var i = 0; i < itemLength; i++)
                    {
                        var itemStats = $('.item').eq(i).data('item').stats;
                        // if stat is presented on item hide it
                        if(itemFilter[a] in itemStats)
                        {
                            $('.item').eq(i).hide();
                        }
                        // wow, I don't know what this doing :D
                        else if($.inArray(itemFilter[a], itemFilter) <= 0)
                        {
                            $('.item').eq(i).show();
                        }
                    }
                }
            }
        },1);
    },
    buildFilterBox: function()
    {
        // hide Pixeldoll if is open
        $('.pixelDoll').hide();
        // set button state
        $('.pixelDoll-filtersButton').addClass('pixelDoll-active');
        if($('.pixelDoll-statsButton').hasClass('pixelDoll-active'))
        {
            $('.pixelDoll-statsButton').removeClass('pixelDoll-active');
        }
        if($('.pixelDoll-charsButton').hasClass('pixelDoll-active'))
        {
            $('.pixelDoll-charsButton').removeClass('pixelDoll-active');
        }
        // build filters if not exist
        if( ! this.uiPixelDollFilters)
        {
            var pdStats = ['manaMax','regenMana','hpMax','regenHp','str','int','dex','magicFind','addCritChance','armor', 'clear filters'];
            var pdStatsLength = pdStats.length;

            this.uiPixelDollFilters = $('<div class="pixelDoll-filters"></div>').appendTo('.uiInventory');
            var pdFilters = $('.pixelDoll-filters').empty();
            $('<div class="pixelDoll-heading">Filter</div>').appendTo(pdFilters);
            for(var i = 0; i < pdStatsLength; i++)
            {
                $('<div class="pixelDoll-statButton" data-state="off" onclick="" data-stat="'+pdStats[i]+'">'+pdStats[i]+'</div>').appendTo(pdFilters);
            }
        }
        else
        {
            $('.pixelDoll-filters').show();
        }
        // .statButton action, it's here because passing event to another function fired error
        $('.pixelDoll-filters .pixelDoll-statButton').unbind('click').click({itemFilter: this.itemFilter, inv: this.buildFilteredInventory}, function(event)
        {
            var filter = event.data.itemFilter;
            var stat   = $(this).data('stat');
            // clear all selected filters
            if(stat == 'clear filters')
            {
                $('.pixelDoll-statButton').attr('data-state', 'off');
                filter.length = 0;
            }
            // turn off filter
            else if($.inArray(stat, filter) != -1)
            {
                $(this).attr('data-state', 'off');
                filter.splice( $.inArray(stat, filter), 1);
            }
            // turn on filter
            else
            {
                $(this).attr('data-state', 'on');
                filter.push(stat);
            }
            // rebuild inventory
            event.data.inv();
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