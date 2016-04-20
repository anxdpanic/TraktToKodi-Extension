var settings = null;
var t2ka_port = chrome.runtime.connect({ name: 'T2KASocket' });


function icon_element (name, data_type) {
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
      if ((data_type == 'movie') || (data_type == 'show') || (data_type == 'season') || (data_type == 'episode')) {
        action_added = false;
        open_item = grid_items[i].getElementsByClassName('t2ka_open')[0];
        play_item = grid_items[i].getElementsByClassName('t2ka_play')[0];        
        if (!open_item) {
          action_added = true;
          element_data_type = data_type;
          if ((settings.input_episode_open_season === true) && (data_type === 'episode')) {
            element_data_type = 'season';
          }
          quick_icons.getElementsByClassName('actions')[0].appendChild(icon_element('open', element_data_type));
        }
        if (!play_item) {
          if ((data_type !== 'show') && (data_type !== 'season')) {
            if (((data_type === 'movie') && (settings.input_movie_show_play === true)) || ((data_type === 'episode') && (settings.input_episode_show_play === true))) {
              action_added = true;
              quick_icons.getElementsByClassName('actions')[0].appendChild(icon_element('play', data_type));
            }
          }
        }
        if (action_added) {
          open_item = grid_items[i].getElementsByClassName('t2ka_open')[0];
          play_item = grid_items[i].getElementsByClassName('t2ka_play')[0];
          switch (data_type) {
            case 'movie':
              if (open_item) {
                open_item.addEventListener("click", open_movie);                
              }
              if (play_item) {
                if (settings.input_movie_show_play === true) {
                  play_item.addEventListener("click", play_movie); 
                }
              }
              break;
            case 'show':
              if (open_item) {            
                open_item.addEventListener("click", open_show);
              }
              break;
            case 'season':
              if (open_item) {                        
                open_item.addEventListener("click", open_season);                            
              }
              break;    
            case 'episode':
              if (open_item) {                        
                open_item.addEventListener("click", open_episode);
              }
              if (play_item) {                          
                if (settings.input_episode_show_play === true) {
                  play_item.addEventListener("click", play_episode);
                }
              }
              break;
            default:
              break;
          }
        }
      }
    }
  }
}


function get_trakt_id (grid_item, video_type) {
  switch (video_type) {
    case 'Movie':
      return grid_item.getAttribute('data-movie-id');
    case 'Show':
      return grid_item.getAttribute('data-show-id');
    case 'Episode':
      return grid_item.getAttribute('data-episode-id'); 
    default:
      return '';     
  }
}


function get_year (grid_item) {
  var value = grid_item.getElementsByClassName('year')[0];
  if (value) {
    return value.innerHTML.split('T')[0].split(' ')[0].split('-')[0];
  }
  else {
    return get_airdate(grid_item).split('T')[0].split(' ')[0].split('-')[0];
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
        season = '0';
      }
      else {
        season = season.innerHTML.split('x')[0]; 
      }
      return season;
    }
    else {
      return '';      
    }
  }
}


function get_item_title (grid_item) {
  var value = get_itemprop(grid_item, 'meta', 'name', false, 0);
  if (value !== get_series_title(grid_item)) {
    return value;
  }  
  else {
    value = get_itemprop(grid_item, 'meta', 'name', false, 1);
    if (value) {
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
    value = get_parent_title(document);
    return value;
  }
}


function get_episode (grid_item) {
  var value = get_itemprop(grid_item, 'meta', 'episodeNumber', false, 0);
  if (value) {
    return value;
  }
  else {
    return '';  
  }
}


function get_airdate (grid_item) {
  var value = get_itemprop(grid_item, 'meta', 'datePublished', false, 0);
  if (value) {
    return value.split('T')[0].split(' ')[0];
  }
  else {
    return '';  
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
      var title = get_item_title(grid_item);
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
      var title = get_item_title(grid_item);
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
      var title = get_item_title(grid_item);
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
      var ep_title = get_item_title(grid_item);
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
      var ep_title = get_item_title(grid_item);
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


var open_movie = function () {
  var ele = this;
  run(function () {
    var grid_item = ele.parentElement.parentElement.parentElement;
    var params = output_params('open_movie', settings.input_output_format, grid_item);
    if (params) {
      kodi_execute(params);
    }
  });  
};


var play_movie = function () {
  var ele = this; 
  run(function () {  
    var grid_item = ele.parentElement.parentElement.parentElement;
    var params = output_params('play_movie', settings.input_output_format, grid_item);
    if (params) {
      kodi_execute(params);
    }
  });    
};


var open_show = function () {
  var ele = this; 
  run(function () {
    var grid_item = ele.parentElement.parentElement.parentElement;
    var params = output_params('open_show', settings.input_output_format, grid_item);
    if (params) {
      kodi_execute(params);
    }
  });    
};


var open_season = function () {
  var ele = this;
  run(function () {  
    var grid_item = ele.parentElement.parentElement.parentElement;
    var params = output_params('open_season', settings.input_output_format, grid_item);
    if (params) {
      kodi_execute(params);
    }
  });    
};


var open_episode = function () {
  var ele = this;
  run(function () {  
    var grid_item = ele.parentElement.parentElement.parentElement;
    if (settings.input_episode_open_season === true) {
      var params = output_params('open_season', settings.input_output_format, grid_item);    
    }
    else {
      var params = output_params('open_episode', settings.input_output_format, grid_item);     
    }
    if (params) {
      kodi_execute(params);
    }
  });    
};


var play_episode = function () {
  var ele = this;
  run(function () {  
    var grid_item = ele.parentElement.parentElement.parentElement;
    var params = output_params('play_episode', settings.input_output_format, grid_item);
    if (params) {
      kodi_execute(params);
    }
  });    
};


function run (callback) {
  chrome.storage.sync.get({
      input_ip: '',
      input_port: '9090',
      input_addonid: '',
      input_movie_show_play: false,
      input_episode_show_play: false,
      input_episode_open_season: false,
      input_output_format: '1'      

  }, function (items) {
      settings = items;
      if (callback) {
        callback();
      }
  });
}


function kodi_execute(params) {
  t2ka_port.postMessage({ 
    action: 'execute_addon', 
    params: params
  });
}


function _i18n(data_i18n) {
    return chrome.i18n.getMessage(data_i18n);
}


run(add_quick_icons);      
