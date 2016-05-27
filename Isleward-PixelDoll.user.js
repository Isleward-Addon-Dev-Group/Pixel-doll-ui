// ==UserScript==
// @name         Isleward - Pixeldoll UI
// @namespace    Isleward.Addon
// @version      1.9.0
// @description  Add paper-doll ui to inventory
// @author       Silence.sys
// @match        isleward-test.herokuapp.com/*
// @grant        GM_getResourceText
// @grant        GM_addStyle
// @resource     pixelDoll https://cdn.rawgit.com/Isleward-Addon-Dev-Group/Pixel-doll-ui/1.9.0/pixel-doll.css
// ==/UserScript==

(function() {
    var css = GM_getResourceText('pixelDoll');
    GM_addStyle(css);
    var scriptElement = document.createElement( "script" );
    scriptElement.type = "text/javascript";
    scriptElement.src = "https://cdn.rawgit.com/Isleward-Addon-Dev-Group/Pixel-doll-ui/1.9.0/pixel-doll.js";
    document.body.appendChild( scriptElement );
})();
