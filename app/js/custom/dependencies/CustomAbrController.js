
Custom.dependencies.CustomAbrController = function () {
    "use strict";
    var rslt = Custom.utils.copyMethods(MediaPlayer.dependencies.AbrController);

    rslt.metricsExt = undefined;
    
    rslt.getPlaybackQuality = function (type, data)
    {
        var self = this;
        var deferred = Q.defer();

        this.parent.getPlaybackQuality.call(this, type, data).then(
            function (result)
            {
                var minBitrateIdx = self.metricsExt.getMinBitrateIdx();
                var maxBitrateIdx = self.metricsExt.getMaxBitrateIdx();
                var newQuality = result.quality;

                if (minBitrateIdx && (newQuality < minBitrateIdx))
                {
                    self.debug.log("New quality < minQuality => " + minBitrateIdx);
                    newQuality = minBitrateIdx;
                    self.parent.setPlaybackQuality.call(this, type, newQuality);
                }

                if (maxBitrateIdx && (newQuality > maxBitrateIdx))
                {
                    self.debug.log("New quality > maxQuality => " + maxBitrateIdx);
                    newQuality = maxBitrateIdx;
                    self.parent.setPlaybackQuality.call(this, type, newQuality);
                }

                deferred.resolve({quality: newQuality, confidence: result.confidence});
            }
        );

        return deferred.promise;
    }

    return rslt;
};

Custom.dependencies.CustomFragmentLoader.prototype = {
    constructor: Custom.dependencies.CustomFragmentLoader
};
