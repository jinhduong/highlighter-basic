'use strict';

function sendRequest(data) {
    chrome.tabs.query({
        active: true,
        currentWindow: true
    }, function(tabs) {
        chrome.tabs.sendMessage(tabs[0].id, data, function(response) {
            //console.log(response.mess);
        });
    });
}

jQuery(document).ready(function($) {
    //send message request to content script
    $('#btnUpload').click(function() {
        sendRequest({
            type: 'addJson',
            jsontext: $('#jsontext').val()
        });
    });

    $('#github').click(function() {
        sendRequest({
            type: 'link',
            href: 'https://github.com/jinhduong/highlighter-basic'
        });
    });
});
