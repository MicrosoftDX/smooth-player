Custom.modules.ContextManager = function (){
    "use strict";

    return {
        system: undefined,
        logger: undefined,

        setContext: function(ctx) {
            this.logger.debug("Custom.modules.ContextManager::setContext",ctx);
            if (ctx === "MSS") {
                // here we map specific Class
                this.system.mapClass('indexHandler', Mss.dependencies.MssHandler);
                // this.system.mapValue('metricsExt', this.system.getObject('mssMetricsExt'));
                this.system.mapClass('fragmentController', Mss.dependencies.MssFragmentController);
            } else {
                this.system.mapClass('fragmentLoader', MediaPlayer.dependencies.FragmentLoader);
                // this.system.mapValue('metricsExt', this.system.getObject('dashMetricsExt'));
                this.system.mapClass('fragmentController', Mss.dependencies.MssFragmentController);
            }
        }
    };
};

Custom.modules.ContextManager.prototype =  {
    constructor: Custom.modules.ContextManager
};


