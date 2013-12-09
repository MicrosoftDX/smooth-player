Mss.dependencies.MssHandler = function(){
	var rslt = Custom.utils.copyMethods(Dash.dependencies.DashHandler),
		getInitData = function(quality, data){
			// return data in byte format
			// call MP4 lib to generate the init
			rslt.logger.debug("[MssHandler]", "TODO - do the initialization data ",this.manifestModel, quality, data);
			
			return new Uint8Array();
		};
	rslt.manifestModel = undefined;
	rslt.getInitRequest = function (quality, data) {
			var deferred = Q.defer();
            //Mss.dependencies.MssHandler.prototype.getInitRequest.call(this,quality,data).then(onGetInitRequestSuccess);

            var request = new MediaPlayer.vo.SegmentRequest();
            request.streamType = this.getType();
            request.type = "Initialization Segment";
            request.data = getInitData(quality, data);
			deferred.resolve(request);

            return deferred.promise;
        };
	return rslt;
};

Mss.dependencies.MssHandler.prototype = new Dash.dependencies.DashHandler();
Mss.dependencies.MssHandler.prototype.constructor = Mss.dependencies.MssHandler;