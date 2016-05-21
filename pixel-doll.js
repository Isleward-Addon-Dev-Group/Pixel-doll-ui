addons.register({
    init: function(events)
    {
        events.on('onGetItems', this.onItemsLoad.bind(this));
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
        }

        this.buttonStats.on('click', function() {
            $('.pixelDoll').hide();
            $(this).addClass('pixelDoll-active');
            if($('.pixelDoll-charsButton').hasClass('pixelDoll-active'))
            {
                $('.pixelDoll-charsButton').removeClass('pixelDoll-active');
            }
        })
        this.buttonPixelDoll.on('click', function() {
            $('.pixelDoll').show();
            $(this).addClass('pixelDoll-active');
            if($('.pixelDoll-statsButton').hasClass('pixelDoll-active'))
            {
                $('.pixelDoll-statsButton').removeClass('pixelDoll-active');
            }
        })
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
        var itemsLength = items.length;
        for(var i = 0; i < itemsLength; i++)
        {
            var item = items[i];

            var imgX = item.sprite[0] * 64;
            var imgY = item.sprite[1] * 64;

            var eqItem = $('<div class="pixelDoll-item" data-quality="'+item.quality+'" data-slot="'+item.slot+'"><div class="pixelDoll-icon" style="background: url(\'../../../images/items.png\') -'+imgX+'px -'+imgY+'px;"></div></div>').appendTo(this.uiPixelDoll);
            eqItem.on('mouseenter', this.showEqTooltip.bind(this, item, eqItem))
                  .on('mouseleave', this.hideEqTooltip.bind());
        }
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