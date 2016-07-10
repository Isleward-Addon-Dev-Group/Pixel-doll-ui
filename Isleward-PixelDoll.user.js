// ==UserScript==
// @name         Isleward - Pixeldoll UI
// @namespace    Isleward.Addon
// @version      2.0.1
// @description  Add paper-doll ui to inventory
// @author       Silence.sys
// @match        play.isleward.com/*
// @grant        GM_getResourceText
// @grant        GM_addStyle
// @resource     pixelDoll https://cdn.rawgit.com/Isleward-Addon-Dev-Group/Pixel-doll-ui/2.0.1/pixelDoll.css
// ==/UserScript==

(function() {
    var css = GM_getResourceText('pixelDoll');
    GM_addStyle(css);
    var scriptElement = document.createElement( "script" );
    scriptElement.type = "text/javascript";
    scriptElement.src = "https://cdn.rawgit.com/Isleward-Addon-Dev-Group/Pixel-doll-ui/2.0.1/pixelDoll.js";
    document.body.appendChild( scriptElement );
})();
