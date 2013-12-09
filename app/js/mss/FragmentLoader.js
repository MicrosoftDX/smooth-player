Mss.dependencies.FragmentLoader = function () {
    "use strict";
  console.log("Mss.dependencies.FragmentLoader");
    return {

        logger: undefined,
        metricsModel: undefined,

        getLoading: function () {
          console.log("Mss.dependencies.FragmentLoader::getLoading");
          return Mss.dependencies.FragmentLoader.prototype.getLoading.call(this);
        },

        load: function (req) {
          console.log("Mss.dependencies.FragmentLoader::load");
          return Mss.dependencies.FragmentLoader.prototype.load.call(this,req);
        }
    };
};


Mss.dependencies.FragmentLoader.prototype = new MediaPlayer.dependencies.FragmentLoader();
Mss.dependencies.FragmentLoader.prototype.constructor = Mss.dependencies.FragmentLoader;
