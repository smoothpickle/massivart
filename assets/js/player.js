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
        startBtnSelector: '#btnEnter',
        shapes: []
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
    
    var insertAfter = function(newNode, existingNode) {
        existingNode.parentNode.insertBefore(newNode, existingNode.nextSibling);
    }

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
            
            this.audioLoadedCount = 0;
            this.currentDate = {};
            this.selectedTrack = [];
            
            // find all matching DOM elements.
            // makes `.selectors` object available to instance.
            //this.selectors = document.querySelectorAll( this.options.selector );
            
            // set currentDate running
            this.getCurrentDate();
            
            // preloading all the audio files
            this.preloadAudioFiles();
            
            // Create clocks
            this.createClock();
            
            // Create clocks animations
            this.createShapes();

        },
        
        removeLoadingScreen: function() {
            
            document.querySelector('.loading').classList.add('fadeOut');
            
            // function removeFadeOut( el, speed ) {
            //     var seconds = speed/1000;
            //     el.style.transition = "opacity "+seconds+"s ease";

            //     el.style.opacity = 0;
            //     setTimeout(function() {
            //         el.parentNode.removeChild(el);
            //     }, speed);
            // }

            // removeFadeOut(document.getElementById('test'), 2000);
            
            // all have loaded
            document.querySelector('html').classList.add('audio-loaded');
        },
        
        preloadAudioFiles: function() {
            
            let _this = this;
            
            this.selectedTracks = this.selectTracks();
            
            for (var i in _this.selectedTracks) {
                _this.createAudioNode(_this.selectedTracks[i]);
            }
            
        },
        
        loadedAudio: function(_thisRef) {
            
            // this will be called every time an audio file is loaded
            // we keep track of the loaded files vs the requested files
            console.log(_thisRef.audioLoadedCount + ' == ' + _thisRef.selectedTracks.length)
            if (_thisRef.audioLoadedCount === _thisRef.selectedTracks.length) {
                //init();
                _thisRef.removeLoadingScreen();
            }
        },
        
        createAudioNode: function(url) {
            let _this = this;
            let audio = new Audio();
            // once this file loads, it will call loadedAudio()
            // the file will be kept by the browser as cache
            this.audioLoadedCount++;
            audio.addEventListener('canplaythrough', _this.loadedAudio(_this), false);
            audio.src = url;
        },
                
        addAudioSetting: function() {
            const _this = this;
            const getTimeObj = getDateTime();
            
            let time = (+_this.currentDate.h) * 60 * 60 + (+_this.currentDate.m) * 60 + (+_this.currentDate.s);
            let currentTimeToPlay = secondsToTime(time);
            
            this.audioElement.currentTime = currentTimeToPlay;
        },
        
        selectTracks: function() {
            
            let _this = this;
        
            // Here we select 2 tracks to fill the playlist;
            let tracks = this.options.playlist_track;
            
            // Get Tracks based on time;
            let trackIndex = parseInt(_this.currentDate.h);
            
            // Assign first and second track to variables;
            let firstTrack = tracks[trackIndex];
            let secondTrack = tracks[trackIndex + 1];
            
            // Based on 24 hours clock, if it's eleven o clock, go back to 0, start the playlist over.
            if (trackIndex == 23) {
                secondTrack = tracks[0];
            }
            
            // add those into an array to return;
            let tracks_array = [
                firstTrack,
                secondTrack
            ];
            
            return tracks_array;
            
        },
        
        getCurrentDate: function() {
            
            // Get current time and date
            let date = new Date();
            
            let hr = date.getHours();
            let min = date.getMinutes();
            let sec = date.getSeconds();
            
            let currentDate = {
                "h": hr,
                "m": min,
                "s": sec
            };
            
            //Reference this for other use
            this.currentDate.h = currentDate.h;
            this.currentDate.m = currentDate.m;
            this.currentDate.s = currentDate.s;

            //return currentDate;
        },
        
        createClock: function() {
            
            const _this = this;
            
            // hour hand
            let hourHand = document.querySelector('.hour');
            // minute hand 
            let minuteHand = document.querySelector('.minute');
            // second hand
            let secondHand = document.querySelector('.second');
            
            let count = 0;
            // function that rotates the hands
            function rotate() {
                
                count++;
                // get the current Date object from which we can obtain the current hour, minute and second
                const currentDate = _this.getCurrentDate();

                // get the hours, minutes and seconds
                const hours = _this.currentDate.h;
                const minutes = _this.currentDate.m;
                const seconds = _this.currentDate.s;

                // rotating fraction --> how many fraction to rotate for each hand.
                const secondsFraction = seconds / 60;
                const minutesFraction = (secondsFraction + minutes) / 60;
                const hoursFraction = (minutesFraction + hours) / 12;

                // actual deg to rotate
                const secondsRotate = secondsFraction * 360;
                const minutesRotate = minutesFraction * 360;
                const hoursRotate = hoursFraction * 360;

                // apply the rotate style to each element
                // use backtick `` instead of single quotes ''
                // secondHand.style.transform = `rotate(${secondsRotate}deg)`;
                minuteHand.style.transform = `rotate(${minutesRotate}deg)`;
                hourHand.style.transform = `rotate(${hoursRotate}deg)`;
                
                if (count == 1) {
                    document.querySelector('html').classList.add('clock-loaded');
                }
            }

            // for every 1000 milliseconds(ie, 1 second) interval, activate the rotate() function.
            setInterval(rotate, 1000);
            
        },
        
        createShapes: function() {
            
            let _this = this;
            
            const shapesWrapperDiv = document.createElement("div");
            shapesWrapperDiv.setAttribute('id', 'shapes-wrapper');
            
            for (let i = 0; i < _this.options.shapes.length; i++) {
                let img = document.createElement("div");
                img.setAttribute('class', `shape${i+1}`);
                img.style.backgroundImage = `url(${_this.options.shapes[i]})`;
                shapesWrapperDiv.appendChild(img);
            }
            
            insertAfter(shapesWrapperDiv, document.querySelector('.clock-wrapper'));
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