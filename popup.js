'use strict';
var cStorage = chrome.storage.sync;
var defaultCommand = {
    makeHighlight: 'Ctrl_B',
    scrollRedPoint: 'Shift_N',
    clearData: 'Ctrl_Shift_L',
    createFile: 'Ctrl_Shift_F'
};

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

(function main() {
    cStorage.get(function (items) {
        defaultCommand = $.isEmptyObject(items) ? defaultCommand : items['userDefine'];
        console.log(defaultCommand);
        $('#customCmd').find('input').each(function (e) {
            $(this).val(defaultCommand[$(this).attr('prop')]);
        });
    });
})();

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

    $('#btn-file').click(function () {
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

    $('#customCmd').find('input').change(function (e) {
        var prop = $(this).attr('prop'),
            val = $(this).val();
        defaultCommand[prop] = val;
        cStorage.set({
            'userDefine': defaultCommand
        });
        sendRequest({
            type: 'custom_command',
            data: defaultCommand
        });
        $('#customCmd').find('.alert').show();
    });
});
