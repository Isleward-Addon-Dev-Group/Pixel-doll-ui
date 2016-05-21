// ==UserScript==
// @name         Isleward - Pixeldoll UI
// @namespace    Isleward.Addon
// @version      1.1
// @description  Add paper-doll ui to inventory
// @author       Silence.sys
// @match        isleward-test.herokuapp.com/*
// @grant        GM_getResourceText
// @grant        GM_addStyle
// @resource     pixelDoll https://cdn.rawgit.com/silencesys/Pixel-doll-ui/master/pixel-doll.css?v=2.9
// ==/UserScript==

(function() {
    var css = GM_getResourceText('pixelDoll');
    GM_addStyle(css);
    var scriptElement = document.createElement( "script" );
    scriptElement.type = "text/javascript";
    scriptElement.src = "https://cdn.rawgit.com/silencesys/Pixel-doll-ui/master/pixel-doll.js?v=1.1";
    document.body.appendChild( scriptElement );
})();
