var port = chrome.runtime.connect({ name: 'T2KASocket' });


function Capitalize (string) {
	return string.charAt(0).toUpperCase() + string.slice(1);
}


var settings = {
	get: (null),
	load: function (callback_array) {
		port.postMessage({
			action: 'with_settings',
			cb_functions: callback_array
		});
	}
}


function CheckType (data_type) {
	this.valid = function () {
		if ((data_type === 'movie') || (data_type === 'show') || (data_type === 'season') || (data_type === 'episode')) {
			return true;
		}
		else {
			return false;
		}
	};
	this.can_play = function () {
		if ((data_type !== 'show') && (data_type !== 'season') && (this.valid() === true)) {
			return true;
		}
		else {
			return false;
		}
	};
	this.show_play = function () {
		if (this.can_play() === true) {
			if (((data_type === 'movie') && (settings.get.movie_show_play === true))
				|| ((data_type === 'episode') && (settings.get.episode_show_play === true))) {
				return true;
			}
			else {
				return false;
			}
		}
		else {
			return false;
		}
	};
	this.open_to_season = function () {
		if ((settings.get.episode_open_season === true) && (data_type === 'episode')) {
			return true;
		}
		else {
			return false;
		}
	};
}


var action_elements = {
	add_to_page: function (root_item, item, data_type, action_type) {
		var check_type = new CheckType(data_type);
		if (check_type.valid() === true) {
			var action_added = false;
			if (action_type === 'button') {
				var open_item = item.getElementsByClassName('btn-t2ka-open')[0];
				var play_item = item.getElementsByClassName('btn-t2ka-play')[0];
			}
			else {
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
				}
				else {
					root_item.getElementsByClassName('actions')[0].appendChild(action_elements.icon('open', element_data_type));
				}
			}
			if (!play_item) {
				if (check_type.show_play() === true) {
					action_added = true;
					if (action_type === 'button') {
						root_item.appendChild(action_elements.button('play', data_type))
					}
					else {
						root_item.getElementsByClassName('actions')[0].appendChild(action_elements.icon('play', data_type));
					}
				}
			}
			if (action_added) {
				action_elements.add_listener(item, data_type, action_type);
			}
		}
	},
	icon: function (name, data_type) {
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
	button: function (name, data_type) {
		var button_element = document.createElement('a');
		button_element.setAttribute('class', 'btn btn-block btn-summary btn-t2ka-' + name);
		var text_div = document.createElement('div');
		text_div.setAttribute('class', 'text');
		var main_info_div = document.createElement('div');
		main_info_div.setAttribute('class', 'main-info');
		main_info_div.appendChild(document.createTextNode(i18n(name)));
		var under_info_div = document.createElement('div');
		under_info_div.setAttribute('class', 'under-info');
		under_info_div.appendChild(document.createTextNode(i18n(data_type)));
		var icon_trakt = document.createElement('div');
		icon_trakt.setAttribute('class', 'fa fa-fw trakt-icon-t2ka-' + name);
		text_div.appendChild(main_info_div);
		text_div.appendChild(under_info_div);
		button_element.appendChild(icon_trakt);
		button_element.appendChild(text_div);
		return button_element;
	},
	add_listener: function (items, data_type, action_input) {
		var open_item = '';
		var play_item = '';
		var check_type = new CheckType(data_type);
		if (action_input === 'icon') {
			open_item = items.getElementsByClassName('t2ka_open')[0];
			play_item = items.getElementsByClassName('t2ka_play')[0];
		}
		else if (action_input === 'button') {
			open_item = items.getElementsByClassName('btn-t2ka-open')[0];
			play_item = items.getElementsByClassName('btn-t2ka-play')[0];
		}
		switch (data_type) {
			case 'movie':
				if (open_item) {
					open_item.addEventListener("click", function () {
						kodi.execute_addon(this, 'open_movie', action_input);
					});
				}
				if (play_item) {
					if (check_type.show_play() === true) {
						play_item.addEventListener("click", function () {
							kodi.execute_addon(this, 'play_movie', action_input);
						});
					}
				}
				break;
			case 'show':
				if (open_item) {
					open_item.addEventListener("click", function () {
						kodi.execute_addon(this, 'open_show', action_input);
					});
				}
				break;
			case 'season':
				if (open_item) {
					open_item.addEventListener("click", function () {
						kodi.execute_addon(this, 'open_season', action_input);
					});
				}
				break;
			case 'episode':
				if (open_item) {
					open_item.addEventListener("click", function () {
						kodi.execute_addon(this, 'open_episode', action_input);
					});
				}
				if (play_item) {
					if (check_type.show_play() === true) {
						play_item.addEventListener("click", function () {
							kodi.execute_addon(this, 'play_episode', action_input);
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
	icons: function () {
		var quick_icons = '';
		var data_type = '';
		var grid_items = document.getElementsByClassName('grid-item');
		var _length = grid_items.length;
		for (var i = 0; i < _length; i++) {
			if (grid_items[i].getElementsByClassName('grid-item')[0]) { continue; }
			data_type = '';
			quick_icons = grid_items[i].getElementsByClassName('quick-icons')[0];
			if (quick_icons) {
				data_type = grid_items[i].getAttribute('data-type');
				if (!data_type) { continue; }
				action_elements.add_to_page(quick_icons, grid_items[i], data_type, 'icon');
			}
		}
	},
	buttons: function () {
		var action_buttons = document.getElementsByClassName('action-buttons')[0];
		if (action_buttons) {
			data_type = action_buttons.getElementsByClassName('btn-watch')[0]
			if (data_type) {
				data_type = data_type.getAttribute('data-type');
				if (!data_type) { return; }
				action_elements.add_to_page(action_buttons, action_buttons, data_type, 'button');
			}
		}
	},
	date_nav: function () {
		if ((document.getElementById('date-nav-2')) || (!settings.get.sidebar_pagination)) { return; }
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


function Trakt (item, video_type) {
	this.id = function (_video_type) {
		if (!_video_type) {
			_video_type = video_type;
		}
		var value = '';
		value = item.getAttribute('data-'+ _video_type.toLowerCase() +'-id');
		if (!value) {
			value = item.getElementsByClassName('btn-watch')[0];
			if (value) {
				value = value.getAttribute('data-'+ _video_type.toLowerCase() +'-id');
			}
		}
		return value;
	},
	this.year = function () {
		var value = item.getElementsByClassName('year')[0];
		if (value) {
			value = value.innerHTML;
			if (value) {
				return value.split('T')[0].split(' ')[0].split('-')[0];
			}
		}
		if (!value) {
			value = this.airdate();
			if (value) {
				return value.split('T')[0].split(' ')[0].split('-')[0];
			}
			else {
				value = this.title(false, false);
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
	},
	this._strip_year = function (title) {
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
	},
	this.season = function () {
		var season = item.getAttribute('data-season-number');
		if (season) {
			return season;
		}
		else {
			season = item.getElementsByClassName('main-title-sxe')[0];
			if (season) {
				if (season.innerHTML.indexOf('Special') > -1) {
					return '0';
				}
				else {
					return season.innerHTML.split('x')[0];
				}
			}
			else {
				season = item.getElementsByClassName('btn-watch')[0];
				if (season) {
					return season.getAttribute('data-season-number');
				}
				else {
					return '';
				}
			}
		}
	},
	this.title = function (strip_year, allow_match) {
		var items = document.getElementsByClassName('grid-item')[0];
		var _item = item;
		if (!items) {
			_item = document;
		}
		var value = this._itemprop(_item, 'meta', 'name', false, 0);
		if (value) {
			if (!allow_match) {
				if (value !== this.series_title(_item)) {
					if (strip_year) {
						return this._strip_year(value);
					}
					return value;
				}
				value = null;
			}
			else {
				if (strip_year) {
					return this._strip_year(value);
				}
				return value;
			}
		}
		if (!value) {
			value = this._itemprop(_item, 'meta', 'name', false, 1);
			if (value) {
				if (strip_year) {
					return this._strip_year(value);
				}
				return value;
			}
			else {
				return '';
			}
		}
	},
	this.series_title = function (_item) {
		if (!_item) {
			_item = item;
		}
		var value = this.parent_title(_item);
		if (value) {
			return value;
		}
		else {
			var is_fake = _item.getAttribute('class');
			if (is_fake) {
				if (is_fake.indexOf('fake') > -1) {
					value = _item.getElementsByTagName('h5')[0];
					if (value) {
						return value.innerHTML.trim();
					}
				}
			}
			value = this.parent_title(document);
			if (value) {
				return value;
			}
			else {
				value = null;
				if (_item.parentElement) {
					value = _item.parentElement.getElementsByClassName('show-title')[0];
					if (value) {
						value = value.getElementsByTagName('a')[0];
						if (value) {
							return value.innerHTML.trim();
						}
					}
				}
				if (!value) {
					return '';
				}
			}
		}
	},
	this.episode = function () {
		var value = this._itemprop(item, 'meta', 'episodeNumber', false, 0);
		if (value) {
			return value;
		}
		else {
			value = this._itemprop(document, 'meta', 'episodeNumber', false, 0);
			if (value) {
				return value;
			}
			else {
				return '';
			}
		}
	},
	this.airdate = function () {
		var items = document.getElementsByClassName('grid-item')[0];
		var _item = item;
		if (!items) {
			_item = document;
		}
		var value = this._itemprop(_item, 'meta', 'datePublished', false, 0);
		if (value) {
			return value.split('T')[0].split(' ')[0];
		}
		else {
			value = this._itemprop(_item, 'meta', 'startDate', false, 0);
			if (value) {
				return value.split('T')[0].split(' ')[0];
			}
			else {
				return '';
			}
		}
	},
	this.art = function () {
		var value = this._itemprop(item, 'meta', 'image', false, 0);
		if (value){
			return value;
		}
		else {
			return '';
		}
	},
	this.parent_title = function (_item) {
		if (!_item) {
			_item = item;
		}
		var value = this._itemprop(_item, 'span', 'partOfSeries', true, 0);
		if (value) {
			value = this._itemprop(value, 'meta', 'name', false, 0);
			if (value) {
				return value;
			}
		}
		return '';
	},
	this._itemprop = function (_item, tag_name, prop_name, return_DOM, index) {
		var count = 0;
		var elements = _item.getElementsByTagName(tag_name);
		var _length = elements.length;
		for (var i = 0; i < _length; i++) {
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
}


function output_params (action, format, item) {
	var params = {};
	var video_type = action.split('_')[1];
	var trakt = new Trakt(item, video_type);
	switch (action) {
		case 'open_movie':
			switch (format) {
				case '1':
					params = {
						mode: 'get_sources',
						video_type: Capitalize(video_type),
						trakt_id: trakt.id(),
						year: trakt.year(),
						title: trakt.title(true, false)
					};
					break;
				case '2':
					params = {
						mode: 'open',
						video_type: video_type,
						trakt_id: trakt.id()
					};
					break;
				default:
					break;
			}
			break;
		case 'play_movie':
			switch (format) {
				case '1':
					params = {
						mode: 'autoplay',
						video_type: Capitalize(video_type),
						trakt_id: trakt.id(),
						year: trakt.year(),
						title: trakt.title(true, false)
					};
					break;
				case '2':
					params = {
						mode: 'play',
						video_type: video_type,
						trakt_id: trakt.id(),
					};
					break;
				default:
					break;
			}
			break;
		case 'open_show':
			switch (format) {
				case '1':
					params = {
						mode: 'seasons',
						fanart: trakt.art(),
						trakt_id: trakt.id(),
						year: trakt.year(),
						title: trakt.title(true, true)
					};
					break;
				case '2':
					params = {
						mode: 'open',
						video_type: video_type,
						trakt_id: trakt.id()
					};
					break;
				default:
					break;
			}
			break;
		case 'open_season':
			switch (format) {
				case '1':
					params = {
						mode: 'episodes',
						season: trakt.season(),
						trakt_id: trakt.id('show'),
					};
					break;
				case '2':
					params = {
						mode: 'open',
						video_type: video_type,
						season: trakt.season(),
						trakt_id: trakt.id()
					};
					break;
				default:
					break;
			}
			break;
		case 'open_episode':
			switch (format) {
				case '1':
					params = {
						mode: 'get_sources',
						video_type: Capitalize(video_type),
						season: trakt.season(),
						episode: trakt.episode(),
						trakt_id: trakt.id('show'),
						year: trakt.year(),
						ep_airdate: trakt.airdate(),
						title: trakt.series_title(),
						ep_title: trakt.title(true, false)
					};
					break;
				case '2':
					params = {
						mode: 'open',
						video_type: video_type,
						season: trakt.season(),
						episode: trakt.episode(),
						show_id: trakt.id('show'),
						trakt_id: trakt.id()
					};
					break;
				default:
					break;
			}
			break;
		case 'play_episode':
			switch (format) {
				case '1':
					params = {
						mode: 'autoplay',
						video_type: Capitalize(video_type),
						season: trakt.season(),
						episode: trakt.episode(),
						trakt_id: trakt.id('show'),
						year: trakt.year(),
						ep_airdate: trakt.airdate(),
						title: trakt.series_title(),
						ep_title: trakt.title(true, false)
					};
					break;
				case '2':
					params = {
						mode: 'play',
						video_type: video_type,
						season: trakt.season(),
						episode: trakt.episode(),
						show_id: trakt.id('show'),
						trakt_id: trakt.id()
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


var kodi = {
	execute_addon: function (event_element, action, action_input) {
		var item = event_element.parentElement.parentElement.parentElement;
		if (action_input === 'button') {
			item = document.getElementsByTagName('html')[0];
		}
		if ((action === 'open_episode') && (settings.get.episode_open_season === true)) {
			action = 'open_season';
		}
		var qport = chrome.runtime.connect({ name: 'T2KASocket' });
		qport.postMessage({action: 'active_format'}); 
		qport.onMessage.addListener(function(msg) {
			switch (msg.action) {
				case 'active_format':
					kodi.rpc.execute_addon(output_params(action, msg.active_format, item));
					qport.disconnect();
					break;
				default:
					break;
			}
		});
	},
	rpc: {
		execute_addon: function (params) {
			if (params) {
				port.postMessage({
					action: 'execute_addon',
					params: params
				});
			}
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
					switch(msg.cb_functions[i].fn) {
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


settings.load([{fn: 'add_items.icons'}, {fn: 'add_items.buttons'}, {fn: 'add_items.date_nav'}]);
