function i18n() {
    var elements = document.getElementsByClassName('settings header');
    for (var i = 0; i < elements.length; i++) {
        elements[i].innerHTML = _i18n(elements[i].getAttribute('data-i18n'));
    }
    elements = document.getElementsByTagName('label');
    for (i = 0; i < elements.length; i++) {
        elements[i].innerHTML = _i18n(elements[i].getAttribute('data-i18n'));
    }
    elements = document.getElementsByTagName('button');
    for (i = 0; i < elements.length; i++) {
        elements[i].innerHTML = _i18n(elements[i].getAttribute('data-i18n'));
    }  
}


function _i18n(data_i18n) {
    return chrome.i18n.getMessage(data_i18n);
}


document.addEventListener('DOMContentLoaded', function () {
    i18n();
});
