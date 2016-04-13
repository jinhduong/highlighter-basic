//Get XPath string of specify DOM element
function getPathTo(element) {
    if (element.id !== '' && element.id !== undefined)
        return "id('" + element.id + "')";
    if (element === document.body)
        return '/HTML/' + element.tagName;

    var ix = 0;
    var siblings = element.parentNode.childNodes;
    for (var i = 0; i < siblings.length; i++) {
        var sibling = siblings[i];
        if (sibling === element)
            return getPathTo(element.parentNode) + '/' + element.tagName + '[' + (ix + 1) + ']';
        if (sibling.nodeType === 1 && sibling.tagName === element.tagName)
            ix++;
    }
}

//Get DOM element from XPath string
function $xp(xPathString) {
    var elem = document.evaluate(
        xPathString,
        document,
        null,
        XPathResult.ORDERED_NODE_SNAPSHOT_TYPE,
        null
    );
    return elem.snapshotItem(0) || null;
}

function scrollToElement($elem) {
    $('html, body').animate({
        scrollTop: $elem.offset().top - 100
    }, 2000);
}

function shortGuid() {
    function _4str() {
        var num = Math.floor((1 + Math.random()) * 0x10000);
        return num.toString(16).substring(1);
    }
    return _4str() + _4str();
}

function downloadFile() {
    var elem = document.createElement("a");
    var file = new Blob([localStorage.hl], {
        type: 'html/text'
    });
    elem.href = URL.createObjectURL(file);
    elem.download = location.href + '.json';
    elem.click();
}
