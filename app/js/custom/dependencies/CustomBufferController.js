
Custom.dependencies.CustomBufferController = function () {
    "use strict";

    var rslt = Custom.utils.copyMethods(MediaPlayer.dependencies.BufferController);
        
        rslt.fragmentController = undefined;
        rslt.sourceBufferExt = undefined;
    
    var mediaSource;

    rslt.initialize = function (type, periodInfo, data, buffer, videoModel, scheduler, fragmentController, source) {
        mediaSource = source;
        this.parent.initialize.apply(this,arguments);
    };

    rslt.emptyBuffer = function(){
        var deferred = Q.defer(),
            currentTime = Math.floor(this.videoModel.getCurrentTime()),
            removeStart = currentTime + 5,
            selfParent = rslt.parent,
            buffer = selfParent.getBuffer(),
            fragmentModel = rslt.fragmentController.attachBufferController(rslt),
            removeEnd;

        if(buffer.buffered.length > 0){
            var end = buffer.buffered.end(buffer.buffered.length - 1);
            removeEnd = end;
        }else{
            removeEnd =currentTime + 5;
        }
        
        console.info(removeStart, removeEnd);
        rslt.sourceBufferExt.remove(buffer,removeStart, removeEnd,selfParent.getPeriodInfo().duration, mediaSource).then(
            (function(){
                rslt.fragmentController.removeExecutedRequestsBeforeTime(fragmentModel,removeEnd);
                deferred.resolve();
            }));

        return deferred.promise;
    };

    return rslt;
};

Custom.dependencies.CustomBufferController.prototype = {
    constructor: Custom.dependencies.CustomBufferController
};
