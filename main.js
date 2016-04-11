var
    selection = window.getSelection,
    tree = JSON.parse(localStorage.getItem('hl')) || {},
    place = processUrl(location.href),
    config = {
        class: {
            YELLOW: 'chrome-extension-highlight'
        }
    };

if (tree != null) {
    var thisPage = tree[place];
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

    var newHtml = processStr(info.parent.html(), info.text, info.sender.anchorOffset);
    info.parent.html(newHtml);

    if (tree == null || tree[info.place] == undefined)
        tree[info.place] = [];

    tree[info.place].push({
        xpath: getPathTo(info.parent[0]),
        html: newHtml,
        text: info.text
    });

    localStorage.setItem('hl', JSON.stringify(tree));
}

window.addEventListener("keydown", function (e) {
    if (e.keyCode == 66 && e.ctrlKey)
        saveSelectedText(selection());
});

$(document).on('click', '.chrome-extension-highlight', function () {
    $(this).removeClass(config.class.YELLOW);
})

function processStr(fullString, text, from, to) {
    var spanHtml = $('<span>').text(text).addClass(config.class.YELLOW)[0].outerHTML;
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
