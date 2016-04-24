var settings = null;
var settings_port = chrome.runtime.connect({ name: 'T2KASocket' });


settings_port.onMessage.addListener(function(msg) {
  switch (msg.action) {
    case 'with_settings':
      if ((msg.cb_functions) && (msg.settings)) {
        settings = msg.settings;
        var funcs = msg.cb_functions;
        if (funcs) {
            for (var i = 0; i < funcs.length; i++) {
                switch(funcs[i]) {
                    case 'update_settings':
                        update_settings();
                        break;
                    default:
                        break;
                }
            }
        }
      }
      break;
    default:
      break;
  }
});


function with_settings (callback_array) {
    settings_port.postMessage({ 
        action: 'with_settings', 
        cb_functions: callback_array
    });  
}


var update_settings = function () {
    document.getElementById('input-ip').value = settings.input_ip;
    document.getElementById('input-port').value = settings.input_port;
    document.getElementById('input-addonid').value = settings.input_addonid;
    document.getElementById('input-movie-show-play').checked = settings.input_movie_show_play;
    document.getElementById('input-episode-show-play').checked = settings.input_episode_show_play;
    document.getElementById('input-episode-open-season').checked = settings.input_episode_open_season;        
    var rads = document.getElementsByClassName('settings radio');
    for (var i = 0; i < rads.length; i++) {
        if (rads[i].value === settings.input_output_format) {
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
    var new_settings = {
        input_ip: input_ip.value,
        input_port: input_port.value,
        input_addonid: input_addonid.value,
        input_movie_show_play: input_movie_show_play.checked,
        input_episode_show_play: input_episode_show_play.checked,
        input_episode_open_season: input_episode_open_season.checked,
        input_output_format: input_output_format        
    }
    settings_port.postMessage({ action: 'save_settings', settings: new_settings });        
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
    with_settings(['update_settings']);
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
    radios[i].addEventListener('click', function () {
        save_settings();
    });    
}
