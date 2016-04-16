'use strict';

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

jQuery(document).ready(function ($) {
    $('#form-import').submit(function (e) {
        var el = $('#jsontext'),
            json_val = el.val();

        if (json_val.length > 0) {
            try {
                
                JSON.parse(json_val);
                
                // Send message request to content script
                sendRequest({
                    type: 'addJson',
                    jsontext: json_val
                });

                // Reset form
                el.val('').focus();
            } catch (e) {
                // console.error(e);
                return;
            }
        }

        // Prevent reload page
        e.preventDefault();
    });

    $('#github').click(function () {
        sendRequest({
            type: 'link',
            href: 'https://github.com/jinhduong/highlighter-basic'
        });
    });
});
