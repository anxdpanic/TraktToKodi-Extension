var settings = {
    _storage: function (action, arg1, arg2) {
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
        }
        else {
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
            input_ip: '',
            input_port: '9090',
            input_addonid: '',
            input_movie_show_play: false,
            input_episode_show_play: false,
            input_episode_open_season: false,
            input_output_format: '1'      
    },
    get: (this.defaults),
    save: function (new_settings) {
        settings._storage(
            'set',
            new_settings, 
            function () {
                settings.get = new_settings;
            }
        );
    },
    load: function (callback) {
        settings._storage(
            'get',
            settings.defaults, 
            function (items) {
                settings.get = items;
                if (callback) {
                    callback();
                }
        });
    }
};


function execute_rpc(action, params) {
    var ip = settings.get.input_ip;  
    var port = settings.get.input_port;
    var ws_url = 'ws://' + ip + ':' + port + '/jsonrpc';
    var log_lead = 'execute_rpc\r\n|url| ' + ws_url + '\r\n';
    switch (action) {
        case 'execute_addon':
            if (params) {
                var kodi_socket = new WebSocket(ws_url);
                var jrpc = executeaddon_json(params);
                kodi_socket.onopen = function (event) {
                    console.log(log_lead + '|request| ' + jrpc);
                    kodi_socket.send(jrpc);
                };
                kodi_socket.onmessage = function (event) {
                    console.log(log_lead + '|response| ' + event.data);
                    kodi_socket.close();
                };
            }
            else {
                console.log('execute_rpc |execute_addon| missing params');
            }
            break;
        default:
            console.log('execute_rpc |No action provided|');
    }
}


function executeaddon_json(params) {
    var jrpc = {
        jsonrpc: '2.0',
        id: 1,
        method: 'Addons.ExecuteAddon',
        params: {
            wait: false,
            addonid: settings.get.input_addonid,
            params: params
        }
    };
    return JSON.stringify(jrpc);
}


settings.load();


chrome.runtime.onConnect.addListener(function (port) {
    console.assert(port.name == 'T2KASocket');
    port.onMessage.addListener(function (msg) {
        switch (msg.action) {
            case 'save_settings':
                if (msg.settings) {
                    settings.save(msg.settings);
                }
                else {
                  console.log('T2KASocket |save_settings| missing |settings|');
                }                
                break;        
            case 'execute_addon':
                if (msg.params) {
                    settings.load(function () {
                        execute_rpc(msg.action, msg.params)
                    });
                }
                else {
                  console.log('T2KASocket |execute_addon| missing |params|');
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
                }
                else {
                  console.log('T2KASocket |with_settings| missing |cb_functions|');
                }
                break;            
            default:
                console.log('T2KASocket |No valid action provided|');
        }
    });
});


chrome.webNavigation.onHistoryStateUpdated.addListener(function (details) {
    if (details.url.indexOf('://trakt.tv/') > -1) {
        if ((settings.get.input_ip) && (settings.get.input_port) && (settings.get.input_addonid)) {
            chrome.tabs.executeScript(details.tabId, {
              file: '/js/content_script.js'
            });
            chrome.tabs.insertCSS(details.tabId, {
              file: '/css/trakt.css'
            });
        }
    }
});
