'use strict';

var cStorage = chrome.storage.local;
/*cStorage.get('hl',function(items){
   console.log(items); 
});*/
cStorage.get('hl', function (items) {
    var html = '';
    debugger;
    items.hl.normal.forEach(function (item) {
        var tdHtml = `<td>${item.text||'N/A'}</td><td>${item.desc||'N/A' }</td><td>${item.time||'N/A'}</td>`;
        html += `<tr>${tdHtml}</tr>`;
    });
    $('#tbList').find('tbody').html(html);
});
