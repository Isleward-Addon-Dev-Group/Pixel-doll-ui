# Isleward Pixel Doll changelog

### 2.0.0
---
* completely rewritten javascript part
* fixed bug which caused wrong material sorting
* fixed name and character flickering
* inventory flickering which occurs when items are filtered is currently unsolvable

### 1.10.1
---
* fixed rendering issue in new version of Isleward
* fixed filtering issue with materials
* fixed compare tooltips on empty slots
* added quality borders to items

### 1.10.0
---
* Advanced filtering - use custom operators in level field
    * `- 10` displays items with level below given level
    * `+ 10` displays items with level above given level
    * `! 10` hide items with given level
    * `-+ 10 5` show items with level between range, third parameter is range and is optional (default is 10)
* fixed bug where `+` and `-` buttons increased and decreased level value by random numbers


### 1.9.4
---
* item quality colours updated with game
* stylesheets were rewritten to scss
* elements were renamed

### 1.9
---
* added include filter and improved filtering "algorithm"
* added filtering by level
* extended inventory tooltips which now compare items with your equip

### 1.8.2
---
* fixed issue that prevent filters to be applied
* fixed issue that filters sometimes failed when item was dropped or equipped

### 1.8.1
___
* fixed inventory reset when player delete or drop items

### 1.8
___

* Items in inventory can be excluded by filters
* Items in inventory have coloured border by their quality

##### Known "bugs"
* inventory flickers when you change equip or open and reopen it with filters active
* icons are moved when inventory is opened

### 1.5
___
* support for legendary items colour
* slots are visible even if character has no equip

### 1.2

___
* Added prefix classes to pixelDoll divs

### 1.0

___
* Initial version
