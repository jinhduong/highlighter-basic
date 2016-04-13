chrome.extension.onMessage.addListener(
    function (req, sender, resCallback) {
        console.log(sender, req);
    }
)


//send message request to content script
$('#btnUpload').click(function (e) {
    sendReq({
        type: 'addJson',
        jsontext: $('#jsontext').val()
    });
});

$('#github').click(function(){
    sendReq({
        type: 'link',
        href: 'https://github.com/jinhduong/highlighter-basic'
    })
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
