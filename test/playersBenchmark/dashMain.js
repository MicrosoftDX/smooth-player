
var player,
    video,
    context,
    videoSeries = [],
    audioSeries = [],
    maxGraphPoints = 50,
    updateInterval = 333;
        
function onLoaded() {
    
    

    function onError(e) {
        console.error(e);
    }

    ////////////////////////////////////////
    //
    // Player Setup
    //
    ////////////////////////////////////////

    video = document.querySelector("video");
   /* context = new Custom.di.CustomContext();
    player = new MediaPlayer(context);

    player.startup();
    player.addEventListener("error", onError.bind(this));
    video.addEventListener("play", function() {
        console.debug("play");-
    });

    video.addEventListener("playing", function() {
        console.debug("playing");
    });

    player.attachView(video);
    player.setAutoPlay(true);
    */
    //console.debug("attachSource");
    //player.attachSource('http://dash.edgesuite.net/dash264/TestCases/1a/netflix/exMPD_BIP_TC1.mpd');
    
    var results = [];
    
    
    // toTest();
    // var result = Q(null);
    // var i = 1;
    // while(i>0) {
    //     console.debug(i);
    //     result = result.then(toTest);
    //     i--;
    // }
    
    /*result.finally(function() {
        document.getElementById("result").innerHTML = JSON.stringify(results) + ' moy : '+moyenne(results)+'ms';
        //video.pause();
    });*/

}


function startVideo() {
    toTest();
}

function toTest() {
    /*console.log("toTest");
    var deferred = Q.defer();
    video.addEventListener("playing", function() {
        if (!deferred.promise.isFulfilled()) {
            results.push(new Date() - startTime);
            console.error(results);
            deferred.resolve();
        }
    });

    var startTime = new Date();*/
    context = new Custom.di.CustomContext();
    //context = new Dash.di.DashContext();
    player = new MediaPlayer(context);
    player.startup();
    player.attachView(video);
    player.setAutoPlay(true);
    //player.attachSource('http://2is7server1.rd.francetelecom.com/C4/C4-46_S2.isml/Manifest');
    player.attachSource('http://2is7server1.rd.francetelecom.com/VOD/BBB-SD/big_buck_bunny_1080p_stereo.ism/Manifest');

    /*return deferred.promise;*/
};




