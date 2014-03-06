
Custom.models.CustomMetricsModel = function () {
    "use strict";
    var rslt = Custom.utils.copyMethods(MediaPlayer.models.MetricsModel);

    rslt.addRepresentationBoundaries = function (streamType, t, min, max) {
        var vo = new MediaPlayer.vo.metrics.RepresentationBoundaries();

        vo.t = t;
        vo.min = min;
        vo.max = max;

        this.parent.getMetricsFor(streamType).RepBoundariesList.push(vo);
        return vo;
    };

    rslt.addDownloadSwitch = function (streamType, startTime, downloadTime, quality) {
        var ds = new Custom.vo.metrics.DownloadSwitch();

        ds.type = streamType;
        ds.mediaStartTime = startTime;
        ds.downloadStartTime = downloadTime;
        ds.quality = quality;

        this.parent.getMetricsFor(streamType).DwnldSwitchList = [ds];
        return ds;
    };

    return rslt;
};

Custom.models.CustomMetricsModel.prototype = {
    constructor: Custom.models.CustomMetricsModel
};
