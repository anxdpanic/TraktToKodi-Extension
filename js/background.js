var settings = null;


load_settings();


chrome.runtime.onConnect.addListener(function (port) {
    console.assert(port.name == 'T2KASocket');
    port.onMessage.addListener(function (msg) {
        switch (msg.action) {
            case 'save_settings':
                if (msg.settings) {
                    save_settings(msg.settings);
                }
                else {
                  console.log('T2KASocket |save_settings| missing |settings|');
                }                
                break;        
            case 'execute_addon':
                if (msg.params) {
                    load_settings(function () {
                        execute_rpc(msg.action, msg.params)
                    });
                }
                else {
                  console.log('T2KASocket |execute_addon| missing |params|');
                }
                break;
            case 'with_settings':
                if (msg.cb_functions) {
                    load_settings(function() {
                        port.postMessage({ 
                          action: 'with_settings', 
                          settings: settings,
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
        if ((settings.input_ip) && (settings.input_port) && (settings.input_addonid)) {
            chrome.tabs.executeScript(null, {
              file: '/js/content_script.js'
            });
            chrome.tabs.insertCSS(null, {
              file: '/css/trakt.css'
            });
        }
    }
});


function save_settings(new_settings) {
    if (chrome.storage.sync) {
        chrome.storage.sync.set(
            new_settings, 
            function () {
                settings = new_settings;
            }
        );    
    }
    else {
        chrome.storage.local.set(
            new_settings, 
            function () {
                settings = new_settings;
            }
        );          
    }    
}


function load_settings (callback) {
    var default_settings = {
            input_ip: '',
            input_port: '9090',
            input_addonid: '',
            input_movie_show_play: false,
            input_episode_show_play: false,
            input_episode_open_season: false,
            input_output_format: '1'      
    }   
    if (chrome.storage.sync) {
        chrome.storage.sync.get(
            default_settings, 
            function (items) {
                settings = items;
                if (callback) {
                    callback();
                }
        });
    }
    else {
        chrome.storage.local.get(
            default_settings, 
            function (items) {
                settings = items;
                if (callback) {
                    callback();
                }
        });            
    }
}


function execute_rpc(action, params) {
    var ip = settings.input_ip;  
    var port = settings.input_port;
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
            addonid: settings.input_addonid,
            params: params
        }
    };
    return JSON.stringify(jrpc);
}
