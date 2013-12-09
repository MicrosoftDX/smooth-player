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

    var convertFragment = function (data, request) {

        var fragment = new File();
        var processor = new DeserializationBoxFieldsProcessor(fragment, data, 0, data.length);
        fragment._processFields(processor);
        console.log(fragment);

        var moof = getBoxByType(fragment, "moof");
        var traf = getBoxByType(moof, "traf");
        var tfxd = getBoxByType(traf, "tfxd");

        // Remove tfxd anf tfrf boxes
        removeBoxByType(traf, "tfxd");
        removeBoxByType(traf, "tfrf");

        // Create and add tfdt box
        var tfdt = getBoxByType(traf, "tfdt");
        if (tfdt === null)
        {
            var tfdt = new TrackFragmentBaseMediaDecodeTimeBox();
            tfdt.version = 1;
            tfdt.baseMediaDecodeTime = Math.floor(request.startTime * request.timescale);
            traf.boxes.push(tfdt);
        }

        var lp = new LengthCounterBoxFieldsProcessor(fragment);
        fragment._processFields(lp);
        var new_data = new Uint8Array(lp.res);          
        var sp = new SerializationBoxFieldsProcessor(fragment, new_data, 0);
        fragment._processFields(sp);

        return new_data;
    };

    var internalProcess = function (bytes, request) {
        "use strict";

        var self = this;

        var result = null;

        if (bytes !== null && bytes !== undefined && bytes.byteLength > 0) {
            result = new Uint8Array(bytes);
        }

        if (request && (request.type === "Media Segment"))
        {
            result = convertFragment(result, request);
        }

        return Q.when(result);
    };

    return {
        mp4Processor: undefined,

        process: internalProcess
    };
};

Mss.dependencies.MssFragmentController.prototype = {
    constructor: Mss.dependencies.MssFragmentController
};
