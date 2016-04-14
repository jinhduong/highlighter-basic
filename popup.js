//send message request to content script
$('#btnUpload').click(function (e) {
    sendRequest({
        type: 'addJson',
        jsontext: $('#jsontext').val()
    });
});

$('#github').click(function () {
    sendReq({
        type: 'link',
        href: 'https://github.com/jinhduong/highlighter-basic'
    })
});

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
