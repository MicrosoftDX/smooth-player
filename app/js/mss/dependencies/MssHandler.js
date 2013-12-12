
Mss.dependencies.MssHandler = function() {

	var rslt = Custom.utils.copyMethods(Mss.dependencies.MssHandler),
		getIndex = function (adaptation, manifest) {

			var periods = manifest.Period_asArray,
				i, j;

			for (i = 0; i < periods.length; i += 1) {
				var adaptations = periods[i].AdaptationSet_asArray;
				for (j = 0; j < adaptations.length; j += 1) {
					if (adaptations[i] === adaptation) {
						return j;
					}
				}
			}

			return -1;
    	},
		
		getType = function (adaptation) {

			var type = (adaptation.mimeType !== undefined) ? adaptation.mimeType : adaptation.contentType;

			if (type.indexOf("video") != -1)
			{
				return "video";
			}
			else if (type.indexOf("audio") != -1)
			{
				return "audio";
			}
			else if (type.indexOf("text") != -1)
			{
				return "text";
			}

			return "und";
		},

		getRepresentationForQuality = function (quality, adaptation) {
			var representation = null;
			if (adaptation && adaptation.Representation_asArray && adaptation.Representation_asArray.length > 0) {
				representation = adaptation.Representation_asArray[quality];
			}
			return representation;
		},


        getTimescale = function (adaptation) {
            var timescale = 1,
                segmentInfo;

            // Check for segment information at adaptation level
            segmentInfo = rslt.manifestExt.getSegmentInfoFor(adaptation);

            // Else get segment information of the first representation
            if (segmentInfo === null)
            {
                segmentInfo = rslt.manifestExt.getSegmentInfoFor(adaptation.Representation_asArray[0]);
            }

            if (segmentInfo !== null && segmentInfo !== undefined && segmentInfo.hasOwnProperty("timescale"))
            {
                timescale = segmentInfo.timescale;
            }

            return timescale;
        },

		getDuration = function (manifest, isLive) {
			var duration = NaN;

			if (isLive) {
				duration = Number.POSITIVE_INFINITY;
			} else {
				if (manifest.mediaPresentationDuration) {
					duration = manifest.mediaPresentationDuration;
				} else if (manifest.availabilityEndTime && manifest.availabilityStartTime) {
					duration = (manifest.availabilityEndTime.getTime() - manifest.availabilityStartTime.getTime());
				}
			}

			return duration;
		},

		getInitData = function(quality, adaptation) {
			// return data in byte format
			// call MP4 lib to generate the init
			
			// Get required media information from manifest  to generate initialisation segment
			var representation = getRepresentationForQuality(quality, adaptation);
			if(representation){
				if(!representation.initData){
					var manifest = rslt.manifestModel.getValue();
					var isLive = rslt.manifestExt.getIsLive(manifest);

					var media = {}
					media.type = getType(adaptation);
					media.trackId = getIndex(adaptation, manifest) + 1; // +1 since track_id shall start from '1'
					media.timescale = getTimescale(adaptation);
					media.duration = getDuration(manifest, isLive);
					media.codecs = representation.codecs;
					media.codecPrivateData = representation.codecPrivateData;
					media.width = representation.width || adaptation.maxWidth;
					media.height = representation.height || adaptation.maxHeight;
					media.language = adaptation.lang ? adaptation.lang : 'und';

					representation.initData =  rslt.mp4Processor.generateInitSegment(media);
				}
				return representation.initData;
			}else{
				return null;
			}
			
	};
	
	rslt.manifestModel = undefined;
	rslt.manifestExt = undefined;
	rslt.mp4Processor = undefined;

	rslt.getInitRequest = function (quality, data) {
			var deferred = Q.defer();
            //Mss.dependencies.MssHandler.prototype.getInitRequest.call(this,quality,data).then(onGetInitRequestSuccess);
            var request = new MediaPlayer.vo.SegmentRequest();
            request.streamType = this.getType();
            request.type = "Initialization Segment";
            request.data = getInitData(quality, data);

            //console.saveBinArray(request.data, "moov.bin");
			deferred.resolve(request);

            return deferred.promise;
        };
	return rslt;
};

Mss.dependencies.MssHandler.prototype = new Dash.dependencies.DashHandler();
Mss.dependencies.MssHandler.prototype.constructor = Mss.dependencies.MssHandler;