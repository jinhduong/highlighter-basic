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
        }
    };

if (tree != null) {
    thisPage = tree[place];
    thisPage && reloadPage(thisPage);
}

function saveSelectedText(selectObj) {
    var info = {
        text: selectObj.toString().trim(),
        anchor: selectObj.anchorNode,
        inData: selectObj.anchorNode.data.trim(),
        parent: $(selectObj.anchorNode.parentElement),
        sender: selectObj,
        place: place
    };

    var guid = shortGuid();
    var newHtml = processStr(info.parent.html(), info.text, info.sender.anchorOffset, guid);
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
}

window.addEventListener("keydown", function (e) {
    if (e.keyCode == 66 && e.ctrlKey)
        saveSelectedText(selection());
    if (e.keyCode == 78 && e.shiftKey)
        nextHighlight();
});

$(document).on('click', '.chrome-extension-highlight', function () {
    $(this).removeClass(store$.class.YELLOW);
    removeElement.call(null, $(this));
})

function processStr(fullString, text, from, guid) {
    var spanHtml = $('<span>').text(text).attr('guid', guid).addClass(store$.class.YELLOW)[0].outerHTML;
    var first = fullString.substr(0, from),
        second = fullString.substr(from);
    second = second.replace(text, spanHtml);
    return first + second;
}

function reloadPage(data) {
    data.forEach(function (item) {
        var $elem = $($x(item.xpath));
        $elem.html(item.html);
    });
}

function processUrl(url) {
    var index = url.indexOf('#.');
    if (index > 0)
        return url.substr(0, index);
    return url;
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

function updateStore(){
    localStorage.setItem('hl', JSON.stringify(tree));
}
