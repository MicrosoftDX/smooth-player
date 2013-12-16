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



    var returnValue = Custom.utils.copyMethods(Dash.dependencies.DashMetricsExtensions);
    returnValue.getRepresentationForId = function(repId) {
        return findRepresentionInPeriodArray(this.manifestModel.getValue().Period_asArray,repId);
    };
    return returnValue;
};

Custom.dependencies.CustomMetricsExtensions.prototype = {
    constructor: Custom.dependencies.CustomMetricsExtensions
};
