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

function sendJSON(data) {
    if (data.length > 0) {
        try {

            JSON.parse(data);

            // Send message request to content script
            sendRequest({
                type: 'addJson',
                jsontext: data
            });

        } catch (e) {
            return;
        }
    }
}

jQuery(document).ready(function ($) {
    $('#form-import').submit(function (e) {
        var el = $('#jsontext'),
            json_val = el.val();
        sendJSON(json_val);
        el.val('').focus();
        e.preventDefault();
    });

    $('#btn-file').click(function() {
        $('#files').click();
    });

    $('#files').change(function (e) {
        var file = e.target.files[0],
            reader = new FileReader();

        reader.onload = function (event) {
            sendJSON(event.target.result);
        };

        reader.readAsText(file);
    });
});
