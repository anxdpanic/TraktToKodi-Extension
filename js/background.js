var production = true;


function log(string) {
	if (!production) {
		console.log(string);
	}
}


var settings = {
	_storage: function(action, arg1, arg2) {
		var has_sync = (chrome.storage.sync !== undefined) ? true : false;
		if (has_sync) {
			switch (action) {
				case 'set':
					chrome.storage.sync.set(arg1, arg2);
					break;
				case 'get':
					chrome.storage.sync.get(arg1, arg2);
					break;
				default:
					break;
			}
		} else {
			switch (action) {
				case 'set':
					chrome.storage.local.set(arg1, arg2);
					break;
				case 'get':
					chrome.storage.local.get(arg1, arg2);
					break;
				default:
					break;
			}
		}
	},
	defaults: {
		profiles: {
			"active": "1",
			"1": {
				iphost: "",
				port: "9090",
				addonid: "",
				format: "1"
			},
			"2": {
				iphost: "",
				port: "9090",
				addonid: "",
				format: "1"
			},
			"3": {
				iphost: "",
				port: "9090",
				addonid: "",
				format: "1"
			},
			"4": {
				iphost: "",
				port: "9090",
				addonid: "",
				format: "1"
			}
		},
		movie_show_play: false,
		episode_show_play: false,
		episode_open_season: false,
		sidebar_pagination: false,
		rpc_method: "execute_addon"
	},
	get: (this.defaults),
	save: function(new_settings, callback) {
		settings._storage(
			'set',
			new_settings,
			function() {
				settings.get = new_settings;
				if (callback) {
					callback();
				}
			}
		);
	},
	load: function(callback) {
		settings._storage(
			'get',
			null,
			function(items) {
				if (JSON.stringify(items) === JSON.stringify({})) {
					settings.save(settings.defaults, callback);
				} else {
					settings.get = items;
					if (callback) {
						callback();
					}
				}
			});
	}
};


function get_plugin_url(pparams) {
	var active = settings.get.profiles.active;
	var param_string = '';
	var connector = '?';

	for (var key in pparams) {
		if ((param_string) && (connector !== '&')) {
			connector = '&';
		}
		param_string += connector + key + '=' + encodeURIComponent(pparams[key]);
	}
	return 'plugin://' + settings.get.profiles[active].addonid + param_string;
}


var rpc = {
	can_connect: function() {
		var active = settings.get.profiles.active;
		if ((settings.get.profiles[active].iphost !== '') && (settings.get.profiles[active].port) && (settings.get.profiles[active].addonid !== '')) {
			return true;
		} else {
			return false;
		}
	},
	connection: function() {
		var active = settings.get.profiles.active;
		this.url = 'ws://' + settings.get.profiles[active].iphost + ':' + settings.get.profiles[active].port + '/jsonrpc';
		this.socket = new WebSocket(this.url);
	},
	execute: function(action, params) {
		if (rpc.can_connect() !== true) {
			log('rpc.execute(): Connection information missing/incomplete');
			return;
		}
		var conn = new rpc.connection();
		var rpc_request = null;
		var log_lead = 'rpc.execute(\'' + action + '\'):\r\n|url| ' + conn.url + '\r\n';
		switch (action) {
			case 'execute_addon':
				if (params) {
					rpc_request = rpc.stringify.execute_addon(params);

				} else {
					log('rpc.execute(\'' + action + '\'): missing |params|');
				}
				break;
			case 'activate_window':
				if (params) {
					rpc_request = rpc.stringify.activate_window(params);
				} else {
					log('rpc.execute(\'' + action + '\'): missing |params|');
				}
				break;
			case 'player_open':
				if (params) {
					rpc_request = rpc.stringify.player_open(params);
				} else {
					log('rpc.execute(\'' + action + '\'): missing |params|');
				}
				break;
			default:
				log('rpc.execute(): No |action| provided');
				break;
		}
		if (rpc_request) {
			conn.socket.onopen = function() {
				log(log_lead + '|request| ' + rpc_request);
				conn.socket.send(rpc_request);
			};
			conn.socket.onmessage = function(event) {
				log(log_lead + '|response| ' + event.data);
				conn.socket.close();
			};
			conn.socket.onerror = function(event) {
				if (event.data) {
					log(log_lead + '|ERROR| ' + event.data);
				}
			};
			conn.socket.onclose = function(event) {
				if ((!event.wasClean) && (event.reason)) {
					log(log_lead + '|ERROR ' + event.code + '| ' + event.reason);
				}
			};
		}
	},
	json: {
		execute_addon: function(params) {
			var active = settings.get.profiles.active;
			var out_json = {
				jsonrpc: '2.0',
				id: 1,
				method: 'Addons.ExecuteAddon',
				params: {
					wait: false,
					addonid: settings.get.profiles[active].addonid,
					params: ''
				}
			};
			this.encode_keys = function(eparams) {
				var oparams = {};
				for (var key in eparams) {
					oparams[key] = encodeURIComponent(eparams[key]);
				}
				return oparams;
			};
			var outparams = this.encode_keys(params);
			var _length = JSON.stringify(outparams).length + JSON.stringify(out_json).length;
			if (_length > 1024) {
				if (params['meta']) {
					if (params['meta']['banner']) {
						delete params['meta']['banner'];
						outparams = this.encode_keys(params);
					} else if (params['meta']['fanart']) {
						delete params['meta']['fanart'];
						outparams = this.encode_keys(params);
					}
				}
			}
			out_json['params']['params'] = outparams;
			return out_json;
		},
		activate_window: function(params) {
			var out_json = {
				jsonrpc: '2.0',
				id: 1,
				method: 'GUI.ActivateWindow',
				params: {
					window: 'videos',
					parameters: ['', 'return']
				}
			};

			var addon_url = get_plugin_url(params);
			var _length = addon_url.length + JSON.stringify(out_json).length;
			if (_length > 1024) {
				if (params['meta']) {
					if (params['meta']['banner']) {
						delete params['meta']['banner'];
						addon_url = get_plugin_url(params);
					} else if (params['meta']['fanart']) {
						delete params['meta']['fanart'];
						addon_url = get_plugin_url(params);
					}
				}
			}
			out_json['params']['parameters'][0] = addon_url;
			return out_json;
		},
		player_open: function(params) {
			var out_json = {
				jsonrpc: '2.0',
				id: 1,
				method: 'Player.Open',
				params: {
					item: {
						file: ''
					}
				}
			};
			var addon_url = get_plugin_url(params);
			out_json['params']['item']['file'] = addon_url;
			return out_json;
		}
	},
	stringify: {
		execute_addon: function(params) {
			return JSON.stringify(rpc.json.execute_addon(params));
		},
		activate_window: function(params) {
			return JSON.stringify(rpc.json.activate_window(params));
		},
        player_open: function(params) {
            return JSON.stringify(rpc.json.player_open(params));
        }
	}
}


settings.load();


chrome.runtime.onConnect.addListener(function(port) {
	console.assert(port.name == 'T2KASocket');
	port.onMessage.addListener(function(msg) {
		switch (msg.action) {
			case 'save_settings':
				if (msg.settings) {
					settings.save(msg.settings);
				} else {
					log('T2KASocket: |' + msg.action + '| missing |settings|');
				}
				break;
			case 'player_open':
			case 'execute_addon':
			case 'activate_window':
				if (msg.params) {
					settings.load(function() {
						rpc.execute(msg.action, msg.params);
					});
				} else {
					log('T2KASocket: |' + msg.action + '| missing |params|');
				}
				break;
			case 'with_settings':
				if (msg.cb_functions) {
					settings.load(function() {
						port.postMessage({
							action: 'with_settings',
							settings: settings.get,
							cb_functions: msg.cb_functions
						});
					});
				} else {
					log('T2KASocket: |' + msg.action + '| missing |cb_functions|');
				}
				break;
			case 'get_settings':
				port.postMessage({
					action: 'get_settings',
					settings: settings.get
				});
				return true;
				break;
			default:
				log('T2KASocket: No valid |action| provided');
				break;
		}
	});
});

if (browser.webNavigation.onHistoryStateUpdated) {
	browser.webNavigation.onHistoryStateUpdated.addListener(function(details) {
		if (details.url.indexOf('://trakt.tv/') > -1) {
			if (rpc.can_connect() === true) {
				chrome.tabs.executeScript(details.tabId, {
					file: '/js/content_script.js'
				});
				chrome.tabs.insertCSS(details.tabId, {
					file: '/css/trakt.css'
				});
			}
		}
	});
}
