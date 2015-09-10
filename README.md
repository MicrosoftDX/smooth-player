# Smooth Player

SmoothStream.js is a JavaScript library to allow playback of videos without the need of Flash, Silverlight or any other plugin.
It is based on the W3C media premium extensions ([MSE](https://dvcs.w3.org/hg/html-media/raw-file/tip/media-source/media-source.html) and [EME] (https://dvcs.w3.org/hg/html-media/raw-file/tip/encrypted-media/encrypted-media.html).
In this early first release focus has been about supporting playback of files encoded using **Microsoft Smooth Streaming** with support for PIFF1.1 and PIFF1.3. Also there is support for playback of *encrypted* (DRM) files using **Microsoft Playready**. Basic functionality is cross browser (tested with IE11, Edge, Chrome and FF Developer Edition) but playing encrypted files works only with Edge and IE11.

Library is based on *hasplayer.js* project and on *dashjs* project.

## System Requirements
Windows 8.1 or Windows 10 with IE11 or Edge (Chrome and FF Developer also supported for non DRM videos).

## Playing with library
1. Download 'beta' branch.
2. Use any kind of local web server (i. e. npm install -g local-web-server )
3. Point local web server to the root folder
4. Open Edge/IE11 and go to http://localhost:[port]/samples/dash-if
5. Dash-if test player page should appear in browser.
6. Use a preselected MSS video and click 'Load' *or* enter a manifest URL and click 'Load'
7. Report any issue you found :)

## Building the library
Build process is using grunt.

### Install Dependencies

1. [install nodejs](http://nodejs.org/)
2. [install grunt](http://gruntjs.com/getting-started)
    * npm install -g grunt-cli

### Build / Run

1. Change directories to the build folder
    * cd build/
2. Install all Node Modules defined in package.json 
    * npm install
3. Run build task
    * grunt build


## License

All code in this repository is covered by the [BSD-3 license](http://opensource.org/licenses/BSD-3-Clause).
See LICENSE file for copyright details.


## Getting Started
Create a video element somewhere in your html. For our purposes, make sure to set the controls property to true.
```
<video id="videoPlayer" controls="true"></video>
```

Following code shows how to create a MediaPlayer object associated to the video element. First step is to create a MediaPlayer.di.Context and then create a MediaPlayer associated to it. Once we have the MediaPlayer object need to init it (calling startup method) and attach to the video tag using attachView. Finally method attachSource is called to set the URL of the video (really, the URL of the manifest) to play.
``` js
(function(){
    var url = "http://playready.directtaps.net/smoothstreaming/SSWSS720H264/SuperSpeedway_720.ism/Manifest";
    var context = new MediaPlayer.di.Context();
    var player = new MediaPlayer(context);
    player.startup();
    player.attachView(document.querySelector("#videoPlayer"));
    player.attachSource(url);
})();
```

### Change samples files for the dash-if page
If you want to use your own test streams from the dash-if test page, and don't want to enter the manifest URL each time, you can edit the file *samples/DASH-IF/json/sources.json*. This is a JSON file with the following structure:
```js
{
    "items": [
        {
            "type":"HLS",
            "name":"Apple BipBop",
            "url":"http://devimages.apple.com/iphone/samples/bipbop/bipbopall.m3u8",
            "browsers":"cdsbi"
        },
        {
        	//....
        }
    ]
}

```
Each item of the "items" array has following fields:
1. *type* -> Type of the video. Valid values are HLS (for Apple HLS videos), MSS (for Microsoft smooth stream videos) and DASH for standard MPEG-DASH videos. Support from HLS is inherited from *hasplayer.js* but **has not been really tested and it is not in the current focus**. Support from DASH is inherited from *dashjs* althought **using dashjs itself is a better option for playing MPEGDASH videos**. Current scope is about support for MSS files only.
2. *name* -> Name of stream
3. *url* -> Manifest URL
4. *browsers* -> Use 'cdsbi' value.


