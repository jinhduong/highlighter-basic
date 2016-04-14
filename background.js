var gPos = null;

chrome.extension.onMessage.addListener(function (msg, sender, sendResponse) {
    if (msg.from == 'mouseup') {
        gPos = msg.point;
    }
})

var getClickHandler = function (info, tab) {
    var msg = {
        from: 'backgound',
        point: gPos
    }
    chrome.tabs.query({
        "active": true,
        "currentWindow": true
    }, function (tabs) {
        chrome.tabs.sendMessage(tabs[0].id, {
            type: 'context',
            point: gPos
        });
    });
}

chrome.contextMenus.create({
    "title": "Make red point",
    "type": "normal",
    "contexts": ["all"],
    "onclick": getClickHandler
});
