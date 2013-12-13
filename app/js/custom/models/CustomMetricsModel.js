Custom.models.CustomMetricsModel = function() {
	var constr = Custom.utils.copyMethods(MediaPlayer.models.MetricsModel);

	constr.setManifest = function(streamType,manifest) {
		this.getMetricsFor(streamType).manifest = manifest;
	};

	return constr;
};

Custom.models.CustomMetricsModel.prototype = {
	constructor: Custom.models.CustomMetricsModel
};