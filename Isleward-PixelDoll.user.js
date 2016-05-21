// ==UserScript==
// @name         Isleward - Pixeldoll UI
// @namespace    Isleward.Addon
// @version      1.0
// @description  Add paper-doll ui to inventory
// @author       Silence.sys
// @match        https://isleward-test.herokuapp.com/
// @grant        GM_getResourceText
// @grant        GM_addStyle
// @resource     pixelDoll https://cdn.rawgit.com/silencesys/Pixel-doll-ui/master/pixel-doll.css?v=1.6
// ==/UserScript==

(function() {
    var css = GM_getResourceText('pixelDoll');
    GM_addStyle(css);
    var scriptElement = document.createElement( "script" );
    scriptElement.type = "text/javascript";
    scriptElement.src = "https://cdn.rawgit.com/silencesys/Pixel-doll-ui/master/pixel-doll.js?v=1.0";
    document.body.appendChild( scriptElement );
})();