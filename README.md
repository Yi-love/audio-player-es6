# player
html5 audio player

# logs

```
  v1.0.2  Tue Nov 01 2016 10:50:17 GMT+0800 (中国标准时间)  npm publish
```

# exports

```js
  if(typeof exports === 'object' && typeof module === 'object')
    module.exports = factory();
  else if(typeof define === 'function' && define.amd)
    define([], factory);
  else if(typeof exports === 'object')
    exports["Player"] = factory();
  else
    root["Player"] = factory();
```

# import

```js
   import Player from 'audio-player-es6';
   //or
   let Player = require('audio-player-es6');
   //or
   let player = new Player({})
```

#parameters

```txt
   audioList         播放列表         
   audioCurrentIndex 当前播放第几首
   lastPlayIndex     上一首id
   audioCurrent      播放Audio
   state             播放状态
   playDir           播放方向
   errorArray        错误歌曲列表
   abortTime         加载超时时间
   abortHandler      超时事件句柄
   volumeCurrent     声音音量
   auto              自动播放
   eventHandler      事件句柄
   mode              播放模式
   callback          歌曲各个阶段的回调函数对象
```
# interface

### 2.1 src(source)
> add music to player list

```js
  player.src([]) || player.src('music.mp3')
```

### 2.2 play(n)
> play

```js
  play.play() || play.play(1) //  1 <= n <= list.length 
```

### 2.3 next()
> player next music

```js
  player.next()
```

### 2.4 pre()
> player pre music

```js
  player.pre()
```

### 2.5 jump(n)
> n = index - current

```js
 player.jump(1)   0 <= current+n < list.length
```

### 2.6 pause()
> stop play

```js
 player.pause()
```

### 2.7 other
```txt
  setMode(mode)
  setAuto(auto)
  setAbortTime(abortTime)
  setCallBack(callbackObj)
  runCallBack(name)
  setVolume(val)
  setAudioCurrentIndex(n)
  setErrorAudio()
  getErrorAudio(source)
  getStep()
  reload()
  audioPlay()
  reVolume()
  loading()
  reState(state)
  reDir(dir)
  reAbort()
  addEvent()
  filerErrorAudio()
  removeEevent()
```
# usage

demo: https://github.com/Yi-love/audio-player-es6-demo

```js
	var audio = new Player();
	audio.src(['/music/1.mp3','/music/2.mp3','/music/5.mp3','/music/4.mp3'])
	.src('hjk.mpg').src('/music/3.mp3').src('/music/4.mp3')
	.setCallBack({
		loading: function(state , player){
			console.log(state);
			document.getElementById('current').innerHTML = player.audioList[player.audioCurrentIndex]
		},
		playing:function(state , player){
			console.log(state, player.audioCurrentIndex , player.audioList[player.audioCurrentIndex])
		},
		end:function(state , player ){
			console.log(state)
		},
		abort: function(state , player){
			console.log(state , player.lastPlayIndex , player.audioList[player.lastPlayIndex])
		}
	}).play();
```

# test

cmd

```
 webpack
```