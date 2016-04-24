var settings_port = chrome.runtime.connect({ name: 'T2KASocket' });


function load_settings(callback) {
    chrome.storage.sync.get({
        input_ip: '',
        input_port: '9090',
        input_addonid: '',
        input_movie_show_play: false,
        input_episode_show_play: false,
        input_episode_open_season: false,
        input_output_format: '1'

    }, function (items) {
        if (callback) {
            callback(items);
        }
    });
}


var update_settings = function (items) {
    document.getElementById('input-ip').value = items.input_ip;
    document.getElementById('input-port').value = items.input_port;
    document.getElementById('input-addonid').value = items.input_addonid;
    document.getElementById('input-movie-show-play').checked = items.input_movie_show_play;
    document.getElementById('input-episode-show-play').checked = items.input_episode_show_play;
    document.getElementById('input-episode-open-season').checked = items.input_episode_open_season;        
    var rads = document.getElementsByClassName('settings radio');
    for (var i = 0; i < rads.length; i++) {
        if (rads[i].value === items.input_output_format) {
            rads[i].checked = true;
            break;
        }
    }    
}


function save_settings() {
    var input_ip = document.getElementById('input-ip');
    var input_port = document.getElementById('input-port');
    var input_addonid = document.getElementById('input-addonid');
    var input_movie_show_play = document.getElementById('input-movie-show-play');
    var input_episode_show_play = document.getElementById('input-episode-show-play');
    var input_episode_open_season = document.getElementById('input-episode-open-season');
    var rads = document.getElementsByClassName('settings radio');
    var input_output_format = '1'
    for (var i = 0; i < rads.length; i++) {
        if (rads[i].checked) {
            input_output_format = rads[i].value;
            break;
        }
    }
    chrome.storage.sync.set({
        input_ip: input_ip.value,
        input_port: input_port.value,
        input_addonid: input_addonid.value,
        input_movie_show_play: input_movie_show_play.checked,
        input_episode_show_play: input_episode_show_play.checked,
        input_episode_open_season: input_episode_open_season.checked,
        input_output_format: input_output_format        
    }, function () {
        settings_port.postMessage({ action: 'load_settings' });        
    });
}


function clear_settings() {
    var elements = document.getElementsByClassName('settings text');
    for (var i = 0; i < elements.length; i++) {
        if (elements[i].id == 'input-port') {
            elements[i].value = '9090';
        }
        else {
            elements[i].value = '';
        }
    }
}


function get_version () {
    var manifest = chrome.runtime.getManifest();
    return manifest.version;
}


function load_version () {
    var version_element = document.getElementById('extension_version');
    version_element.innerHTML = chrome.i18n.getMessage('version') + ': ' + get_version();    
}


document.addEventListener('DOMContentLoaded', function () {
    load_version();
    load_settings(update_settings);
});


document.getElementById('button-clear').addEventListener('click', function () {
    clear_settings();
});


document.getElementById('button-save').addEventListener('click', function () {
    save_settings();
});


var checkboxes = document.getElementsByClassName('settings checkbox');
for (var i = 0; i < checkboxes.length; i++) {
    checkboxes[i].addEventListener('click', function () {
        save_settings();
    });    
}

var radios = document.getElementsByClassName('settings radio');
for (var i = 0; i < radios.length; i++) {
    radios[i].addEventListener('change', function () {
        save_settings();
    });    
}
