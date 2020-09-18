/**
 * ImageAssistant
 * Project Home: http://www.pullywood.com/ImageAssistant/
 * Author: 睡虫子(Joey)
 * Copyright (C) 2013-2020 普利坞(Pullywood.com)
**/
"use strict";

if (typeof _o_com_key == "undefined") {
    window._o_com_key = "_o_dbjbempljhcmhlfpfacalomonjpalpko";
}

if (document.querySelector("input#" + window._o_com_key) == null && typeof chrome != "undefined" && typeof chrome.runtime != "undefined" && typeof chrome.runtime.id != "undefined" && typeof chrome.runtime.getURL != "undefined") {
    let _o_timer = null;
    _o_timer = setInterval((function() {
        let _w_aHead = document.getElementsByTagName("head").item(0);
        if (typeof _w_aHead == "object") {
            clearInterval(_o_timer);
            let _w_aScript = document.createElement("script");
            _w_aScript.type = "text/javascript";
            _w_aScript.src = chrome.runtime.getURL("/scripts/inspector.js");
            _w_aHead.appendChild(_w_aScript);
            let _w_aInput = document.createElement("input");
            _w_aInput.type = "hidden";
            _w_aInput.id = _o_com_key;
            _w_aHead.appendChild(_w_aInput);
        }
    }), 1e3);
} else if (!window._o_content_and_xhr_sniffer) {
    window._o_content_and_xhr_sniffer = function() {
        let _o_content_src_list = [];
        let _o_url_container = {};
        let _o_uri_regexp = /(['"\s\n\r])[^'"\s\n\r]*?\.(apng|bmp|gif|ico|cur|jpg|jpeg|jfif|pjpeg|pjp|png|svg|tif|tiff|webp)(\?[^'"\s\n\r]*)?(?=\1)/gi;
        let _o_items_fun = function(_o_items) {
            _o_items && _o_items.forEach((function(item) {
                let _w_src = item.replace(/[\\'"\s\n\r]+/gi, "");
                if (!_o_url_container[_w_src]) {
                    _o_url_container[_w_src] = true;
                    _o_content_src_list.push(_w_src);
                }
            }));
        };
        XMLHttpRequest.prototype.realSend = XMLHttpRequest.prototype.send;
        XMLHttpRequest.prototype.send = function(value) {
            this.addEventListener("load", (function() {
                if (!this.responseType || this.responseType === "text") {
                    let _o_items = this.responseText.match(_o_uri_regexp);
                    _o_items_fun(_o_items);
                }
            }), false);
            this.realSend(value);
        };
        const _o_fetch = window.fetch;
        window.fetch = function() {
            return new Promise((resolve, reject) => {
                _o_fetch.apply(this, arguments).then((function(response) {
                    response.clone && response.clone().text().then((function(_o_response_text) {
                        let _o_items = _o_response_text.match(_o_uri_regexp);
                        _o_items_fun(_o_items);
                    }));
                    resolve(response);
                })).catch((function(response) {
                    reject(response);
                }));
            });
        };
        let _o_items = document.documentElement.innerHTML.match(_o_uri_regexp);
        _o_items_fun(_o_items);
        setInterval((function() {
            let _w_aInput = document.getElementById(_o_com_key);
            if (_w_aInput && _w_aInput.value.length > 0 && _w_aInput.value == _o_com_key && _o_content_src_list.length > 0) {
                _w_aInput.value = JSON.stringify(_o_content_src_list);
                _o_content_src_list = [];
            }
        }), 512);
        return {
            _o_getLeftUrl: function() {
                return _o_content_src_list.length;
            }
        };
    }();
}