/*
 * The copyright in this software is being made available under the BSD License, included below. This software may be subject to other third party and contributor rights, including patent rights, and no such rights are granted under this license.
 * 
 * Copyright (c) 2013, Digital Primates
 * All rights reserved.
 * 
 * Redistribution and use in source and binary forms, with or without modification, are permitted provided that the following conditions are met:
 * •  Redistributions of source code must retain the above copyright notice, this list of conditions and the following disclaimer.
 * •  Redistributions in binary form must reproduce the above copyright notice, this list of conditions and the following disclaimer in the documentation and/or other materials provided with the distribution.
 * •  Neither the name of the Digital Primates nor the names of its contributors may be used to endorse or promote products derived from this software without specific prior written permission.
 * 
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS “AS IS” AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

Mss.dependencies.MssFragmentController = function () {
    "use strict";

    var getIndex = function (adaptation, manifest) {

            var periods = manifest.Period_asArray,
                i, j;

            for (i = 0; i < periods.length; i += 1) {
                var adaptations = periods[i].AdaptationSet_asArray;
                for (j = 0; j < adaptations.length; j += 1) {
                    if (adaptations[j] === adaptation) {
                        return j;
                    }
                }
            }

            return -1;
        },

        processTfrf = function(tfrf, adaptation) {

            // Get last timestamp of current timeline
            var segments = adaptation.SegmentTemplate.SegmentTimeline.S;

            // Go through entries
            var entries = tfrf.entry;
            for (var i = 0; i < entries.length; i++)
            {
                var fragment_absolute_time = entries[i].fragment_absolute_time;
                var fragment_duration = entries[i].fragment_duration;

                // Get timestamp of the last segment
                var lastSegment = segments[segments.length-1];
                var r = (lastSegment.r === undefined)?0:lastSegment.r;
                var t = lastSegment.t + (lastSegment.d * r);

                if (fragment_absolute_time > t)
                {
                    if (fragment_duration === lastSegment.d)
                    {
                        lastSegment.r = r + 1;
                    }
                    else
                    {
                        segments.push({
                            't': fragment_absolute_time,
                            'd': fragment_duration
                        });
                    }
                }
            }
        },

        convertFragment = function (data, request, adaptation) {

            // Get track id corresponding to adaptation set
            var manifest = rslt.manifestModel.getValue();
            var trackId = getIndex(adaptation, manifest) + 1; // +1 since track_id shall start from '1'

            // Create new fragment
            var fragment = new File();
            var processor = new DeserializationBoxFieldsProcessor(fragment, data, 0, data.length);
            fragment._processFields(processor);
            //console.log(fragment);

            // Get references en boxes
            var moof = getBoxByType(fragment, "moof");
            var mdat = getBoxByType(fragment, "mdat");
            var traf = getBoxByType(moof, "traf");
            var trun = getBoxByType(traf, "trun");
            var tfhd = getBoxByType(traf, "tfhd");

            // Update tfhd.track_ID field
            tfhd.track_ID = trackId;

            // Process tfxd boxes
            // This box provide absolute timestamp but we take the segment start time for tfdt
            removeBoxByType(traf, "tfxd");

            // Create and add tfdt box
            var tfdt = getBoxByType(traf, "tfdt");
            if (tfdt === null)
            {
                tfdt = new TrackFragmentBaseMediaDecodeTimeBox();
                tfdt.version = 1;
                tfdt.baseMediaDecodeTime = Math.floor(request.startTime * request.timescale);
                traf.boxes.push(tfdt);
            }

            // Process tfrf box
            var tfrf = getBoxByType(traf, "tfrf");
            if (tfrf !== null)
            {
                processTfrf(tfrf, adaptation);
                removeBoxByType(traf, "tfrf");                
            }

            // Before determining new size of the converted fragment we update some box flags related to data offset
            tfhd.flags &= 0xFFFFFE; // set tfhd.base-data-offset-present to false
            tfhd.flags |= 0x020000; // set tfhd.default-base-is-moof to true
            trun.flags |= 0x000001; // set trun.data-offset-present to true
            trun.data_offset = 0;   // Set a default value for trun.data_offset

            // Determine new size of the converted fragment
            // and allocate new data buffer
            var lp = new LengthCounterBoxFieldsProcessor(fragment);
            fragment._processFields(lp);
            var new_data = new Uint8Array(lp.res);

            // updata trun.data_offset field = offset of first data byte (inside mdat box)
            trun.data_offset = lp.res - mdat.size + 8; // 8 = 'size' + 'type' mdat fields length

            // Serialize converted fragment into output data buffer
            var sp = new SerializationBoxFieldsProcessor(fragment, new_data, 0);
            fragment._processFields(sp);

            return new_data;
        };
    
    var rslt = Custom.utils.copyMethods(MediaPlayer.dependencies.FragmentController);

    rslt.manifestModel = undefined;
    rslt.mp4Processor = undefined;

    rslt.process = function (bytes, request, adaptation) {
        var result = null;

        if (bytes !== null && bytes !== undefined && bytes.byteLength > 0) {
            result = new Uint8Array(bytes);
        }

        if (request && (request.type === "Media Segment"))
        {
            result = convertFragment(result, request, adaptation);
            //console.saveBinArray(result, request.streamType + "_" + request.quality + "_" + request.index + ".mp4");
        }

        return Q.when(result);
    };

    return rslt;
};

Mss.dependencies.MssFragmentController.prototype = {
    constructor: Mss.dependencies.MssFragmentController
};
