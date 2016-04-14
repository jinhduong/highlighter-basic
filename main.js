'use strict';

var selection = window.getSelection,
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
            </div>',
            popup_stick: '<div class="ce-popup-stick"> \
                    <div> \
                    ** <span></span> \
                    </div> \
                </div>'
        },
        const: {
            ADD_JSON: "addJson",
            OPEN_LINK: "link",
            CONTEXT: 'context'
        }
    };

if (tree !== null) {
    thisPage = tree[place];
    thisPage && reloadPage(thisPage);
}

function saveSelectedText(selectObj, decs, info) {
    var guid = shortGuid(),
        newHtml = processStr(info.parent.html(), info.text, info.sender.anchorOffset, guid, decs);

    info.parent.html(newHtml);

    if (tree === null || tree[info.place] === undefined)
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

jQuery(document).ready(function($) {
    var $body = $('body');
    $body.append(store$.html.popup);
    $body.append(store$.html.popup_mini);

    $('.ce-popup').keydown(function(e) {
        if (e.keyCode === 13)
            $(this).find('button').trigger('click');
    });
});

window.addEventListener("keydown", function(e) {
    if (e.keyCode === 66 && e.ctrlKey) {
        var selectObj = selection(),
            info = {
                text: selectObj.toString().trim(),
                anchor: selectObj.anchorNode,
                inData: selectObj.anchorNode.data.trim(),
                parent: $(selectObj.anchorNode.parentElement),
                sender: selectObj,
                place: place
            },
            offset = $(selectObj.anchorNode.parentElement).offset();

        kDescription({
            posTop: offset.top + 20,
            posLeft: offset.left + 20,
            clickAdd: function(decs) {
                saveSelectedText(selectObj, decs, info);
            }
        });
    } else if (e.keyCode === 78 && e.shiftKey)
        nextHighlight();
    else if (e.keyCode === 76 && e.shiftKey && e.ctrlKey) {
        localStorage.setItem('hl', null);
        location.reload();
    } else if (e.keyCode === 70 && e.shiftKey && e.ctrlKey) {
        downloadFile();
    }
});

//When user right-click in page
document.addEventListener('mouseup', function(mousePos) {
    if (mousePos.button === 2) {
        var p = {
            left: mousePos.pageX,
            top: mousePos.pageY
        };
        console.log(p);
        var msg = {
            text: 'example',
            point: p,
            from: 'mouseup'
        };
        chrome.runtime.sendMessage(msg, function(response) {});
    }
});

$(document).on('click', '.chrome-extension-highlight,.ce-popup-stick', function() {
    if ($(this).hasClass('ce-popup-stick'))
        $(this).remove();
    else
        $(this).removeClass(store$.class.YELLOW);
    removeElement.call(null, $(this));
});

//Receving data from extension
chrome.extension.onMessage.addListener(
    function(req, sender, resCallback) {
        if (req.type == store$.const.ADD_JSON) {
            var dataList = JSON.parse(req.jsontext);
            if (dataList[place] !== null && dataList[place] !== undefined) {
                thisPage = (thisPage && thisPage.concat(dataList[place])) || dataList[place];
                tree[place] = thisPage;
                updateStore();
                resCallback({
                    mess: 'Update data sucessfully'
                });
                location.reload();
            }
        } else if (req.type == store$.const.CONTEXT) {
            var guid = shortGuid();
            kDescription({
                posLeft: req.point.left,
                posTop: req.point.top,
                clickAdd: function(desc) {
                    var $elem = $(store$.html.popup_stick).attr('guid', guid);
                    $elem.css('top', req.point.top).css('left', req.point.left);
                    $elem.find('span').text(desc);
                    $elem.show();
                    $('body').append($elem[0].outerHTML);

                    tree[place].push({
                        html: $elem[0].outerHTML,
                        guid: guid
                    });
                    updateStore();
                    injection();
                }
            });

            console.log(req.point, guid);
        }
    }
);

injection();

function processStr(fullString, text, from, guid, desc) {
    var spanHtml = $('<span>').text(text).attr('guid', guid).attr('desc', desc).addClass(store$.class.YELLOW)[0].outerHTML;
    var first = fullString.substr(0, from),
        second = fullString.substr(from);

    second = second.replace(text, spanHtml);
    return first + second;
}

function reloadPage(data) {
    data.forEach(function(item) {
        if (item.xpath) {
            var $elem = $($xp(item.xpath));
            $elem.html(item.html);
        } else {
            $('body').append(item.html);
        }
    });
}

function processUrl(url) {
    var index = url.indexOf('#.');
    return index > 0 ? url.substr(0, index) : url;
}

function nextHighlight() {
    var $node = $('.ce-popup-stick:eq(' + store$.d.preNodeId + ')');
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
    thisPage.forEach(function(elem, index) {
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

    $ce_popup = $('.ce-popup');
    $ce_popup.css('top', config.posTop).css('left', config.posLeft).show();
    $ce_popup.find('button').off('click');
    $ce_popup.find('input').focus().click();
    $ce_popup.find('.ce-add').click(function(e) {
        var desc = $ce_popup.find('input').val();
        config.clickAdd(desc);
        $ce_popup.hide();
        $ce_popup.find('input').val('');
    });
    $ce_popup.find('.ce-cancel').click(function(e) {
        $ce_popup.hide();
    });
}

function injection() {
    var $chrome_ext_highlight = $('.chrome-extension-highlight');

    $chrome_ext_highlight.mouseover(function(e) {
        var pos = $(this).offset().top + 20,
            posLeft = $(this).offset().left + 20,
            desc = $(this).attr('desc');
        
        $('.ce-popup-mini').css('top', pos).css('left', posLeft).find('span').text();
        if (desc) $('.ce-popup-mini').text(desc).show();
    });

    $chrome_ext_highlight.mouseleave(function(e) {
        $('.ce-popup-mini').hide();
    });
}