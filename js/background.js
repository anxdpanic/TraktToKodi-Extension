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
			'active': '1',
			'1': {
				iphost: '',
				port: '9090',
				addonid: '',
				format: '1'
			},
			'2': {
				iphost: '',
				port: '9090',
				addonid: '',
				format: '1'
			},
			'3': {
				iphost: '',
				port: '9090',
				addonid: '',
				format: '1'
			},
			'4': {
				iphost: '',
				port: '9090',
				addonid: '',
				format: '1'
			}
		},
		movie_show_play: false,
		episode_show_play: false,
		episode_open_season: false,
		sidebar_pagination: false,
		rpc_method: 'activate_window'
	},
	get: (this.defaults),
	save: function(new_settings) {
		settings._storage(
			'set',
			new_settings,
			function() {
				settings.get = new_settings;
			}
		);
	},
	load: function(callback) {
		settings._storage(
			'get',
			settings.defaults,
			function(items) {
				settings.get = items;
				if (callback) {
					callback();
				}
			});
	}
};


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
			console.log('rpc.execute(): Connection information missing/incomplete');
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
					console.log('rpc.execute(\'' + action + '\'): missing |params|');
				}
				break;
			case 'activate_window':
				if (params) {
					rpc_request = rpc.stringify.activate_window(params);
				} else {
					console.log('rpc.execute(\'' + action + '\'): missing |params|');
				}
				break;
			default:
				console.log('rpc.execute(): No |action| provided');
				break;
		}
		if (rpc_request) {
			conn.socket.onopen = function(event) {
				console.log(log_lead + '|request| ' + rpc_request);
				conn.socket.send(rpc_request);
			};
			conn.socket.onmessage = function(event) {
				console.log(log_lead + '|response| ' + event.data);
				conn.socket.close();
			};
		}
	},
	json: {
		execute_addon: function(params) {
			var active = settings.get.profiles.active;
			return {
				jsonrpc: '2.0',
				id: 1,
				method: 'Addons.ExecuteAddon',
				params: {
					wait: false,
					addonid: settings.get.profiles[active].addonid,
					params: params
				}
			};
		},
		activate_window: function(params) {
			var active = settings.get.profiles.active;
			var param_string = '';
			var connector = '?';
			for (var key in params) {
				if ((param_string) && (connector !== '&')) {
					connector = '&';
				}
				param_string += connector + key + '=' + params[key];
			}
			var addon_path = 'plugin://' + settings.get.profiles[active].addonid + encodeURI(param_string);
			return {
				jsonrpc: '2.0',
				id: 1,
				method: 'GUI.ActivateWindow',
				params: {
					window: 'videos',
					parameters: [addon_path, 'return']
				}
			};
		}
	},
	stringify: {
		execute_addon: function(params) {
			return JSON.stringify(rpc.json.execute_addon(params));
		},
		activate_window: function(params) {
			return JSON.stringify(rpc.json.activate_window(params));
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
					console.log('T2KASocket: |' + msg.action + '| missing |settings|');
				}
				break;
			case 'execute_addon':
			case 'activate_window':
				if (msg.params) {
					settings.load(function() {
						rpc.execute(msg.action, msg.params);
					});
				} else {
					console.log('T2KASocket: |' + msg.action + '| missing |params|');
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
					console.log('T2KASocket: |' + msg.action + '| missing |cb_functions|');
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
				console.log('T2KASocket: No valid |action| provided');
				break;
		}
	});
});


chrome.webNavigation.onHistoryStateUpdated.addListener(function(details) {
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
