var audioFiles = [
    "http://www.teanglann.ie/CanC/nua.mp3",
    "http://www.teanglann.ie/CanC/ag.mp3",
    "http://www.teanglann.ie/CanC/dul.mp3",
    "http://www.teanglann.ie/CanC/freisin.mp3"
];

function selectTracks() {
    
    // Here we select 2 tracks to fill the playlist;
    let tracks = this.options.playlist_track;
    
    // Get Tracks based on time;
    let trackIndex = parseInt(getDateTime().h);
    
    // Assign first and second track to variables;
    let firstTrack = this.options.playlist_track[trackIndex];
    let secondTrack = this.options.playlist_track[trackIndex + 1];
    
    // Based on 24 hours clock, if it's eleven o clock, go back to 0, start the playlist over.
    if (trackIndex == 23) {
        secondTrack = this.options.playlist_track[0];
    }
    
    // add those into an array to return;
    let tracks_array = [
        firstTrack,
        secondTrack
    ];
    
    return tracks_array;
    
}

var secondsToTime = function(secs) {
    var hours = Math.floor(secs / (60 * 60));

    var divisor_for_minutes = secs % (60 * 60);
    var minutes = Math.floor(divisor_for_minutes / 60);

    var divisor_for_seconds = divisor_for_minutes % 60;
    var seconds = Math.ceil(divisor_for_seconds);

    let ms = minutes * 60 + seconds;
    
    return ms;
}
    
var getDateTime = function() {

    let date = new Date();
    let datetext = date.toTimeString();
    
    datetext = datetext.split(' ')[0];
    
    let a = datetext.split(':');
    
    // minutes are worth 60 seconds. Hours are worth 60 minutes.
    let time = (+a[0]) * 60 * 60 + (+a[1]) * 60 + (+a[2]);
    
    console.log('hours is ' + a[0] + ' minute is ' + a[1] + ' seconds are ' + a[2]);
    
    let time_obj = {
        "h": a[0],
        "m": a[1],
        "s": a[2]
    };

    return time_obj;

};

function addAudioSetting() {
    const _this = this;
    const getTimeObj = getDateTime();
    
    let time = (+getTimeObj.h) * 60 * 60 + (+getTimeObj.m) * 60 + (+getTimeObj.s);
    let currentTimeToPlay = secondsToTime(time);
    
    this.audioElement.currentTime = currentTimeToPlay;
}

function preloadAudio(url) {
    var audio = new Audio();
    // once this file loads, it will call loadedAudio()
    // the file will be kept by the browser as cache
    audio.addEventListener('canplaythrough', loadedAudio, false);
    audio.src = url;
}
    
var loaded = 0;
function loadedAudio() {
    // this will be called every time an audio file is loaded
    // we keep track of the loaded files vs the requested files
    loaded++;
    if (loaded == audioFiles.length){
    	// all have loaded
    	init();
    }
}
    
var player = document.getElementById('player');
function play(index) {
    player.src = audioFiles[index];
    player.play();
}

var btnStart = document.getElementById('btn_enter');
function init() {
    // do your stuff here, audio has been loaded
    // for example, play all files one after the other
    var i = 0;
    // once the player ends, play the next one
    player.onended = function() {
    	i++;
        if (i >= audioFiles.length) {
            // end 
            return;
        }
    	play(i);
    };
    // play the first file
    btnStart.addEventListener('click', function() {
        play(i);
    });
}
    
// we start preloading all the audio files
for (var i in audioFiles) {
    preloadAudio(audioFiles[i]);
}