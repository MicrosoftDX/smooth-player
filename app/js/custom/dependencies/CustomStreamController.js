//in
Custom.dependencies.CustomStreamController = function (){
    var rslt = Custom.utils.copyMethods(Custom.dependencies.CustomStreamController);
    rslt.load = function(url) {
        console.log("Custom.dependencies.CustomStreamController::load",url);
        Custom.dependencies.CustomStreamController.prototype.load.call(this,url);
    };

    return rslt;
};
Custom.dependencies.CustomStreamController.prototype = new MediaPlayer.dependencies.StreamController();
Custom.dependencies.CustomStreamController.prototype.constructor = Custom.dependencies.CustomStreamController;


