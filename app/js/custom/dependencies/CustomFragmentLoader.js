Custom.dependencies.CustomFragmentLoader = function () {
    "use strict";
  console.log("Custom.dependencies.CustomFragmentLoader");
    
    var rslt = Custom.utils.copyMethods(MediaPlayer.dependencies.FragmentLoader);

    rslt.load = function(req){
         var deferred = Q.defer();
        // we already have the data so no need to do request
        if(req.type == "Initialization Segment" && req.data){
            deferred.resolve(req,{data:req.data});
        }else{
            deferred.promise = Custom.dependencies.CustomFragmentLoader.prototype.load.call(this,req);
        }

        return deferred.promise;
    };

    return rslt;
};

Custom.dependencies.CustomFragmentLoader.prototype = new MediaPlayer.dependencies.FragmentLoader();
Custom.dependencies.CustomFragmentLoader.prototype.constructor= Custom.dependencies.CustomFragmentLoader;