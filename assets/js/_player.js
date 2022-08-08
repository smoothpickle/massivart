// Player for Extraction minière
//
// Author: Sébastien Gilbert (seb.gilbert23@gmail.com)
//
// Project: Based on a 24 hours clock, a set of tracks will play according to current time. So if it's 17:34:58, then the playlist will start playing the 17th track from an array, then currentTime will be set at 34 minutes and 58 seconds. All this considering the fact that all tracks are seperated into 24 distinct tracks of 1 hours each exactly.

( function( root, factory ) {

    var pluginName = 'player';

    if ( typeof define === 'function' && define.amd ) {
        define( [], factory( pluginName ) );
    } else if ( typeof exports === 'object' ) {
        module.exports = factory( pluginName );
    } else {
        root[ pluginName ] = factory( pluginName );
    }
}( this, function( pluginName ) {

    'use strict';

    var defaults = {
        selector: '.yourSelector',
        someDefaultOption: 'foo',
        classToAdd: "new-class-name",
        audioSelector: '#audio',
        playlist_track: [],
        pageLoaderSelector: '#loader',
        startBtnSelector: '#btn_enter'
    };
    /**
     * Merge defaults with user options
     * @param {Object} defaults Default settings
     * @param {Object} options User options
     */
    var extend = function( target, options ) {
        var prop, extended = {};
        for ( prop in defaults ) {
            if ( Object.prototype.hasOwnProperty.call( defaults, prop ) ) {
                extended[ prop ] = defaults[ prop ];
            }
        }
        for ( prop in options ) {
            if ( Object.prototype.hasOwnProperty.call( options, prop ) ) {
                extended[ prop ] = options[ prop ];
            }
        }
        return extended;
    };

    /**
     * Helper Functions
     @private
     */
    var privateFunction = function() {
        // Helper function, not directly acessible by instance object
        console.log('private funct');
    };

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

    /**
     * Plugin Object
     * @param {Object} options User options
     * @constructor
     */
    function Plugin( options ) {
        this.options = extend( defaults, options );

        this.init(); // Initialization Code Here
    }

    /**
     * Plugin prototype
     * @public
     * @constructor
     */
    Plugin.prototype = {
        
        init: function() {
            // find all matching DOM elements.
            // makes `.selectors` object available to instance.
            //this.selectors = document.querySelectorAll( this.options.selector );
            this.audioElement = document.getElementById( this.options.audioSelector );
            this.isAudioReadyToPlay = false;
            this.isLoaderRemoved = false;

            this.createPlaylist();
            this.createButtons();

        },
        
        addAudioSetting: function() {
            const _this = this;
            const getTimeObj = getDateTime();
            
            let time = (+getTimeObj.h) * 60 * 60 + (+getTimeObj.m) * 60 + (+getTimeObj.s);
            let currentTimeToPlay = secondsToTime(time);
            
            this.audioElement.currentTime = currentTimeToPlay;
        },
        
        createButtons: function() {
            const _this = this;
            const startBtn = document.querySelector(this.options.startBtnSelector);
            const loaderElement = document.querySelector(this.options.pageLoaderSelector);
            
            startBtn.addEventListener('click', function() {
                _this.addAudioSetting();
                _this.playAudio();
                loaderElement.remove();
            });
            
        },
        
        playAudio: function() {
            const _this = this;
            
            if (this.isAudioReadyToPlay) {
                
                this.audioElement.play();
            }
        },
        
        selectTracks: function() {
            
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
            
        },
        
        createPlaylist: function() {

            const _this = this;
            
            // Playlist array
            const files = this.selectTracks();
            console.log(files);

            // Current index of the files array
            let i = 0;

            // Get the audio element
            //var music_player = document.querySelector("#music_list audio");
            //var music_player = this.options.playlist_track;
            const music_player = this.audioElement;
            
            function preloadAudio(url) {
                var audio = new Audio();
                // once this file loads, it will call loadedAudio()
                // the file will be kept by the browser as cache
                audio.addEventListener('canplaythrough', _this.preloadedAudio(audio), false);
                audio.src = url;
            }
            
            // we start preloading all the audio files
            for (var j in files) {
                preloadAudio(files[j]);
            }
            
            // function for moving to next audio file
            function next() {
                
                // Check for last audio file in the playlist
                if (i === files.length - 1) {
                    i = 0;
                    
                } else {
                    i++;
                }
                
                console.log(i);

                // Change the audio element source
                music_player.src = files[i];
                music_player.load();
                music_player.play();
            }

            // Check if the player is selected
            if (music_player === null) {
                console.log("Playlist Player does not exists ...");
            } else {
                // Start the player
                music_player.src = files[i];
                
                // Listen when the first track can start playing
                music_player.addEventListener('canplaythrough', (event) => {
                    console.log('I think I can play through the entire audio without ever having to stop to buffer.');
                    _this.audioReady();
                });
                
                // Listen for the music ended event, to play the next audio file
                music_player.addEventListener('ended', next, false);
            }
        },
        
        preloadedAudio: function(el) {
            console.log(el);
        },
        
        removeLoader: function() {
            // Remove loader
            const loaderElement = document.querySelector(this.options.pageLoaderSelector);
            const loadingElement = loaderElement.querySelector('.section-loading');
            const enterBtnElement = loaderElement.querySelector(this.options.startBtnSelector);

            loadingElement.classList.add('fadeOut');
            loadingElement.style.opacity = '0';
            setTimeout(() => loadingElement.remove(), 400);
            enterBtnElement.style.opacity = '1';
            this.isLoaderRemoved = true;
        },
        
        audioReady: function() {
            
            this.isAudioReadyToPlay = true;
            
            if (this.isLoaderRemoved === false) {
                this.removeLoader();
            }
        },
        
        destroy: function() {
            // Remove any event listeners and undo any "init" actions here...
        },
        doSomething: function( someData ) {
            console.log( someData )
        } // #! doSomething
    };
    return Plugin;
} ) );


/**************
    EXAMPLE:
**************/

//// create new Plugin instance
// var pluginInstance = new player({
//     selector: "audio",
//     someDefaultOption: 'foo2',
//     classToAdd: "custom-new-class-name",
// })

// //// access public plugin methods
// pluginInstance.doSomething("Doing Something Else")