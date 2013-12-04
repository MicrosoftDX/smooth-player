
MediaPlayer.dependencies.Mp4Processor = function () {
    "use strict";

    var periodIndex = -1,
        adaptation = null,
        trackId = 1,
        duration = 0,
        timescale = 1,

        getTimescale = function () {
            var timescale = 1,
                representation,
                segmentInfo;

            // Check for segment information at adaptation level
            segmentInfo = this.manifestExt.getSegmentInfoFor(adaptation);

            // Else get segment information of the first representation
            if (segmentInfo === null)
            {
                segmentInfo = this.getSegmentInfoFor(adaptation.Representation_asArray[index]);
            }

            if (segmentInfo !== null && segmentInfo !== undefined && segmentInfo.hasOwnProperty("timescale"))
            {
                timescale = segmentInfo.timescale;
            }

            return timescale;
        },


        createMovieHeaderBox = function() {

            // Movie Header Box
            // This box defines overall information which is media-independent, and relevant to the
            // entire presentation considered as a whole.

            // Create MovieHeader box (mvhd)
            var mvhd = new MovieHeaderBox();

            mvhd.version = 1; // version = 1  in order to have 64bits duration value
            mvhd.creation_time = 0; // the creation time of the presentation => ignore (set to 0)
            mvhd.modification_time = 0; // the most recent time the presentation was modified => ignore (set to 0)
            mvhd.timescale = timescale; // the time-scale for the entire presentation => take timescale of current adaptationSet
            mvhd.duration = Math.round(duration * timescale); // the length of the presentation (in the indicated timescale) =>  take duration of period
            mvhd.rate = 0x00010000; // 16.16 number, "1.0" = normal playback
            mvhd.volume = 0x0100; // 8.8 number, "1.0" = full volume
            mvhd.reserved = [0x0, 0x0];
            mvhd.matrix = [0x00010000, 0x0, 0x0, 0x0, 0x00010000, 0x0, 0x0, 0x0, 0x40000000];   // provides a transformation matrix for the video; (u,v,w) are restricted here to (0,0,1),
                                                                                                // hex values (0,0,0x40000000)
            mvhd.pre_defined = [0x0, 0x0, 0x0, 0x0, 0x0, 0x0];
            mvhd.next_track_ID = trackId + 1; // indicates a value to use for the track ID of the next track to be added to this presentation

            return mvhd;
        },

        createTrackBox = function(representation) {

            // Track Box: This is a container box for a single track of a presentation
            // Track Header Box: This box specifies the characteristics of a single track

            // Create Track box (trak)
            var trak = new TrackBox();
            trak.boxes = new Array();

            // Create and add TrackHeader box (trak)
            var tkhd = new TrackHeaderBox();

            tkhd.version = 1; // version = 1  in order to have 64bits duration value
            tkhd.creation_time = 0; // the creation time of the presentation => ignore (set to 0)
            tkhd.modification_time = 0; // the most recent time the presentation was modified => ignore (set to 0)
            tkhd.track_id = trackId; // uniquely identifies this track over the entire life-time of this presentation
            tkhd.reserved = 0;
            tkhd.duration = Math.round(duration * timescale); // the duration of this track (in the timescale indicated in the Movie Header Box) =>  take duration of period
            tkhd.layer = 0; // specifies the front-to-back ordering of video tracks; tracks with lower numbers are closer to the viewer => 0 since only one video track
            tkhd.alternate_group = 0; // specifies a group or collection of tracks => ignore
            tkhd.volume = 0x0100; // 8.8 number, "1.0" = full volume
            tkhd.matrix = [0x00010000, 0x0, 0x0, 0x0, 0x00010000, 0x0, 0x0, 0x0, 0x40000000];   // provides a transformation matrix for the video; (u,v,w) are restricted here to (0,0,1),
            tkhd.width = representation.maxWidth << 16;  // visual presentation size as fixed-point 16.16 values
            tkhd.height = representation.maxHeight << 16; // visual presentation size as fixed-point 16.16 values

            trak.boxes.push(tkhd);

            return trak;
        },

        doGenerateInitSegment = function (representation) {
            var manifest = this.manifestModel.getValue(),
                isLive = this.manifestExt.getIsLive(manifest);

            // Create Movie box (moov) 
            var moov = new MovieBox();
            moov.boxes = new Array();

            // Create and add MovieHeader box (mvhd)
            moov.boxes.push(createMovieHeaderBox.call(this));

            // Create and add Track box (trak)
            moov.boxes.push(createTrackBox.call(this, representation));

            // Create and add MovieExtends box (trak)
            //moov.boxes.push(createMovieExtendsBox.call(this, representation));


        },

        doProcessFragment = function (data) {
            var self = this;

            if (data !== null)
            {
                var f = new File();
                var processor = new DeserializationBoxFieldsProcessor(f, data, 0, data.length);
                f._processFields(processor);
                console.log(f);
            }
        };

    return {
        logger: undefined,
        manifestExt: undefined,
        manifestModel: undefined,
        system: undefined,
        errHandler: undefined,

        initialize: function (periodIndex, data) {

            var self = this,
                manifest = self.manifestModel.getValue(),
                isLive = self.manifestExt.getIsLive(manifest),

            periodIndex = periodIndex;
            adaptation = data;

            self.manifestExt.getDataIndex(adaptation, manifest, periodIndex).then(
                function (value) {
                    trackId = value + 1; // +1 since 0 is not a valid track ID value
                }
            );

            self.manifestExt.getDuration(manifest, isLive).then(
                function (value) {
                    duration = value;
                }
            );

            timescale = getTimescale.call(this);
        },

        generateInitSegment: doGenerateInitSegment,
        processFragment: doProcessFragment
    };
};

MediaPlayer.dependencies.Mp4Processor.prototype = {
    constructor: MediaPlayer.dependencies.Mp4Processor
};