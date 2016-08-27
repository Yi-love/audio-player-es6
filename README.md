# player
music player


# usage

```js
	var audio = new Player();
	audio.setCallBack({
		loading: function(state , player){
			console.log('loading...' , state);
			document.getElementById('current').innerHTML = player.audioList[player.audioCurrentIndex]
		},
		playing:function(state , player){
			console.log('playing...' , player.audioCurrentIndex , player.audioList[player.audioCurrentIndex])
		},
		end:function(state , player ){
			console.log('end...' , player.audioCurrentIndex , player.audioList[player.audioCurrentIndex])
		}
	}).src(['/music/1.mp3','/music/2.mp3','/music/5.mp3','/music/4.mp3']).src('hjk.mpg').src('/music/3.mp3').src('/music/4.mp3').play();
```