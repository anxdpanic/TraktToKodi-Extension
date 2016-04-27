function i18n(data_i18n) {
    return chrome.i18n.getMessage(data_i18n);
}


function i18n_these(elements) {
    var inner_text = null;
    var _length = elements.length;
    for (i = 0; i < _length; i++) {
        inner_text = document.createTextNode(i18n(elements[i].getAttribute('data-i18n')));
        elements[i].appendChild(inner_text);
    }
}


document.addEventListener('DOMContentLoaded', function () {
    i18n_these(document.getElementsByClassName('settings header'));
    i18n_these(document.getElementsByTagName('label'));
    i18n_these(document.getElementsByTagName('button'));
});
