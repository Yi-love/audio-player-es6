# player
music player


# usage

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