addons.register({
    init: function(events)
    {
        events.on('onGetItems', this.onItemsLoad.bind(this));
    },
    onItemsLoad: function(items)
    {
        this.uiInventory = $('.uiInventory');
        this.uiPixelDoll = $('<div class="pixelDoll"></div>').appendTo(this.uiInventory);
        $('<div class="character-box"></div>').appendTo(this.uiPixelDoll);
        this.addTabs();
        // load items and filter only equipped
        var equipped = this.loadEquippedItems(items);
        // build PixelDoll
        this.buildPixelDoll(equipped);
        // Timeout because player data are available later
        setTimeout(function(){
            $('<div class="heading">'+window.player.name+'</div>').appendTo('.pixelDoll');
            $('<div class="level pd-text">level '+window.player.level+'</div>').appendTo('.pixelDoll');
            $('<div class="class pd-text">class '+window.player.class+'</div>').appendTo('.pixelDoll');

            spriteY = ~~(window.player.cell / 8);
            spriteX = window.player.cell - (spriteY * 8);
            spriteY = -(spriteY * 32);
            spriteX = -(spriteX * 32);

            var character = $('<div class="character"></div>').appendTo('.character-box');
            character.css('background', 'url("../../../images/charas.png") ' + spriteX + 'px ' + spriteY + 'px');
        }, 0.1);
    },
    addTabs: function()
    {
        var buttonPixelDoll = $('<div class="charsButton active"></div>').appendTo(this.uiInventory);
        var buttonStats     = $('<div class="statsButton"></div>').appendTo(this.uiInventory);

        buttonStats.on('click', function() {
            $('.pixelDoll').hide();
            $(this).addClass('active');
            if(buttonPixelDoll.hasClass('active'))
            {
                buttonPixelDoll.removeClass('active');
            }
        })
        buttonPixelDoll.on('click', function() {
            $('.pixelDoll').show();
            $(this).addClass('active');
            if(buttonStats.hasClass('active'))
            {
                buttonStats.removeClass('active');
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

            var eqItem = $('<div class="item" data-quality="'+item.quality+'" data-slot="'+item.slot+'"><div class="icon" style="background: url(\'../../../images/items.png\') -'+imgX+'px -'+imgY+'px;"></div></div>').appendTo(this.uiPixelDoll);
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