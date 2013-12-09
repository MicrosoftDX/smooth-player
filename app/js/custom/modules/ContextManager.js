Custom.modules.ContextManager = function (){
    "use strict";

    return {
        system: undefined,
        logger: undefined,

        setContext: function(ctx) {
            this.logger.debug("Custom.modules.ContextManager::setContext",ctx);
            if (ctx === "MSS") {
                // here we map specific Class
                // this.system.mapClass('fragmentLoader', Mss.dependencies.FragmentLoader);
                // this.system.mapValue('metricsExt', this.system.getObject('mssMetricsExt'));
            } else {
                // this.system.mapClass('fragmentLoader', MediaPlayer.dependencies.FragmentLoader);
                // this.system.mapValue('metricsExt', this.system.getObject('dashMetricsExt'));
            }
        }
    };
};

Custom.modules.ContextManager.prototype =  {
    constructor: Custom.modules.ContextManager
};


