//Get XPath string of specify DOM element
function getPathTo(element) {
    if (element.id !== '' && element.id !== undefined)
        return "id('" + element.id + "')";
    if (element === document.body)
        return element.tagName;

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
function $x(xPathString) {
    var elem = document.evaluate(
        xPathString,
        document,
        null,
        XPathResult.ORDERED_NODE_SNAPSHOT_TYPE,
        null
    );
    return elem.snapshotItem(0) || null;
}
