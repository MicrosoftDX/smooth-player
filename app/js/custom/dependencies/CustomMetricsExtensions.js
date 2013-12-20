Custom.dependencies.CustomMetricsExtensions = function () {
    "use strict";

    var findRepresentionInPeriodArray = function (periodArray, representationId) {
        var period,
            adaptationSet,
            adaptationSetArray,
            representation,
            representationArray,
            periodArrayIndex,
            adaptationSetArrayIndex,
            representationArrayIndex;

        for (periodArrayIndex = 0; periodArrayIndex < periodArray.length; periodArrayIndex = periodArrayIndex + 1) {
            period = periodArray[periodArrayIndex];
            adaptationSetArray = period.AdaptationSet_asArray;
            for (adaptationSetArrayIndex = 0; adaptationSetArrayIndex < adaptationSetArray.length; adaptationSetArrayIndex = adaptationSetArrayIndex + 1) {
                adaptationSet = adaptationSetArray[adaptationSetArrayIndex];
                representationArray = adaptationSet.Representation_asArray;
                for (representationArrayIndex = 0; representationArrayIndex < representationArray.length; representationArrayIndex = representationArrayIndex + 1) {
                    representation = representationArray[representationArrayIndex];
                    if (representationId === representation.id) {
                        return representation;
                    }
                }
            }
        }

        return null;
    };

    var rslt = Custom.utils.copyMethods(Dash.dependencies.DashMetricsExtensions);

    rslt.getVideoWidthForRepresentation = function (representationId) {
        var self = this,
            manifest = self.manifestModel.getValue(),
            representation,
            periodArray = manifest.Period_asArray;

        representation = findRepresentionInPeriodArray.call(self, periodArray, representationId);

        if (representation === null) {
            return null;
        }

        return representation.width;
    };

    rslt.getVideoHeightForRepresentation = function (representationId) {
        var self = this,
            manifest = self.manifestModel.getValue(),
            representation,
            periodArray = manifest.Period_asArray;

        representation = findRepresentionInPeriodArray.call(self, periodArray, representationId);

        if (representation === null) {
            return null;
        }

        return representation.height;
    };



    rslt.getCodecsForRepresentation = function (representationId) {
        var self = this,
            manifest = self.manifestModel.getValue(),
            representation,
            periodArray = manifest.Period_asArray;

        representation = findRepresentionInPeriodArray.call(self, periodArray, representationId);

        if (representation === null) {
            return null;
        }

        return representation.codecs;
    };

    rslt.getCurrentRepresentationBoundaries = function (metrics) {
        if (metrics === null) {
            return null;
        }

        var repBoundaries = metrics.RepBoundariesList;

        if (repBoundaries === null || repBoundaries.length <= 0) {
            return null;
        }

        return repBoundaries[repBoundaries.length - 1];
    };

    return rslt;
};

Custom.dependencies.CustomMetricsExtensions.prototype = {
    constructor: Custom.dependencies.CustomMetricsExtensions
};
