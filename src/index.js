const P_PADDING      = 'P_PADDING'
const P_LOAD_START   = 'P_LOAD_START'
const P_LOADING      = 'P_LOADING'
const P_PLAY         = 'P_PLAY'
const P_PLAYING      = 'P_PLAYING'
const P_ERROR        = 'P_ERROR'
const P_PAUSE        = 'P_PAUSE'
const P_ENDED        = 'P_ENDED'
const P_ABORT        = 'P_ABORT'

const P_DIR          = 1

const P_MODE_SINGLE      = 'P_MODE_SINGLE'
const P_MODE_ORDER       = 'P_MODE_ORDER'
const P_MODE_CIRCULATION = 'P_MODE_CIRCULATION'
const P_MODE_RANDOM      = 'P_MODE_RANDOM'

const P_EMPTY_FUNC = (state , player)=>{ return player }

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
 *
 * eg :
 *   var audio = new Player();
        audio.src(['/music/1.mp3','/music/2.mp3','/music/5.mp3','/music/4.mp3'])
        .src('hjk.mpg').src('/music/3.mp3').src('/music/4.mp3')
        .setCallBack({
            loading: function(state , player){
                console.log('loading...' , state);
                document.getElementById('current').innerHTML = player.audioList[player.audioCurrentIndex]
            },
            playing:function(state , player){
                console.log('playing...' , player.audioCurrentIndex , player.audioList[player.audioCurrentIndex])
            },
            end:function(state , player ){
                console.log('end...' , player.lastPlayIndex , player.audioList[player.lastPlayIndex])
            }
        }).play();
 */
export default class Player{
    constructor(play){
        if ( !window['Audio'] )  return 'Your browser does not support [window.Audio]' 
        if ( play === void 0 ) play = {}
        if ( ({}).toString(play) !== '[object Object]' ) throw new Error('Player need {}')
        this.audioList         = []
        this.lastPlayIndex     = this.audioCurrentIndex 
                               = play.audioCurrentIndex ? play.audioCurrentIndex-1 : 0
        this.audioCurrent      = new Audio()
        this.state             = P_PADDING
        this.playDir           = P_DIR
        this.errorArray        = []
        this.abortTime         = 20000
        this.abortHandler      = null
        this.volumeCurrent     = 1
        this.auto              = true
        this.eventHandler      = {}
        this.mode              = P_MODE_ORDER
        this.callback          = {error: P_EMPTY_FUNC , abort: P_EMPTY_FUNC , loadstart:P_EMPTY_FUNC , loading: P_EMPTY_FUNC , 
                                    play: P_EMPTY_FUNC , playing: P_EMPTY_FUNC  , end: P_EMPTY_FUNC }

        this.src(play.audioList).setAbortTime(play.abortTime).setAuto(play.auto).setMode(play.mode)
            .setVolume(play.volume).setCallBack(play.callback).addEvent()
    }
    src(source){
        if ( !source ) return this
        if ( typeof source === 'string' ){
            !this.audioList.includes(source) && this.audioList.push(source)
        }else if( Array.isArray(source) ){
            let _this = this
            source = source.filter(function(currentSrc){
                return !_this.audioList.includes(currentSrc)
            })
            this.audioList = this.audioList.concat(source)
        }
        return this
    }
    play(n){
        if ( typeof n === 'number' && this.audioList && this.errorArray.length != this.audioList && 
            n <= this.audioList.length || n > 0 ) {
            return this.jump(n - this.audioCurrentIndex-1)
        }
        return !this.audioCurrent.currentSrc ? this.setAudioCurrentIndex().loading() : this.audioPlay()
    }
    next(){
        return this.reDir().jump(this.mode === P_MODE_SINGLE ? 1 : this.getStep())
    }
    pre(){
        return this.reDir(-1).jump(this.mode === P_MODE_SINGLE ? -1 : this.getStep())
    }
    jump(n){
        if ( n === void 0 ) n = this.getStep()
        if ( typeof n !== 'number' || this.audioCurrentIndex+n >= this.audioList.length || this.audioCurrentIndex+n < 0) 
            return this.reAbort().reDir().reState()
        return this.pause().reAbort().setAudioCurrentIndex(n).loading()
    }
    setMode(mode){
        let modes = [P_MODE_SINGLE , P_MODE_ORDER , P_MODE_CIRCULATION , P_MODE_RANDOM]
        if ( typeof mode === 'string' && modes.includes(mode) )
            this.mode =  mode
        if ( typeof mode === 'number' && modes[mode] ) 
            this.mode = modes[mode]
        return this
    }
    setAuto(auto){
        auto = auto === void 0 ? true : auto
        this.auto = typeof auto === 'boolean' ? auto : this.auto
        return this
    }
    setAbortTime(abortTime){
        this.abortTime = abortTime && typeof abortTime === 'number' ? abortTime : this.abortTime
        return this
    }
    setCallBack(callbackObj){
        if ( ({}).toString(callbackObj) !== '[object Object]' ) return this
        for (let name in callbackObj ) {
            if ( this.callback[name] && typeof callbackObj[name] === 'function' ) {
                this.callback[name] = callbackObj[name]
            }
        }
        return this
    }
    runCallBack(name){
        if ( name && typeof this.callback[name] === 'function'){
            this.callback[name].call(this , name , this)
        }
        return this
    }
    setVolume(val){
        this.volumeCurrent = typeof val === 'number' && val >= 0 && val <= 1 ? val : this.volumeCurrent
        return this.reVolume()
    }
    setAudioCurrentIndex(n){
        this.lastPlayIndex = this.audioCurrentIndex
        if ( n === void 0 ) return this
        if ( this.audioList.length && this.audioCurrentIndex+n >= this.audioList.length ){
            this.audioCurrentIndex = this.audioList.length-1
            return this
        } 
        if ( this.audioCurrentIndex+n < 0 ) {
            this.audioCurrentIndex = 0
            return this
        }
        this.audioCurrentIndex += n
        return this
    }
    setErrorAudio(){
        !this.errorArray.includes(this.audioList[this.audioCurrentIndex]) && this.errorArray.push(this.audioList[this.audioCurrentIndex])
        return this
    }
    getErrorAudio(source){
        if ( source && typeof source === 'string' && this.errorArray.includes(source) ) 
            return true
        if ( source && typeof source === 'number' && source < this.audioList.length && source >= 0 && this.errorArray.includes(this.audioList[source]) ) 
            return true
        return source === void 0 && this.errorArray.includes(this.audioList[this.audioCurrentIndex]) ? true : false
    }
    getStep(){
        if ( this.mode === P_MODE_SINGLE ) return 0
        if ( this.mode === P_MODE_CIRCULATION ){
            return (this.audioCurrentIndex+1)%this.audioList.length - this.audioCurrentIndex
        }
        if ( this.mode === P_MODE_RANDOM ) {
            return Math.floor(Math.random() * (this.audioList.length - 0) + 0) - this.audioCurrentIndex
        }
        return 1*this.playDir//this.mode === P_MODE_ORDER
    }
    pause(){
        this.audioCurrent && this.audioCurrent.pause()
        return this.reState(P_PAUSE)
    }
    reload(){
        if( this.audioCurrent ){
            this.audioCurrent.load()
        }
        return this
    }
    audioPlay(){
        if (this.audioCurrent ) {
            this.audioCurrent.play()
        }
        return this
    }
    reVolume(){
        if( this.audioCurrent )
            this.audioCurrent.volume = this.volumeCurrent
        return this
    }
    loading(){
        if ( this.audioList.length && this.audioCurrentIndex < this.audioList.length && this.audioCurrentIndex >= 0 ) { // loading    
            this.reAbort().reState()
            this.audioCurrent.src = this.audioList[this.audioCurrentIndex]
            this.abortHandler = setTimeout(()=>{
                let event = document.createEvent('Events')
                event.initEvent('emptied' , false , true)
                this.pause().audioCurrent.dispatchEvent(event)
            } , this.abortTime)
            return this.auto ? this.audioPlay() : this
        }
        return this
    }
    reState(state){
        this.state = state ? state : P_PADDING
        return this
    }
    reDir(dir){
        this.playDir = dir ? dir*P_DIR : P_DIR
        return this
    }
    reAbort(){
        clearTimeout(this.abortHandler)
        this.abortHandler = null
        return this
    }
    addEvent(){
        this.eventHandler = {
            error:(e)=>{
                this.reAbort().reState(P_ERROR).setErrorAudio().runCallBack('error')
                return this.auto ? this.jump(this.mode === P_MODE_SINGLE ? (this.playDir === P_DIR ? 1 : -1) : this.getStep()) : this
            },
            loadstart:(e)=>{
                return this.reState(P_LOAD_START).runCallBack('loadstart')
            },
            loadedmetadata:(e)=>{
                return this.reAbort().reState(P_LOADING).filerErrorAudio().runCallBack('loading').reDir()
            },
            emptied:(e)=>{
                return this.reState(P_ABORT).runCallBack('abort')
            },
            canplay:(e)=>{
               return this.reState(P_PLAY).runCallBack('play')
            },
            playing:(e)=>{
                return this.reState(P_PLAYING).runCallBack('playing')
            },
            ended:(e)=>{ 
                this.reState(P_ENDED).runCallBack('end')
                return this.auto ? this.jump(this.getStep()) : this.setAudioCurrentIndex()
            }
        }
        for ( let eventName in this.eventHandler ){
            this.audioCurrent.addEventListener(eventName , this.eventHandler[eventName] , false)
        }
        return this
    }
    filerErrorAudio(){
        if ( !this.audioCurrent.src ) return this
        let audioCurrentSrc = this.audioCurrent.src
        this.errorArray = this.errorArray.filter((currentSrc)=>{
            return currentSrc != audioCurrentSrc
        })
        return this
    }
    removeEevent(){
        for ( let eventName in this.eventHandler ){
            this.audioCurrent.removeEventListener(eventName , this.eventHandler[eventName] , false)
        }
        return this.reAbort()
    }
}
