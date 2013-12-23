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

    var adaptationIsType = function (adaptation, bufferType) {
        var found = false;

        // TODO : HACK ATTACK
        // Below we call getIsVideo and getIsAudio and then check the adaptation set for a 'type' property.
        // getIsVideo and getIsAudio are adding this 'type' property and SHOULD NOT BE.
        // This method expects getIsVideo and getIsAudio to be sync, but they are async (returns a promise).
        // This is a bad workaround!
        // The metrics extensions should have every method use promises.

        if (bufferType === "video") {
            //found = this.manifestExt.getIsVideo(adaptation);
            this.manifestExt.getIsVideo(adaptation);
            if (adaptation.type === "video") {
                found = true;
            }
        }
        else if (bufferType === "audio") {
            //found = this.manifestExt.getIsAudio(adaptation); // TODO : Have to be sure it's the *active* audio track.
            this.manifestExt.getIsAudio(adaptation);
            if (adaptation.type === "audio") {
                found = true;
            }
        }
        else {
            found = false;
        }

        return found;
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

    rslt.getBitratesForType = function (type) {
        var self = this,
            manifest = self.manifestModel.getValue(),
            periodArray = manifest.Period_asArray,
            period,
            periodArrayIndex,
            adaptationSet,
            adaptationSetArray,
            representation,
            representationArray,
            adaptationSetArrayIndex,
            representationArrayIndex,
            bitrateArray = new Array();

        for (periodArrayIndex = 0; periodArrayIndex < periodArray.length; periodArrayIndex = periodArrayIndex + 1) {
            period = periodArray[periodArrayIndex];
            adaptationSetArray = period.AdaptationSet_asArray;
            for (adaptationSetArrayIndex = 0; adaptationSetArrayIndex < adaptationSetArray.length; adaptationSetArrayIndex = adaptationSetArrayIndex + 1) {
                adaptationSet = adaptationSetArray[adaptationSetArrayIndex];
                if (adaptationIsType.call(self, adaptationSet, type)) {
                    representationArray = adaptationSet.Representation_asArray;
                    for (representationArrayIndex = 0; representationArrayIndex < representationArray.length; representationArrayIndex = representationArrayIndex + 1) {
                        representation = representationArray[representationArrayIndex];
                        bitrateArray.push(representation.bandwidth);
                    }
                    return bitrateArray;
                }
            }
        }

        return bitrateArray;
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
