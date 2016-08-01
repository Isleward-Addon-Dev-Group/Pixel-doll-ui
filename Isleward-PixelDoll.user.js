// ==UserScript==
// @name         Isleward - PixelDoll
// @namespace    Isleward.Addon
// @version      2.0.5
// @description  Add paper-doll ui to inventory
// @author       Silence.sys
// @match        *default-environment.9ymkeaciiv.eu-west-1.elasticbeanstalk.com/*
// @grant        GM_getResourceText
// @grant        GM_addStyle
// @resource     pixelDoll https://cdn.rawgit.com/Isleward-Addon-Dev-Group/Pixel-doll-ui/2.0.5/pixelDoll.css
// ==/UserScript==

(function() {
    var css = GM_getResourceText('pixelDoll');
    GM_addStyle(css);
    var scriptElement = document.createElement( "script" );
    scriptElement.type = "text/javascript";
    scriptElement.src = "https://cdn.rawgit.com/Isleward-Addon-Dev-Group/Pixel-doll-ui/2.0.5/pixelDoll.js";
    document.body.appendChild( scriptElement );
})();
