var
    selection = window.getSelection,
    tree = JSON.parse(localStorage.getItem('hl')) || {},
    place = processUrl(location.href),
    thisPage,
    store$ = {
        class: {
            YELLOW: 'chrome-extension-highlight'
        },
        d: {
            preNodeId: 0
        },
        html: {
            popup: '<div class="ce-popup"> \
                <div class="ce-content"> \
                    <h3> Add Description </h3> \
                    <input type="text" /><br> \
                    <button class="ce-add">Add</button> \
                    <button class="ce-cancel">Cancel</button> \
                </div> \
            </div>',
            popup_mini: '<div class="ce-popup-mini"> \
                <div class="ce-content"> \
                    <span></span> \
                </div> \
            </div>'
        },
        const: {
            ADD_JSON: "addJson",
            OPEN_LINK: "link"
        }
    };

if (tree != null) {
    thisPage = tree[place];
    thisPage && reloadPage(thisPage);
}

function saveSelectedText(selectObj, decs, info) {
    var guid = shortGuid();
    var newHtml = processStr(info.parent.html(), info.text, info.sender.anchorOffset, guid, decs);
    info.parent.html(newHtml);

    if (tree == null || tree[info.place] == undefined)
        tree[info.place] = [];

    tree[info.place].push({
        xpath: getPathTo(info.parent[0]),
        html: newHtml,
        text: info.text,
        guid: guid
    });
    updateStore();
    injection();
}

$('body').append(store$.html.popup);
$('body').append(store$.html.popup_mini);
$('.ce-popup').keydown(function (e) {
    if (e.keyCode == 13)
        $(this).find('button').trigger('click');
})

window.addEventListener("keydown", function (e) {
    if (e.keyCode == 66 && e.ctrlKey) {
        var selectObj = selection();
        var info = {
            text: selectObj.toString().trim(),
            anchor: selectObj.anchorNode,
            inData: selectObj.anchorNode.data.trim(),
            parent: $(selectObj.anchorNode.parentElement),
            sender: selectObj,
            place: place
        };
        var offset = $(selectObj.anchorNode.parentElement).offset();
        kDescription({
            posTop: offset.top,
            posLeft: offset.left,
            clickAdd: function (decs) {
                saveSelectedText(selectObj, decs, info);
            }
        })
    } else if (e.keyCode == 78 && e.shiftKey)
        nextHighlight();
    else if (e.keyCode == 68 && e.shiftKey)
        console.log(thisPage);
    else if (e.keyCode == 67 && e.shiftKey) {
        localStorage.setItem('hl', null);
        location.reload();
    } else if (e.keyCode == 70 && e.shiftKey) {
        downloadFile();
        chrome.extension.sendMessage({
            mess: 'hello'
        }, function (res) {
            console.log(res);
        });
    }
});

$(document).on('click', '.chrome-extension-highlight', function () {
    $(this).removeClass(store$.class.YELLOW);
    removeElement.call(null, $(this));
});

//Receving data from extension
chrome.extension.onMessage.addListener(
    function (req, sender, resCallback) {
        if (req.type == store$.const.ADD_JSON) {
            var dataList = JSON.parse(req.jsontext);
            if (dataList[place] != null && dataList[place] != undefined) {
                thisPage = (thisPage && thisPage.concat(dataList[place])) || dataList[place];
                tree[place] = thisPage;
                updateStore();
                resCallback({
                    mess: 'Update data sucessfully'
                });
                location.reload();
            }
        }
    }
)

injection();

function processStr(fullString, text, from, guid, desc) {
    var spanHtml = $('<span>').text(text).attr('guid', guid).attr('desc', desc).addClass(store$.class.YELLOW)[0].outerHTML;
    var first = fullString.substr(0, from),
        second = fullString.substr(from);
    second = second.replace(text, spanHtml);
    return first + second;
}

function reloadPage(data) {
    data.forEach(function (item) {
        var $elem = $($xp(item.xpath));
        $elem.html(item.html);
    });
}

function processUrl(url) {
    var index = url.indexOf('#.');
    return index > 0 ? url.substr(0, index) : url;
}

function nextHighlight() {
    var $node = $('.chrome-extension-highlight:eq(' + store$.d.preNodeId + ')');
    if ($node.length > 0) {
        $node.focusin();
        store$.d.preNodeId++;
        scrollToElement.call(null, $node);
    } else {
        store$.d.preNodeId = 0;
        nextHighlight();
    }
}

function removeElement(element) {
    var guid = $(element).attr('guid');
    thisPage.forEach(function (elem, index) {
        if (elem.guid == guid)
            thisPage.splice(index, 1);
    });
    updateStore();

}

function updateStore() {
    localStorage.setItem('hl', JSON.stringify(tree));
}

function kDescription(settings) {
    var config = {
        posTop: settings.posTop,
        posLeft: settings.posLeft,
        clickAdd: settings.clickAdd
    };

    $('.ce-popup').css('top', config.posTop + 20).css('left', config.posLeft + 20).show();
    $('.ce-popup').find('button').off('click');
    $('.ce-popup').find('.ce-add').click(function (e) {
        var desc = $('.ce-popup').find('input').val();
        config.clickAdd(desc);
        $('.ce-popup').hide();
        $('.ce-popup').find('input').val('');
    });
    $('.ce-popup').find('.ce-cancel').click(function(e){
        $('.ce-popup').hide();
    })
}

function injection() {
    $('.chrome-extension-highlight').mouseover(function (e) {
        var pos = $(this).offset().top + 20;
        var posLeft = $(this).offset().left + 20;
        var desc = $(this).attr('desc');
        $('.ce-popup-mini').css('top', pos).css('left', posLeft).find('span').text();
        if (desc) $('.ce-popup-mini').text(desc).show();
    });

    $('.chrome-extension-highlight').mouseleave(function (e) {
        $('.ce-popup-mini').hide();
    })
}
