var production = true;


var port = chrome.runtime.connect({
	name: 'T2KASocket'
});


function Capitalize(string) {
	return string.charAt(0).toUpperCase() + string.slice(1);
}


var settings = {
	get: (null),
	load: function(callback_array) {
		port.postMessage({
			action: 'with_settings',
			cb_functions: callback_array
		});
	}
}


function CheckType(data_type) {
	this.valid = function() {
		if ((data_type === 'movie') || (data_type === 'show') || (data_type === 'season') || (data_type === 'episode')) {
			return true;
		} else {
			return false;
		}
	};
	this.can_play = function() {
		if ((data_type !== 'show') && (data_type !== 'season') && (this.valid() === true)) {
			return true;
		} else {
			return false;
		}
	};
	this.show_play = function() {
		if (this.can_play() === true) {
			if (((data_type === 'movie') && (settings.get.movie_show_play === true)) || ((data_type === 'episode') && (settings.get.episode_show_play === true))) {
				return true;
			} else {
				return false;
			}
		} else {
			return false;
		}
	};
	this.open_to_season = function() {
		if ((settings.get.episode_open_season === true) && (data_type === 'episode')) {
			return true;
		} else {
			return false;
		}
	};
}


var action_elements = {
	add_to_page: function(root_item, item, data_type, action_type) {
		var check_type = new CheckType(data_type);
		if (check_type.valid() === true) {
			var action_added = false;
			if (action_type === 'button') {
				var open_item = item.getElementsByClassName('btn-t2ka-open')[0];
				var play_item = item.getElementsByClassName('btn-t2ka-play')[0];
			} else {
				var open_item = item.getElementsByClassName('t2ka_open')[0];
				var play_item = item.getElementsByClassName('t2ka_play')[0];
			}
			if (!open_item) {
				action_added = true;
				var element_data_type = data_type;
				if (check_type.open_to_season()) {
					element_data_type = 'season';
				}
				if (action_type === 'button') {
					root_item.appendChild(action_elements.button('open', element_data_type))
				} else {
					root_item.getElementsByClassName('actions')[0].appendChild(action_elements.icon('open', element_data_type));
				}
			}
			if (!play_item) {
				if (check_type.show_play() === true) {
					action_added = true;
					if (action_type === 'button') {
						root_item.appendChild(action_elements.button('play', data_type))
					} else {
						root_item.getElementsByClassName('actions')[0].appendChild(action_elements.icon('play', data_type));
					}
				}
			}
			if (action_added) {
				action_elements.add_listener(item, data_type, action_type);
			}
		}
	},
	icon: function(name, data_type) {
		var icon_element = document.createElement('a');
		icon_element.setAttribute('class', 't2ka_' + name);
		icon_element.setAttribute('title', i18n(name) + ' ' + i18n(data_type));
		var base_div = document.createElement('div');
		base_div.setAttribute('class', 'base');
		var icon_thick = document.createElement('div');
		icon_thick.setAttribute('class', 'trakt-icon-t2ka-' + name + '-thick');
		icon_element.appendChild(base_div);
		icon_element.appendChild(icon_thick);
		return icon_element;
	},
	button: function(name, data_type) {
		var button_element = document.createElement('a');
		button_element.setAttribute('class', 'btn btn-block btn-summary btn-t2ka-' + name);
		var text_div = document.createElement('div');
		text_div.setAttribute('class', 'text');
		var main_info_div = document.createElement('div');
		main_info_div.setAttribute('class', 'main-info');
		main_info_div.appendChild(document.createTextNode(i18n(name) + ' ' + i18n(data_type)));
		var under_info_div = document.createElement('div');
		under_info_div.setAttribute('class', 'under-info');
		var icon_trakt = document.createElement('div');
		icon_trakt.setAttribute('class', 'fa fa-fw trakt-icon-t2ka-' + name);
		var loading_div = document.createElement('div');
		loading_div.setAttribute('class', 'loading');
		var icon_div = document.createElement('div');
		icon_div.setAttribute('class', 'icon');
		var spin_div = document.createElement('div');
		spin_div.setAttribute('class', 'fa fa-refresh fa-spin');
		icon_div.appendChild(spin_div);
		loading_div.appendChild(icon_div);
		text_div.appendChild(main_info_div);
		text_div.appendChild(under_info_div);
		button_element.appendChild(icon_trakt);
		button_element.appendChild(text_div);
		button_element.appendChild(loading_div);
		return button_element;
	},
	add_listener: function(items, data_type, action_input) {
		var open_item = '';
		var play_item = '';
		var check_type = new CheckType(data_type);
		if (action_input === 'icon') {
			open_item = items.getElementsByClassName('t2ka_open')[0];
			play_item = items.getElementsByClassName('t2ka_play')[0];
		} else if (action_input === 'button') {
			open_item = items.getElementsByClassName('btn-t2ka-open')[0];
			play_item = items.getElementsByClassName('btn-t2ka-play')[0];
		}
		switch (data_type) {
			case 'movie':
				if (open_item) {
					open_item.addEventListener("click", function() {
						execute_action(this, 'open_movie', action_input);
					});
				}
				if (play_item) {
					if (check_type.show_play() === true) {
						play_item.addEventListener("click", function() {
							execute_action(this, 'play_movie', action_input);
						});
					}
				}
				break;
			case 'show':
				if (open_item) {
					open_item.addEventListener("click", function() {
						execute_action(this, 'open_show', action_input);
					});
				}
				break;
			case 'season':
				if (open_item) {
					open_item.addEventListener("click", function() {
						execute_action(this, 'open_season', action_input);
					});
				}
				break;
			case 'episode':
				if (open_item) {
					open_item.addEventListener("click", function() {
						execute_action(this, 'open_episode', action_input);
					});
				}
				if (play_item) {
					if (check_type.show_play() === true) {
						play_item.addEventListener("click", function() {
							execute_action(this, 'play_episode', action_input);
						});
					}
				}
				break;
			default:
				break;
		}
	}
}


var add_items = {
	icons: function() {
		var quick_icons = '';
		var data_type = '';
		var grid_items = document.getElementsByClassName('grid-item');
		var _length = grid_items.length;
		for (var i = 0; i < _length; i++) {
			if (grid_items[i].getElementsByClassName('grid-item')[0]) {
				continue;
			}
			data_type = '';
			quick_icons = grid_items[i].getElementsByClassName('quick-icons')[0];
			if (quick_icons) {
				data_type = grid_items[i].getAttribute('data-type');
				if (!data_type) {
					continue;
				}
				action_elements.add_to_page(quick_icons, grid_items[i], data_type, 'icon');
			}
		}
	},
	buttons: function() {
		var action_buttons = document.getElementsByClassName('action-buttons')[0];
		if (action_buttons) {
			data_type = action_buttons.getElementsByClassName('btn-watch')[0]
			if (data_type) {
				data_type = data_type.getAttribute('data-type');
				if (!data_type) {
					return;
				}
				action_elements.add_to_page(action_buttons, action_buttons, data_type, 'button');
			}
		}
	},
	date_nav: function() {
		if ((document.getElementById('date-nav-2')) || (!settings.get.sidebar_pagination)) {
			return;
		}
		var nav_item = document.getElementById('date-nav');
		if (nav_item) {
			var sibling_item = document.getElementById('huckster-sidenav');
			var clone_item = nav_item.cloneNode(true);
			clone_item.setAttribute('id', 'date-nav-2')
			if (sibling_item) {
				sibling_item.parentElement.insertBefore(clone_item, sibling_item);
			}
		}
	}
}


function loading(item, toggle) {
	if (!item) {
		return;
	}
	var loaditem = item.querySelector('.loading');
	if (loaditem) {
		if ((loaditem.style.display !== 'block') && (toggle)) {
			loaditem.style.display = 'block';
			setTimeout(function() {
				loading(item);
			}, 5000);
		} else {
			loaditem.style.display = 'none';
		}
	}
}


function TraktDOMScraper(item, video_type) {
	this.id = function(_video_type) {
		if (!_video_type) {
			_video_type = video_type;
		}
		var value = '';
		value = item.getAttribute('data-' + _video_type.toLowerCase() + '-id');
		if (!value) {
			value = item.getElementsByClassName('btn-watch')[0];
			if (value) {
				value = value.getAttribute('data-' + _video_type.toLowerCase() + '-id');
			} else {
				value = '';
			}
		}
		return value;
	};
	this.season = function() {
		var season = item.getAttribute('data-season-number');
		if (season) {
			return season;
		} else {
			season = item.getElementsByClassName('main-title-sxe')[0];
			if (season) {
				if (season.innerHTML.indexOf('Special') > -1) {
					return '0';
				} else {
					return season.innerHTML.split('x')[0];
				}
			} else {
				season = item.getElementsByClassName('btn-watch')[0];
				if (season) {
					return season.getAttribute('data-season-number');
				} else {
					return '';
				}
			}
		}
	};
	this.episode = function() {
		var value = this._itemprop(item, 'meta', 'episodeNumber', false, 0);
		if (value) {
			return value;
		} else {
			value = this._itemprop(document, 'meta', 'episodeNumber', false, 0);
			if (value) {
				return value;
			} else {
				return '';
			}
		}
	};
	this._itemprop = function(_item, tag_name, prop_name, return_DOM, index) {
		var count = 0;
		var elements = _item.getElementsByTagName(tag_name);
		var _length = elements.length;
		for (var i = 0; i < _length; i++) {
			if (elements[i].getAttribute('itemprop') === prop_name) {
				if (index === count) {
					if (return_DOM === true) {
						return elements[i];
					}
					if (elements[i].getAttribute('content')) {
						return elements[i].getAttribute('content');
					} else {
						return null;
					}
				}
				count++
			}
		}
		return null;
	};
}


function Trakt() {
	this._stages = JSON.parse(atob('ew0KCSJwcm9kdWN0aW9uIjogew0KCQkidXJsIjogImh0dHBzOi8vYXBpLXYybGF1bmNoLnRyYWt0LnR2IiwNCgkJInZlcnNpb24iOiAiMiIsDQoJCSJrZXlzIjogew0KCQkJImNsaWVudF9pZCI6ICIyMWFjYTc0MzUwMmNlZWE3MDVlMTY1YTk3OGMyMWZmMDZmYTM3NWRkNTM2Mzg2ZjhjNTZmMTcxMTczMDQ1N2RkIiwNCgkJCSJjbGllbnRfc2VjcmV0IjogIjMxMTljNjk2MzI5NTVhZDNkZWM4NDFjZmJkYzEwMjkyYjZkZDdiMDlmZjU5Y2E3NzMzYjc2NDg1YmE2Zjg4YzQiDQoJCX0NCgl9LA0KCSJzdGFnaW5nIjogew0KCQkidXJsIjogImh0dHBzOi8vYXBpLXN0YWdpbmcudHJha3QudHYiLA0KCQkidmVyc2lvbiI6ICIyIiwJCQ0KCQkia2V5cyI6IHsNCgkJCSJjbGllbnRfaWQiOiAiZDBjZTc4MzdjZGQzZTQzMjYzMmQ5N2YyNGQ3ZWRlNTIyNjdlYzBlODA3NTZmMjQwMjM0ZDZjOTgwNzY3YzQxYyIsDQoJCQkiY2xpZW50X3NlY3JldCI6ICI2NTgyMWM5MTBmNGYzNGQ3ZDIyYjMzMDYwNDkxMzc4ZGIwNzgxMmFiNmU5Mzc2MDI4YjQ0NzFkY2VhZTJiMGMyIg0KCQl9DQoJfQ0KfQ=='));
	this.stage = function() {
		if (production === true) {
			return this._stages['production'];
		} else {
			return this._stages['staging'];
		}
	};
	this.request = function(request, params, callback) {
		var extended = '?extended=full';
		if (params['images'] === true) {
			extended += ',images';
		}
		var data_type = params['type'];
		var data_id = params['id'];
		switch (request) {
			case 'summary':
				switch (data_type) {
					case 'movie':
						var movie_url = '/movies/' + params['movie_id'] + extended;
						this.GET(movie_url, callback, params);
						break;
					case 'show':
					case 'season':
						var show_url = '/shows/' + params['show_id'] + extended;
						this.GET(show_url, callback, params);
						break;
					case 'episode':
						var show_url = '/shows/' + params['show_id'] + extended;
						this.GET(show_url, function() {
							var ep_url = '/shows/' + params['show_id'] + '/seasons/' + params['season'] + '/episodes/' + params['episode'] + extended;
							var trakt = new Trakt();
							trakt.GET(ep_url, callback, params);
						}, params);
						break;
					default:
						break;
				}
				break;
			default:
				break;
		}
	};
	this.headers = new Headers({
		'Content-Type': 'application/json',
		'trakt-api-key': this.stage()['keys']['client_id'],
		'trakt-api-version': this.stage()['version']
	});
	this.GET = function(url, callback, params) {
		var request_url = this.stage()['url'] + url;

		fetch(request_url, {
				method: 'GET',
				headers: this.headers
			})
			.then(function(response) {
				if (response.status !== 200) {
					console.log('API Error, Status Code: %i', response.status);
					loading(params['loading_item']);
					return;
				}
				response.json().then(function(data) {
					if (!params['json']) {
						params['json'] = [data];
					} else {
						params['json'] = params['json'].concat([data])
					}
					callback(params);
				});
			})
			.catch(function(error) {
				console.log('Fetch Error: %s', error);
				loading(params['loading_item']);
			});
	};
}


var output_params = function(params) {
	var outparams = {};
	var action = params['action'];
	var format = params['format'];
	var video_type = params['type'];
	var _json_count = params['json'].length;
	if (_json_count < 1) {
		loading(params['loading_item']);
		return;
	}
	this.plugin_url = function(plugin_params) {
		var active = settings.get.profiles.active;
		var param_string = '';
		var connector = '?';
		for (var key in plugin_params) {
			if ((param_string) && (connector !== '&')) {
				connector = '&';
			}
			param_string += connector + key + '=' + encodeURIComponent(plugin_params[key]);
		}
		return 'plugin://' + settings.get.profiles[active].addonid + param_string;
	};
	var base_data = params['json'][0];
	switch (action) {
		case 'open_movie':
			switch (format) {
				case '1':
					outparams = {
						mode: 'get_sources',
						video_type: Capitalize(video_type),
						trakt_id: base_data['ids']['trakt'].toString(),
						year: base_data['year'].toString(),
						title: base_data['title']
					};
					break;
				case '2':
					outparams = {
						mode: 'open',
						video_type: video_type,
						trakt_id: base_data['ids']['trakt'].toString()
					};
					break;
				case '3':
					var meta = {
						year: base_data['year'].toString(),
						title: base_data['title'],
						premiered: base_data['released'],
						poster: base_data['images']['poster']['medium'],
						fanart: base_data['images']['fanart']['medium'],
						thumb: base_data['images']['thumb']['full'],
						banner: base_data['images']['banner']['full']
					};
					outparams = {
						action: 'sources',
						imdb: base_data['ids']['imdb'].toString(),
						year: base_data['year'].toString(),
						title: base_data['title'],
						premiered: base_data['released'],
						meta: JSON.stringify(meta)
					};
					break;
				case '4':
					outparams = {
						mode: 'findsource',
						media: 'movies',
						trakt_id: base_data['ids']['trakt'].toString(),
						name: base_data['title'] + ' (' + base_data['year'].toString() + ')',
						movie_title: base_data['title'],
						thumb: base_data['images']['poster']['medium']
					};
					break;
				default:
					break;
			}
			break;
		case 'play_movie':
			switch (format) {
				case '1':
					outparams = {
						mode: 'autoplay',
						video_type: Capitalize(video_type),
						trakt_id: base_data['ids']['trakt'].toString(),
						year: base_data['year'].toString(),
						title: base_data['title']
					};
					break;
				case '2':
					outparams = {
						mode: 'play',
						video_type: video_type,
						trakt_id: base_data['ids']['trakt'].toString(),
					};
					break;
				case '3':
					var meta = {
						title: base_data['title'],
						premiered: base_data['released'],
						poster: base_data['images']['poster']['medium']
					};
					var urlparams = {
						action: 'play',
						imdb: base_data['ids']['imdb'].toString(),
						year: base_data['year'].toString(),
						title: base_data['title'],
						meta: JSON.stringify(meta)
					};
					var url = this.plugin_url(urlparams);
					outparams = {
						action: 'alterSources',
						url: url
					};
					break;
				case '4':
					outparams = {
						mode: 'findsource',
						media: 'movies',
						trakt_id: base_data['ids']['trakt'].toString(),
						name: base_data['title'] + ' (' + base_data['year'].toString() + ')',
						movie_title: base_data['title'],
						thumb: base_data['images']['poster']['medium']
					};
					break;
				default:
					break;
			}
			break;
		case 'open_show':
			switch (format) {
				case '1':
					outparams = {
						mode: 'seasons',
						fanart: base_data['images']['fanart']['medium'],
						trakt_id: base_data['ids']['trakt'].toString(),
						year: base_data['year'].toString(),
						title: base_data['title']
					};
					break;
				case '2':
					outparams = {
						mode: 'open',
						video_type: video_type,
						trakt_id: base_data['ids']['trakt'].toString()
					};
					break;
				case '3':
					outparams = {
						action: 'seasons',
						imdb: base_data['ids']['imdb'].toString(),
						tvdb: base_data['ids']['tvdb'].toString(),
						year: base_data['year'].toString(),
						tvshowtitle: base_data['title']
					};
					break;
				case '4':
					outparams = {
						mode: 'find_season',
						media: 'shows',
						trakt_id: base_data['ids']['trakt'].toString(),
						name: base_data['title'] + ' (' + base_data['year'].toString() + ')',
						movie_title: base_data['title'],
						thumb: base_data['images']['poster']['medium']
					};
					break;
				default:
					break;
			}
			break;
		case 'open_season':
			switch (format) {
				case '1':
					outparams = {
						mode: 'episodes',
						season: params['season'],
						trakt_id: params['show_id'],
					};
					break;
				case '2':
					outparams = {
						mode: 'open',
						video_type: video_type,
						season: params['season'],
						trakt_id: params['season_id']
					};
					break;
				case '3':
					outparams = {
						action: 'episodes',
						imdb: base_data['ids']['imdb'].toString(),
						tvdb: base_data['ids']['tvdb'].toString(),
						year: base_data['year'].toString(),
						season: params['season'],
						tvshowtitle: base_data['title']
					};
					break;
				case '4':
					outparams = {
						mode: 'find_episode',
						media: 'shows',
						trakt_id: base_data['ids']['trakt'].toString(),
						name: 'Season ' + params['season'],
						movie_title: base_data['title'] + ' (' + base_data['year'].toString() + ')',
						thumb: base_data['images']['poster']['medium']
					};
					break;
				default:
					break;
			}
			break;
		case 'open_episode':
			if (_json_count < 2) {
				loading(params['loading_item']);
				return;
			}
			var episode_data = params['json'][1];
			switch (format) {
				case '1':
					if (episode_data['first_aired']) {
						var airdate = episode_data['first_aired'].split('T')[0];
						outparams = {
							mode: 'get_sources',
							video_type: Capitalize(video_type),
							season: params['season'],
							episode: params['episode'],
							trakt_id: base_data['ids']['trakt'].toString(),
							year: base_data['year'].toString(),
							ep_airdate: airdate,
							title: base_data['title'],
							ep_title: episode_data['title']
						};
					}
					break;
				case '2':
					outparams = {
						mode: 'open',
						video_type: video_type,
						season: params['season'],
						episode: params['episode'],
						show_id: base_data['ids']['trakt'].toString(),
						trakt_id: episode_data['ids']['trakt'].toString()
					};
					break;
				case '3':
					var meta = {
						year: base_data['year'].toString(),
						tvshowtitle: base_data['title'],
						title: episode_data['title'],
						premiered: airdate,
						episode: params['episode'],
						season: params['season'],
						poster: base_data['images']['poster']['medium'],
						fanart: base_data['images']['fanart']['medium'],
						thumb: episode_data['images']['screenshot']['thumb'],
						banner: base_data['images']['banner']['full']
					};
					outparams = {
						action: 'sources',
						imdb: base_data['ids']['imdb'].toString(),
						tvdb: base_data['ids']['tvdb'].toString(),
						year: base_data['year'].toString(),
						tvshowtitle: base_data['title'],
						episode: params['episode'],
						season: params['season'],
						meta: JSON.stringify(meta)
					};
					break;
				case '4':
					var season = params['season'];
					var episode = params['episode'];
					if (season.length < 2) {
						season = '0' + season;
					}
					if (episode.length < 2) {
						episode = '0' + episode;
					}
					outparams = {
						mode: 'findsource',
						media: 'shows',
						trakt_id: base_data['ids']['trakt'].toString(),
						name: 'S' + season + 'E' + episode + '  ' + episode_data['title'],
						movie_title: base_data['title'] + ' (' + base_data['year'].toString() + ')',
						thumb: episode_data['images']['screenshot']['thumb']
					};
					break;
				default:
					break;
			}
			break;
		case 'play_episode':
			if (_json_count < 2) {
				loading(params['loading_item']);
				return;
			}
			var episode_data = params['json'][1];
			switch (format) {
				case '1':
					if (episode_data['first_aired']) {
						var airdate = episode_data['first_aired'].split('T')[0];
						outparams = {
							mode: 'autoplay',
							video_type: Capitalize(video_type),
							season: params['season'],
							episode: params['episode'],
							trakt_id: base_data['ids']['trakt'].toString(),
							year: base_data['year'].toString(),
							ep_airdate: airdate,
							title: base_data['title'],
							ep_title: episode_data['title']
						};
					}
					break;
				case '2':
					outparams = {
						mode: 'play',
						video_type: video_type,
						season: params['season'],
						episode: params['episode'],
						show_id: base_data['ids']['trakt'].toString(),
						trakt_id: episode_data['ids']['trakt'].toString()
					};
					break;
				case '3':
					var meta = {
						year: base_data['year'].toString(),
						tvshowtitle: base_data['title'],
						title: episode_data['title'],
						episode: params['episode'],
						season: params['season'],
						premiered: airdate,
						thumb: episode_data['images']['screenshot']['thumb']
					};
					var urlparams = {
						action: 'play',
						imdb: base_data['ids']['imdb'].toString(),
						tvdb: base_data['ids']['tvdb'].toString(),
						year: base_data['year'].toString(),
						tvshowtitle: base_data['title'],
						episode: params['episode'],
						season: params['season'],
						meta: JSON.stringify(meta)
					};
					var url = this.plugin_url(urlparams);
					outparams = {
						action: 'alterSources',
						url: url
					};
					break;
				case '4':
					var season = params['season'];
					var episode = params['episode'];
					if (season.length < 2) {
						season = '0' + season;
					}
					if (episode.length < 2) {
						episode = '0' + episode;
					}
					outparams = {
						mode: 'findsource',
						media: 'shows',
						trakt_id: base_data['ids']['trakt'].toString(),
						name: 'S' + season + 'E' + episode + '  ' + episode_data['title'],
						movie_title: base_data['title'] + ' (' + base_data['year'].toString() + ')',
						thumb: episode_data['images']['screenshot']['thumb']
					};
					break;
				default:
					break;
			}
			break;
		default:
			break;
	}
	loading(params['loading_item']);
	if (params['callback'] && params['arg1']) {
		params['callback'](params['arg1'], outparams);
	} else if (params['callback']) {
		params['callback'](outparams);
	} else {
		return outparams;
	}
}


function get_output_params(params) {
	var outparams = {};
	params['type'] = params['action'].split('_')[1];
	var traktDOM = new TraktDOMScraper(params['item'], params['type']);
	var trakt = new Trakt();
	switch (params['type']) {
		case 'movie':
			params['movie_id'] = traktDOM.id('movie');
			params['images'] = true;
			trakt.request('summary', params, output_params);
			break;
		case 'show':
			params['show_id'] = traktDOM.id('show');
			params['images'] = true;
			trakt.request('summary', params, output_params);
			break;
		case 'season':
			params['show_id'] = traktDOM.id('show');
			params['season_id'] = traktDOM.id('season');
			params['season'] = traktDOM.season();
			params['images'] = true;
			return trakt.request('summary', params, output_params);
			break;
		case 'episode':
			params['show_id'] = traktDOM.id('show');
			params['season'] = traktDOM.season();
			params['episode'] = traktDOM.episode();
			params['images'] = true;
			trakt.request('summary', params, output_params);
			break;
	}
}


function execute_action(event_element, action, action_input) {
	if (action_input === 'button') {
		var item = document.getElementsByTagName('html')[0];
		var loading_item = event_element;
	} else if (action_input === 'icon') {
		var item = event_element.parentElement.parentElement.parentElement;
		var loading_item = item;
	} else {
		return;
	}
	if ((action === 'open_episode') && (settings.get.episode_open_season === true)) {
		action = 'open_season';
	}
	loading(loading_item, true);
	var execute_port = chrome.runtime.connect({
		name: 'T2KASocket'
	});
	execute_port.postMessage({
		action: 'get_settings'
	});
	execute_port.onMessage.addListener(function(msg) {
		switch (msg.action) {
			case 'get_settings':
				if (msg.settings) {
					settings.get = msg.settings;
					var active_format = settings.get.profiles.active;
					params = {
						action: action,
						format: settings.get.profiles[active_format].format,
						item: item,
						loading_item: loading_item,
						callback: kodi.rpc,
						arg1: settings.get.rpc_method
					}
					get_output_params(params);
					execute_port.disconnect();
				}
				break;
			default:
				break;
		}
	});
}


var kodi = {
	rpc: function(action, params) {
		switch (action) {
			case 'execute_addon':
			case 'activate_window':
				if (params) {
					port.postMessage({
						action: action,
						params: params
					});
				}
				break;
			default:
				break;
		}
	}
}


function i18n(data_i18n) {
	return chrome.i18n.getMessage(data_i18n);
}


port.onMessage.addListener(function(msg) {
	switch (msg.action) {
		case 'with_settings':
			if ((msg.cb_functions) && (msg.settings)) {
				settings.get = msg.settings;
				var _length = msg.cb_functions.length;
				for (var i = 0; i < _length; i++) {
					switch (msg.cb_functions[i].fn) {
						case 'add_items.icons':
							add_items.icons();
							break;
						case 'add_items.buttons':
							add_items.buttons();
							break;
						case 'add_items.date_nav':
							add_items.date_nav();
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


settings.load([{
	fn: 'add_items.icons'
}, {
	fn: 'add_items.buttons'
}, {
	fn: 'add_items.date_nav'
}]);
