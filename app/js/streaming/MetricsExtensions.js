/*
 * The copyright in this software module is being made available under the BSD License, included below. This software module may be subject to other third party and/or contributor rights, including patent rights, and no such rights are granted under this license.
 * The whole software resulting from the execution of this software module together with its external dependent software modules from dash.js project may be subject to Orange and/or other third party rights, including patent rights, and no such rights are granted under this license.
 *
 * Copyright (c) 2014, Orange
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without modification, are permitted provided that the following conditions are met:
 * •  Redistributions of source code must retain the above copyright notice, this list of conditions and the following disclaimer.
 * •  Redistributions in binary form must reproduce the above copyright notice, this list of conditions and the following disclaimer in the documentation and/or other materials provided with the distribution.
 * •  Neither the name of the Orange nor the names of its contributors may be used to endorse or promote products derived from this software module without specific prior written permission.
 *
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS “AS IS” AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */
 MediaPlayer.dependencies.MetricsExtensions = function () {
    "use strict";

    var h264ProfileMap = {
        "42": "Baseline",
        "4D": "Main",
        "58": "Extended",
        "64": "High"
    };

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

    var rslt = MediaPlayer.utils.copyMethods(Dash.dependencies.DashMetricsExtensions);

    rslt.getDuration = function() {
        var self = this,
            manifest = self.manifestModel.getValue();

        var duration = manifest.Period.duration;

        if (duration !== Infinity) {
            return duration;
        }

        return -1;
    };

    rslt.getFormatForType = function(type) {
        var self = this,
            manifest = self.manifestModel.getValue();

        for(var i = 0;i<manifest.Period.AdaptationSet.length;i++)
        {
            var adaptation = manifest.Period.AdaptationSet[i];
            if (adaptation.type === type) {
                return adaptation.mimeType;
            }
        }

        return null;
    };

    rslt.getCodecForType = function(type) {
        var self = this,
            manifest = self.manifestModel.getValue();

        for(var i = 0;i<manifest.Period.AdaptationSet.length;i++)
        {
            var adaptation = manifest.Period.AdaptationSet[i];
            if (adaptation.type === type || adaptation.contentType === type) {
                //return codecs of the first Representation
                return adaptation.Representation[0].codecs;
            }
        }

        return null;
    };

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


    rslt.getH264ProfileLevel = function (codecs) {

        if (codecs.indexOf("avc1") < 0)
        {
            return "";
        }
        var profile = h264ProfileMap[codecs.substr(5, 2)];
        var level = parseInt(codecs.substr(9, 2), 16) / 10.0;

        return profile + "@" + level.toString();
    };

    rslt.getBitratesForType = function (type) {
        var self = this,
            manifest = self.manifestModel.getValue(),
            periodArray,
            period,
            periodArrayIndex,
            adaptationSet,
            adaptationSetArray,
            representation,
            representationArray,
            adaptationSetArrayIndex,
            representationArrayIndex,
            bitrateArray = [];

        if ((manifest === null) || (manifest === undefined)) {
            return null;
        }

        periodArray = manifest.Period_asArray;

        for (periodArrayIndex = 0; periodArrayIndex < periodArray.length; periodArrayIndex = periodArrayIndex + 1) {
            period = periodArray[periodArrayIndex];
            adaptationSetArray = period.AdaptationSet_asArray;
            for (adaptationSetArrayIndex = 0; adaptationSetArrayIndex < adaptationSetArray.length; adaptationSetArrayIndex = adaptationSetArrayIndex + 1) {
                adaptationSet = adaptationSetArray[adaptationSetArrayIndex];
                if (adaptationIsType.call(self, adaptationSet, type)) {
                    //order adaptation in bitrate ascending value
                    adaptationSet = self.manifestExt.processAdaptation(adaptationSet);
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

    rslt.getCurrentBandwidthBoundaries = function (metrics) {
        if (metrics === null) {
            return null;
        }

        var bandwidthBoundaries = metrics.BandwidthBoundariesList;

        if (bandwidthBoundaries === null || bandwidthBoundaries.length <= 0) {
            return null;
        }

        return bandwidthBoundaries[bandwidthBoundaries.length - 1];
    };

    return rslt;
};

MediaPlayer.dependencies.MetricsExtensions.prototype = {
    constructor: MediaPlayer.dependencies.MetricsExtensions
};
