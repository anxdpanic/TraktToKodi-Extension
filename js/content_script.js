var settings = null;
var t2ka_port = chrome.runtime.connect({ name: 'T2KASocket' });


t2ka_port.onMessage.addListener(function(msg) {
  switch (msg.action) {
    case 'with_settings':
      if ((msg.cb_functions) && (msg.settings)) {
        settings = msg.settings;
        var funcs = msg.cb_functions;
        if (funcs) {
          for (var i = 0; i < funcs.length; i++) {
            switch(funcs[i]) {
              case 'add_quick_icons':
                add_quick_icons();
                break;
              case 'add_action_buttons':
                add_action_buttons();
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


function action_icon (name, data_type) {
  var icon_element = document.createElement('a');
  icon_element.setAttribute('class', 't2ka_' + name);
  icon_element.setAttribute('title', _i18n(name) + ' ' + _i18n(data_type)); 
  var base_div = document.createElement('div');
  base_div.setAttribute('class', 'base');
  var icon_thick = document.createElement('div');
  icon_thick.setAttribute('class', 'trakt-icon-t2ka-' + name + '-thick');
  icon_element.appendChild(base_div);
  icon_element.appendChild(icon_thick);
  return icon_element;
}


function action_button (name, data_type) {
  var button_element = document.createElement('a');
  button_element.setAttribute('class', 'btn btn-block btn-summary btn-t2ka-' + name);
  var text_div = document.createElement('div');
  text_div.setAttribute('class', 'text');
  var main_info_div = document.createElement('div');
  main_info_div.setAttribute('class', 'main-info');
  main_info_div.appendChild(document.createTextNode(_i18n(name)));
  var under_info_div = document.createElement('div');
  under_info_div.setAttribute('class', 'under-info');
  under_info_div.appendChild(document.createTextNode(_i18n(data_type)));  
  var icon_trakt = document.createElement('div');
  icon_trakt.setAttribute('class', 'fa fa-fw trakt-icon-t2ka-' + name);
  text_div.appendChild(main_info_div);
  text_div.appendChild(under_info_div);
  button_element.appendChild(icon_trakt);
  button_element.appendChild(text_div);
  return button_element;
}


var add_quick_icons = function () {
  var quick_icons = '';
  var data_type = '';
  var action_added = false;
  var open_item = '';
  var play_item = '';  
  var element_data_type = '';

  var grid_items = document.getElementsByClassName('grid-item');
  
  for (var i = 0; i < grid_items.length; i++) {
    quick_icons = grid_items[i].getElementsByClassName('quick-icons')[0];
    if (quick_icons) {
      data_type = grid_items[i].getAttribute('data-type');
      if ((data_type === 'movie') || (data_type === 'show') || (data_type === 'season') || (data_type === 'episode')) {
        action_added = false;
        open_item = grid_items[i].getElementsByClassName('t2ka_open')[0];
        play_item = grid_items[i].getElementsByClassName('t2ka_play')[0];        
        if (!open_item) {
          action_added = true;
          element_data_type = data_type;
          if ((settings.input_episode_open_season === true) && (data_type === 'episode')) {
            element_data_type = 'season';
          }
          quick_icons.getElementsByClassName('actions')[0].appendChild(action_icon('open', element_data_type));
        }
        if (!play_item) {
          if ((data_type !== 'show') && (data_type !== 'season')) {
            if (((data_type === 'movie') && (settings.input_movie_show_play === true)) || ((data_type === 'episode') && (settings.input_episode_show_play === true))) {
              action_added = true;
              quick_icons.getElementsByClassName('actions')[0].appendChild(action_icon('play', data_type));
            }
          }
        }
        if (action_added) {
          add_listener(grid_items[i], data_type, 'icon');
        }
      }
    }
  }
}


var add_action_buttons = function () {
  var action_added = false;
  var action_buttons = document.getElementsByClassName('action-buttons')[0];
  if (action_buttons) {
    data_type = action_buttons.getElementsByClassName('btn-watch')[0]
    if (data_type) {
      data_type = data_type.getAttribute('data-type');
      if ((data_type === 'movie') || (data_type === 'show') || (data_type === 'season') || (data_type === 'episode')) {
        action_added = false;
        var open_item = action_buttons.getElementsByClassName('btn-t2ka-open')[0];
        var play_item = action_buttons.getElementsByClassName('btn-t2ka-play')[0];         
        if (!open_item) {
          action_added = true;
          element_data_type = data_type;
          if ((settings.input_episode_open_season === true) && (data_type === 'episode')) {
            element_data_type = 'season';
          }
          action_buttons.appendChild(action_button('open', element_data_type))
        }
        if (!play_item) {
          if ((data_type !== 'show') && (data_type !== 'season')) {
            if (((data_type === 'movie') && (settings.input_movie_show_play === true)) || ((data_type === 'episode') && (settings.input_episode_show_play === true))) {
              action_added = true;
              action_buttons.appendChild(action_button('play', data_type))
            }
          }
        }
        if (action_added) {
          add_listener(action_buttons, data_type, 'button');
        }
      }
    }
  }
}


function add_listener(l_elements, data_type, item_type) {
  var open_item = '';
  var play_item = '';
  if (item_type === 'icon') {
    open_item = l_elements.getElementsByClassName('t2ka_open')[0];
    play_item = l_elements.getElementsByClassName('t2ka_play')[0];
  }
  else if (item_type === 'button') {
    open_item = l_elements.getElementsByClassName('btn-t2ka-open')[0];
    play_item = l_elements.getElementsByClassName('btn-t2ka-play')[0];
  }
  switch (data_type) {
    case 'movie':
      if (open_item) {
        open_item.addEventListener("click", function () {
          kodi_execute(this, 'open_movie', item_type);
        });                
      }
      if (play_item) {
        if (settings.input_movie_show_play === true) {
          play_item.addEventListener("click", function () {
            kodi_execute(this, 'play_movie', item_type);
          });                 
        }
      }
      break;
    case 'show':
      if (open_item) {            
        open_item.addEventListener("click", function () {
          kodi_execute(this, 'open_show', item_type);
        });                
      }
      break;
    case 'season':
      if (open_item) {                        
        open_item.addEventListener("click", function () {
          kodi_execute(this, 'open_season', item_type);
        });                                            
      }
      break;    
    case 'episode':
      if (open_item) {                        
        open_item.addEventListener("click", function () {
          kodi_execute(this, 'open_episode', item_type);
        });                
      }
      if (play_item) {                          
        if (settings.input_episode_show_play === true) {
          play_item.addEventListener("click", function () {
            kodi_execute(this, 'play_episode', item_type);
          });                
        }
      }
      break;
    default:
      break;
  }
}


function get_trakt_id (grid_item, video_type) {
    var value = '';
    value = grid_item.getAttribute('data-'+ video_type.toLowerCase() +'-id');
    if (!value) {
      grid_item = grid_item.getElementsByClassName('btn-watch')[0];
      if (grid_item) {
        value = grid_item.getAttribute('data-'+ video_type.toLowerCase() +'-id');
      }
    }
    return value;
}


function get_year (grid_item) {
  var value = grid_item.getElementsByClassName('year')[0];
  if (value) {
    value = value.innerHTML;
    if (value) {
      return value.split('T')[0].split(' ')[0].split('-')[0];
    }
  }
  if (!value) {
    value = get_airdate(grid_item);
    if (value) {
      return value.split('T')[0].split(' ')[0].split('-')[0];
    }
    else {
      value = get_item_title(grid_item, false, false);
      if (value) {
        var year_regx = new RegExp(/^.*([0-9]{4}).*$/);
        value = year_regx.exec(value);
        if (value) {
          if (value.length === 2) {
            return value[1];
          }
        }
      }
      return '';
    }
  }
}


function get_season (grid_item) {
  var season = grid_item.getAttribute('data-season-number');
  if (season) {
    return season;
  }
  else {
    season = grid_item.getElementsByClassName('main-title-sxe')[0];
    if (season) {
      if (season.innerHTML.indexOf('Special') > -1) {
        return '0';
      }
      else {
        return season.innerHTML.split('x')[0]; 
      }
    }
    else {
      season = grid_item.getElementsByClassName('btn-watch')[0];      
      if (season) {
        return season.getAttribute('data-season-number');
      }
      else {
        return '';
      }
    }
  }
}


function _strip_year (title) {
  var year = new RegExp(/^(.+)\([0-9]{4}\).*$/);
  var value = year.exec(title);
  if (!value) {
    return title;
  }
  else if (value.length === 2) {
    return value[1].trim();
  }
  else {
    return title;
  }
}


function get_item_title (grid_item, strip_year, allow_match) {
  var grid_items = document.getElementsByClassName('grid-item')[0];
  if (!grid_items) {
    grid_item = document;
  }
  var value = get_itemprop(grid_item, 'meta', 'name', false, 0);
  if (value) {
    if (!allow_match) {
      if (value !== get_series_title(grid_item)) {
        if (strip_year) {
          return _strip_year(value);
        }
        return value; 
      }
      value = null;
    }
    else {
      if (strip_year) {
        return _strip_year(value);
      }
      return value;     
    }
  }  
  if (!value) {
    value = get_itemprop(grid_item, 'meta', 'name', false, 1);
    if (value) {
      if (strip_year) {
        return _strip_year(value);
      }      
      return value;
    }
    else {
      return '';
    }
  }
}


function get_series_title (grid_item) {
  var value = get_parent_title(grid_item);
  if (value) {
    return value;
  }
  else {
    var is_fake = grid_item.getAttribute('class');
    if (is_fake) {
      if (is_fake.indexOf('fake') > -1) {
        value = grid_item.getElementsByTagName('h5')[0];
        if (value) {
          return value.innerHTML.trim();
        }
      }
    }
    value = get_parent_title(document);
    if (value) {
      return value;
    }
    else {
      return '';
    }
  }
}


function get_episode (grid_item) {
  var value = get_itemprop(grid_item, 'meta', 'episodeNumber', false, 0);
  if (value) {
    return value;
  }
  else {
    value = get_itemprop(document, 'meta', 'episodeNumber', false, 0);
    if (value) {
      return value;
    }  
    else {
      return '';  
    }
  }
}


function get_airdate (grid_item) {
  var grid_items = document.getElementsByClassName('grid-item')[0];
  if (!grid_items) {
    grid_item = document;
  }  
  var value = get_itemprop(grid_item, 'meta', 'datePublished', false, 0);
  if (value) {
    return value.split('T')[0].split(' ')[0];
  }
  else {
    value = get_itemprop(grid_item, 'meta', 'startDate', false, 0);
    if (value) {
      return value.split('T')[0].split(' ')[0];
    }  
    else {    
      return '';  
    }
  }
}


function get_art (grid_item) {
  var value = get_itemprop(grid_item, 'meta', 'image', false, 0);
  if (value){
    return value;
  }
  else {
    return '';
  }
}


function get_parent_title(grid_item) {
  var value = get_itemprop(grid_item, 'span', 'partOfSeries', true, 0);
  if (value) {
    value = get_itemprop(value, 'meta', 'name', false, 0);
    if (value) {
      return value;
    }
  }
  return '';
}


function get_itemprop(grid_item, tag_name, prop_name, return_DOM, index) {
  var count = 0;
  var elements = grid_item.getElementsByTagName(tag_name);  
  for (var i = 0; i < elements.length; i++) {
    if (elements[i].getAttribute('itemprop') === prop_name) {
      if (index === count) {
        if (return_DOM === true) {
          return elements[i] 
        }
        if (elements[i].getAttribute('content')) {
          return elements[i].getAttribute('content');
        }
        else {
          return null;
        }
      }
      count++
    }
  }
  return null;
}


function output_params (action, format, grid_item) {
  var params = {};
  switch (action) {
    case 'open_movie':
      var video_type = 'Movie';
      var year = get_year(grid_item);
      var title = get_item_title(grid_item, true, false);
      var trakt_id = get_trakt_id(grid_item, video_type);
      switch (format) {
        case '1':
          params = {
            mode: 'get_sources',
            video_type: video_type,
            trakt_id: trakt_id,
            year: year,
            title: title
          };
          break; 
        case '2':
          params = {
            mode: 'open',
            video_type: video_type,
            trakt_id: trakt_id
          };
          break; 
        default: 
          break;
      }
      break;
    case 'play_movie':
      var video_type = 'Movie';     
      var year = get_year(grid_item);
      var title = get_item_title(grid_item, true, false);
      var trakt_id = get_trakt_id(grid_item, video_type);     
      switch (format) {
        case '1':
          params = {
            mode: 'autoplay',
            video_type: video_type,
            trakt_id: trakt_id,
            year: year,
            title: title
          };        
          break;
        case '2':
          params = {
            mode: 'play',
            video_type: video_type,
            trakt_id: trakt_id,
          };        
          break;          
        default: 
          break;
      }
      break;
    case 'open_show':
      var video_type = 'Show';
      var year = get_year(grid_item);
      var fanart = get_art(grid_item);
      var title = get_item_title(grid_item, true, true);
      var trakt_id = get_trakt_id(grid_item, video_type);  

      switch (format) {
        case '1':
          params = {
            mode: 'seasons',
            fanart: fanart,
            trakt_id: trakt_id,
            year: year,
            title: title
          };        
          break;
        case '2':
          params = {
            mode: 'open',
            video_type: video_type,
            trakt_id: trakt_id
          };        
          break;          
        default: 
          break;
      }
      break;
    case 'open_season':
      var video_type = 'Show';
      var season = get_season(grid_item);
      var trakt_id = get_trakt_id(grid_item, video_type); 

      switch (format) {
        case '1':
          params = {
            mode: 'episodes',
            season: season,
            trakt_id: trakt_id,
          };    
          break;
        case '2':
          params = {
            mode: 'open',
            video_type: video_type,          
            season: season,
            trakt_id: trakt_id
          };    
          break;          
        default: 
          break;
      }
      break;
    case 'open_episode':
      var video_type = 'Episode';
      var season = get_season(grid_item);
      var episode = get_episode(grid_item);
      var ep_title = get_item_title(grid_item, true, false);
      var ep_airdate = get_airdate(grid_item);
      var year = get_year(grid_item);
      var title = get_series_title(grid_item);
      var trakt_id = get_trakt_id(grid_item, video_type);  
      var trakt_id_show = get_trakt_id(grid_item, 'Show');  
      
      switch (format) {
        case '1':
          params = {
            mode: 'get_sources',
            video_type: video_type,
            season: season,
            episode: episode,
            trakt_id: trakt_id_show,
            year: year,
            ep_airdate: ep_airdate,
            title: title,
            ep_title: ep_title
          }; 
          break;
        case '2':
          params = {
            mode: 'open',
            video_type: video_type,
            season: season,
            episode: episode,
            show_id: trakt_id_show,            
            trakt_id: trakt_id
          }; 
          break;          
        default: 
          break;
      }
      break;                        
    case 'play_episode':
      var video_type = 'Episode';
      var season = get_season(grid_item);
      var episode = get_episode(grid_item);
      var ep_title = get_item_title(grid_item, true, false);
      var ep_airdate = get_airdate(grid_item);
      var year = get_year(grid_item);
      var title = get_series_title(grid_item);
      var trakt_id = get_trakt_id(grid_item, video_type);  
      var trakt_id_show = get_trakt_id(grid_item, 'Show');  
          
      switch (format) {
        case '1':
          params = {
            mode: 'autoplay',
            video_type: video_type,
            season: season,
            episode: episode,
            trakt_id: trakt_id_show,
            year: year,
            ep_airdate: ep_airdate,
            title: title,
            ep_title: ep_title
          };        
          break;
        case '2':
          params = {
            mode: 'play',
            video_type: video_type,
            season: season,
            episode: episode,
            show_id: trakt_id_show,
            trakt_id: trakt_id
          }; 
          break;             
        default: 
          break;
      }
      break;                          
    default:
      break;
  } 
  return params;
}


function _kodi_execute(params) {
  if (params) {
    t2ka_port.postMessage({ 
      action: 'execute_addon', 
      params: params
    });
  }
}


function kodi_execute (event_element, action, item_type) {
  var item = event_element.parentElement.parentElement.parentElement;
  if (item_type === 'button') {
    item = document.getElementsByTagName('html')[0];
  }
  if ((action === 'open_episode') && (settings.input_episode_open_season === true)) {
    action = 'open_season';
  } 
  _kodi_execute(output_params(action, settings.input_output_format, item));
}


function _i18n(data_i18n) {
  return chrome.i18n.getMessage(data_i18n);
}


function with_settings (callback_array) {
  t2ka_port.postMessage({ 
    action: 'with_settings', 
    cb_functions: callback_array
  });  
}


with_settings(['add_quick_icons', 'add_action_buttons']);
