(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else if(typeof exports === 'object')
		exports["Player"] = factory();
	else
		root["Player"] = factory();
})(this, function() {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports) {

	'use strict';

	exports.__esModule = true;

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	var P_PADDING = 'P_PADDING';
	var P_LOAD_START = 'P_LOAD_START';
	var P_LOADING = 'P_LOADING';
	var P_PLAY = 'P_PLAY';
	var P_PLAYING = 'P_PLAYING';
	var P_ERROR = 'P_ERROR';
	var P_PAUSE = 'P_PAUSE';
	var P_ENDED = 'P_ENDED';
	var P_ABORT = 'P_ABORT';

	var P_DIR = 1;

	var P_MODE_SINGLE = 'P_MODE_SINGLE';
	var P_MODE_ORDER = 'P_MODE_ORDER';
	var P_MODE_CIRCULATION = 'P_MODE_CIRCULATION';
	var P_MODE_RANDOM = 'P_MODE_RANDOM';

	var P_EMPTY_FUNC = function P_EMPTY_FUNC(state, player) {
	    return player;
	};

	//includes
	if (!Array.prototype.includes) {
	    Array.prototype.includes = function (source) {
	        for (var i = 0; i < this.length; i++) {
	            if (this[i] === source) return true;
	        }
	        return false;
	    };
	}

	/**
	 * Jin  Music Player
	 *
	 * audioList         播放列表
	 * audioCurrentIndex 当前播放第几首
	 * lastPlayIndex     上一首id
	 * audioCurrent      播放Audio
	 * state             播放状态
	 * playDir           播放方向
	 * errorArray        错误歌曲列表
	 * abortTime         加载超时时间
	 * abortHandler      超时事件句柄
	 * volumeCurrent     声音音量
	 * auto              自动播放
	 * eventHandler      事件句柄
	 * mode              播放模式
	 * callback          歌曲各个阶段的回调函数对象
	 *
	 */

	var Player = function () {
	    function Player(play) {
	        _classCallCheck(this, Player);

	        if (!window.Audio) return 'Your browser does not support [window.Audio]';
	        if (play === void 0) play = {};
	        if ({}.toString(play) !== '[object Object]') throw new Error('Player need {}');
	        this.audioList = [];
	        this.lastPlayIndex = this.audioCurrentIndex = play.audioCurrentIndex ? play.audioCurrentIndex - 1 : 0;
	        this.audioCurrent = new Audio();
	        this.state = P_PADDING;
	        this.playDir = P_DIR;
	        this.errorArray = [];
	        this.abortTime = 20000;
	        this.abortHandler = null;
	        this.volumeCurrent = 1;
	        this.auto = true;
	        this.eventHandler = {};
	        this.mode = P_MODE_ORDER;
	        this.callback = { error: P_EMPTY_FUNC, abort: P_EMPTY_FUNC, loadstart: P_EMPTY_FUNC, loading: P_EMPTY_FUNC,
	            play: P_EMPTY_FUNC, playing: P_EMPTY_FUNC, end: P_EMPTY_FUNC };

	        this.src(play.audioList).setAbortTime(play.abortTime).setAuto(play.auto).setMode(play.mode).setVolume(play.volume).setCallBack(play.callback).addEvent();
	    }

	    Player.prototype.src = function src(source) {
	        var _this2 = this;

	        if (!source) return this;
	        if (typeof source === 'string') {
	            if (!this.audioList.includes(source)) this.audioList.push(source);
	        } else if (Array.isArray(source)) {
	            (function () {
	                var _this = _this2;
	                source = source.filter(function (currentSrc) {
	                    return !_this.audioList.includes(currentSrc);
	                });
	                _this2.audioList = _this2.audioList.concat(source);
	            })();
	        }
	        return this;
	    };

	    Player.prototype.play = function play(n) {
	        if (typeof n === 'number' && this.audioList && this.errorArray.length != this.audioList && n <= this.audioList.length || n > 0) {
	            return this.jump(n - this.audioCurrentIndex - 1);
	        }
	        return !this.audioCurrent.currentSrc ? this.setAudioCurrentIndex().loading() : this.audioPlay();
	    };

	    Player.prototype.next = function next() {
	        return this.reDir().jump(this.mode === P_MODE_SINGLE ? 1 : this.getStep());
	    };

	    Player.prototype.pre = function pre() {
	        return this.reDir(-1).jump(this.mode === P_MODE_SINGLE ? -1 : this.getStep());
	    };

	    Player.prototype.jump = function jump(n) {
	        if (n === void 0) n = this.getStep();
	        if (typeof n !== 'number' || this.audioCurrentIndex + n >= this.audioList.length || this.audioCurrentIndex + n < 0) return this.reAbort().reDir().reState();
	        return this.pause().reAbort().setAudioCurrentIndex(n).loading();
	    };

	    Player.prototype.setMode = function setMode(mode) {
	        var modes = [P_MODE_SINGLE, P_MODE_ORDER, P_MODE_CIRCULATION, P_MODE_RANDOM];
	        if (typeof mode === 'string' && modes.includes(mode)) this.mode = mode;
	        if (typeof mode === 'number' && modes[mode]) this.mode = modes[mode];
	        return this;
	    };

	    Player.prototype.setAuto = function setAuto(auto) {
	        auto = auto === void 0 ? true : auto;
	        this.auto = typeof auto === 'boolean' ? auto : this.auto;
	        return this;
	    };

	    Player.prototype.setAbortTime = function setAbortTime(abortTime) {
	        this.abortTime = abortTime && typeof abortTime === 'number' ? abortTime : this.abortTime;
	        return this;
	    };

	    Player.prototype.setCallBack = function setCallBack(callbackObj) {
	        if ({}.toString(callbackObj) !== '[object Object]') return this;
	        for (var name in callbackObj) {
	            if (this.callback[name] && typeof callbackObj[name] === 'function') {
	                this.callback[name] = callbackObj[name];
	            }
	        }
	        return this;
	    };

	    Player.prototype.runCallBack = function runCallBack(name) {
	        if (name && typeof this.callback[name] === 'function') {
	            this.callback[name].call(this, name, this);
	        }
	        return this;
	    };

	    Player.prototype.setVolume = function setVolume(val) {
	        this.volumeCurrent = typeof val === 'number' && val >= 0 && val <= 1 ? val : this.volumeCurrent;
	        return this.reVolume();
	    };

	    Player.prototype.setAudioCurrentIndex = function setAudioCurrentIndex(n) {
	        this.lastPlayIndex = this.audioCurrentIndex;
	        if (n === void 0) return this;
	        if (this.audioList.length && this.audioCurrentIndex + n >= this.audioList.length) {
	            this.audioCurrentIndex = this.audioList.length - 1;
	            return this;
	        }
	        if (this.audioCurrentIndex + n < 0) {
	            this.audioCurrentIndex = 0;
	            return this;
	        }
	        this.audioCurrentIndex += n;
	        return this;
	    };

	    Player.prototype.setErrorAudio = function setErrorAudio() {
	        if (!this.errorArray.includes(this.audioList[this.audioCurrentIndex])) this.errorArray.push(this.audioList[this.audioCurrentIndex]);
	        return this;
	    };

	    Player.prototype.getErrorAudio = function getErrorAudio(source) {
	        if (source && typeof source === 'string' && this.errorArray.includes(source)) return true;
	        if (source && typeof source === 'number' && source < this.audioList.length && source >= 0 && this.errorArray.includes(this.audioList[source])) return true;
	        return source === void 0 && this.errorArray.includes(this.audioList[this.audioCurrentIndex]) ? true : false;
	    };

	    Player.prototype.getStep = function getStep() {
	        if (this.mode === P_MODE_SINGLE) return 0;
	        if (this.mode === P_MODE_CIRCULATION) {
	            return (this.audioCurrentIndex + 1) % this.audioList.length - this.audioCurrentIndex;
	        }
	        if (this.mode === P_MODE_RANDOM) {
	            return Math.floor(Math.random() * (this.audioList.length - 0) + 0) - this.audioCurrentIndex;
	        }
	        return 1 * this.playDir; //this.mode === P_MODE_ORDER
	    };

	    Player.prototype.pause = function pause() {
	        if (this.audioCurrent) this.audioCurrent.pause();
	        return this.reState(P_PAUSE);
	    };

	    Player.prototype.reload = function reload() {
	        if (this.audioCurrent) {
	            this.audioCurrent.load();
	        }
	        return this;
	    };

	    Player.prototype.audioPlay = function audioPlay() {
	        if (this.audioCurrent) {
	            this.audioCurrent.play();
	        }
	        return this;
	    };

	    Player.prototype.reVolume = function reVolume() {
	        if (this.audioCurrent) this.audioCurrent.volume = this.volumeCurrent;
	        return this;
	    };

	    Player.prototype.loading = function loading() {
	        var _this3 = this;

	        if (this.audioList.length && this.audioCurrentIndex < this.audioList.length && this.audioCurrentIndex >= 0) {
	            // loading    
	            this.reAbort().reState();
	            this.audioCurrent.src = this.audioList[this.audioCurrentIndex];
	            this.abortHandler = setTimeout(function () {
	                var event = document.createEvent('Events');
	                event.initEvent('emptied', false, true);
	                _this3.pause().audioCurrent.dispatchEvent(event);
	            }, this.abortTime);
	            return this.auto ? this.audioPlay() : this;
	        }
	        return this;
	    };

	    Player.prototype.reState = function reState(state) {
	        this.state = state ? state : P_PADDING;
	        return this;
	    };

	    Player.prototype.reDir = function reDir(dir) {
	        this.playDir = dir ? dir * P_DIR : P_DIR;
	        return this;
	    };

	    Player.prototype.reAbort = function reAbort() {
	        clearTimeout(this.abortHandler);
	        this.abortHandler = null;
	        return this;
	    };

	    Player.prototype.addEvent = function addEvent() {
	        var _this4 = this;

	        this.eventHandler = {
	            error: function error() {
	                _this4.reAbort().reState(P_ERROR).setErrorAudio().runCallBack('error');
	                return _this4.auto ? _this4.jump(_this4.mode === P_MODE_SINGLE ? _this4.playDir === P_DIR ? 1 : -1 : _this4.getStep()) : _this4;
	            },
	            loadstart: function loadstart() {
	                return _this4.reState(P_LOAD_START).runCallBack('loadstart');
	            },
	            loadedmetadata: function loadedmetadata() {
	                return _this4.reAbort().reState(P_LOADING).filterErrorAudio().runCallBack('loading').reDir();
	            },
	            emptied: function emptied() {
	                return _this4.reState(P_ABORT).runCallBack('abort');
	            },
	            canplay: function canplay() {
	                return _this4.reState(P_PLAY).runCallBack('play');
	            },
	            playing: function playing() {
	                return _this4.reState(P_PLAYING).runCallBack('playing');
	            },
	            ended: function ended() {
	                _this4.reState(P_ENDED).runCallBack('end');
	                return _this4.auto ? _this4.jump(_this4.getStep()) : _this4.setAudioCurrentIndex();
	            }
	        };
	        for (var eventName in this.eventHandler) {
	            this.audioCurrent.addEventListener(eventName, this.eventHandler[eventName], false);
	        }
	        return this;
	    };

	    Player.prototype.filterErrorAudio = function filterErrorAudio() {
	        if (!this.audioCurrent.src) return this;
	        var audioCurrentSrc = this.audioCurrent.src;
	        this.errorArray = this.errorArray.filter(function (currentSrc) {
	            return currentSrc != audioCurrentSrc;
	        });
	        return this;
	    };

	    Player.prototype.removeEevent = function removeEevent() {
	        for (var eventName in this.eventHandler) {
	            this.audioCurrent.removeEventListener(eventName, this.eventHandler[eventName], false);
	        }
	        return this.reAbort();
	    };

	    return Player;
	}();

	exports.default = Player;
	module.exports = exports['default'];

/***/ }
/******/ ])
});
;