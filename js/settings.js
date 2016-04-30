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
		var active_profile = settings.get.profiles.active;
		var s = '';
		var j = 0;
		var i = 0;
		var rads = document.querySelectorAll('input[name="tabs_sub1"]');
		var _length = rads.length;
		for (i = 0; i < _length; i++) {
			if (rads[i].value === active_profile) {
				rads[i].checked = true;
				break;
			}
		}
		for (i = 1; i < 5; i++) {
			s = i.toString();
			document.querySelector('input[id="iphost_' + s + '"]').value = settings.get.profiles[s].iphost;
			document.querySelector('input[id="port_' + s + '"]').value = settings.get.profiles[s].port;
			document.querySelector('input[id="addonid_' + s + '"]').value = settings.get.profiles[s].addonid;
			rads = document.querySelectorAll('input[name="formats_' + s + '"]');
			_length = rads.length;
			for (j = 0; j < _length; j++) {
				if (rads[j].value === settings.get.profiles[s].format) {
					rads[j].checked = true;
					break;
				}
			}
		}
		document.querySelector('#movie-show-play').checked = settings.get.movie_show_play;
		document.querySelector('#episode-show-play').checked = settings.get.episode_show_play;
		document.querySelector('#episode-open-season').checked = settings.get.episode_open_season;
	},
	save: function () {
		var new_settings = {
			profiles: {
				'active': document.querySelector('input[name="tabs_sub1"]:checked').value,
				'1': {
					iphost: document.querySelector('input[id="iphost_1"]').value,
					port: document.querySelector('input[id="port_1"]').value,
					addonid: document.querySelector('input[id="addonid_1"]').value,
					format: document.querySelector('input[name="formats_1"]:checked').value
				},
				'2': {
					iphost: document.querySelector('input[id="iphost_2"]').value,
					port: document.querySelector('input[id="port_2"]').value,
					addonid: document.querySelector('input[id="addonid_2"]').value,
					format: document.querySelector('input[name="formats_2"]:checked').value
				},
				'3': {
					iphost: document.querySelector('input[id="iphost_3"]').value,
					port: document.querySelector('input[id="port_3"]').value,
					addonid: document.querySelector('input[id="addonid_3"]').value,
					format: document.querySelector('input[name="formats_3"]:checked').value
				},
				'4': {
					iphost: document.querySelector('input[id="iphost_4"]').value,
					port: document.querySelector('input[id="port_4"]').value,
					addonid: document.querySelector('input[id="addonid_4"]').value,
					format: document.querySelector('input[name="formats_4"]:checked').value
				}
			},
			movie_show_play: document.querySelector('#movie-show-play').checked,
			episode_show_play: document.querySelector('#episode-show-play').checked,
			episode_open_season: document.querySelector('#episode-open-season').checked
		}
		port.postMessage({ action: 'save_settings', settings: new_settings });
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


radios = document.querySelectorAll('input[name="tabs_sub1"]');
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
