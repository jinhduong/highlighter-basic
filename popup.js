chrome.extension.onMessage.addListener(
    function (req, sender, resCallback) {
        console.log(sender, req);
        //chrome.pageAction.show(sender.tab.is);
    }
)


//send message request to content script
$('#btnUpload').click(function (e) {
    sendReq({
        type: 'addJson',
        jsontext: $('#jsontext').val()
    });
});


function sendReq(data) {
    chrome.tabs.query({
        active: true,
        currentWindow: true
    }, function (tabs) {
        chrome.tabs.sendMessage(tabs[0].id, data, function (response) {
            console.log(response.mess);
        });
    });
}
