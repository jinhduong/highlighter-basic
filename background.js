'use strict';
var gPos = null;
chrome.extension.onMessage.addListener(function (msg, sender, sendResponse) {
    if (msg.from === 'mouseup') {
        gPos = msg.point;
    }
});

var getClickHandler = function (info, tab) {
    sendRequest({
        type: 'context',
        point: gPos
    });
};

var createSquare = function (info,tab){
    sendRequest({
        type: 'square',
        point: gPos
    });
}

function sendRequest(data) {
    chrome.tabs.query({
        active: true,
        currentWindow: true
    }, function (tabs) {
        chrome.tabs.sendMessage(tabs[0].id, data, function (response) {
            //console.log(response.mess);
        });
    });
}

chrome.contextMenus.create({
    'title': 'Make red point',
    'type': 'normal',
    'contexts': ['all'],
    'onclick': getClickHandler
});

chrome.contextMenus.create({
    'title': 'Create square',
    'type': 'normal',
    'contexts': ['all'],
    'onclick': createSquare
});