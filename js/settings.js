var port = chrome.runtime.connect({ name: 'T2KASocket' });


var settings = {
    get: (null),
    load: function (callback_array) {
        port.postMessage({ 
          action: 'with_settings', 
          cb_functions: callback_array
        });      
    },
    update: function () {
        document.getElementById('input-ip').value = settings.get.input_ip;
        document.getElementById('input-port').value = settings.get.input_port;
        document.getElementById('input-addonid').value = settings.get.input_addonid;
        document.getElementById('input-movie-show-play').checked = settings.get.input_movie_show_play;
        document.getElementById('input-episode-show-play').checked = settings.get.input_episode_show_play;
        document.getElementById('input-episode-open-season').checked = settings.get.input_episode_open_season;        
        var rads = document.getElementsByClassName('settings radio');
        var _length = rads.length;
        for (var i = 0; i < _length; i++) {
            if (rads[i].value === settings.get.input_output_format) {
                rads[i].checked = true;
                break;
            }
        }    
    },
    save: function () {
        var rads = document.getElementsByClassName('settings radio');
        var input_output_format = '1';
        var _length = rads.length;
        for (var i = 0; i < _length; i++) {
            if (rads[i].checked) {
                input_output_format = rads[i].value;
                break;
            }
        }
        var new_settings = {
            input_ip: document.getElementById('input-ip').value,
            input_port: document.getElementById('input-port').value,
            input_addonid: document.getElementById('input-addonid').value,
            input_movie_show_play: document.getElementById('input-movie-show-play').checked,
            input_episode_show_play: document.getElementById('input-episode-show-play').checked,
            input_episode_open_season: document.getElementById('input-episode-open-season').checked,
            input_output_format: input_output_format        
        }
        port.postMessage({ action: 'save_settings', settings: new_settings }); 
    },
    clear: function () {
        var elements = document.getElementsByClassName('settings text');
        var _length = elements.length;
        for (var i = 0; i < _length; i++) {
            if (elements[i].id == 'input-port') {
                elements[i].value = '9090';
            }
            else {
                elements[i].value = '';
            }
        }
    }
}


function load_version () {
    var version_element = document.getElementById('extension_version');
    var inner_text = document.createTextNode(chrome.i18n.getMessage('version') + ': ' + chrome.runtime.getManifest().version);
    version_element.appendChild(inner_text);
}


document.addEventListener('DOMContentLoaded', function () {
    load_version();
    settings.load(['settings.update']);
});


document.getElementById('button-clear').addEventListener('click', function () {
    settings.clear();
});


document.getElementById('button-save').addEventListener('click', function () {
    settings.save();
});


var checkboxes = document.getElementsByClassName('settings checkbox');
var _length = checkboxes.length;
for (var i = 0; i < _length; i++) {
    checkboxes[i].addEventListener('click', function () {
        settings.save();
    });
}


var radios = document.getElementsByClassName('settings radio');
_length = radios.length;
for (i = 0; i < _length; i++) {
    radios[i].addEventListener('click', function () {
        settings.save();
    });    
}


port.onMessage.addListener(function(msg) {
  switch (msg.action) {
    case 'with_settings':
      if ((msg.cb_functions) && (msg.settings)) {
        settings.get = msg.settings;
        for (var i = 0; i < msg.cb_functions.length; i++) {
            switch(msg.cb_functions[i]) {
                case 'settings.update':
                    settings.update();
                    break;
                default:
                    break;
            }
        }
      }
      break;
    default:
      break;
  }
});
