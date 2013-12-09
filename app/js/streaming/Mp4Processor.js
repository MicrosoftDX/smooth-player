
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
                segmentInfo = this.manifestExt.getSegmentInfoFor(adaptation.Representation_asArray[0]);
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
            mvhd.flags = 0; //default value

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
            tkhd.flags = 0x1 | 0x2 | 0x4; //Track_enabled: Indicates that the track is enabled. Flag value is 0x000001. A disabled track (the low
                                         //bit is zero) is treated as if it were not present.
                                         //Track_in_movie: Indicates that the track is used in the presentation. Flag value is 0x000002.
                                         //Track_in_preview: Indicates that the track is used when previewing the presentation. Flag value is 0x000004.

            trak.boxes.push(tkhd);

            return trak;
        },

        getLanguageCode = function() {
            //declares the language code for this media. See ISO 639-2/T for the set of three character
            //codes. Each character is packed as the difference between its ASCII value and 0x60. Since the code
            //is confined to being three lower-case letters, these values are strictly positive.

            //NAN : dans le cas de la video, le champ contient quelle valeur?
            //pas défini dans la norme, retourne 0 pour le moment
            var result = 0;

            //lang member is define, get it. if not language is 'und'
            // if current adaptation is video type, return 'und'.
            var language = adaptation.lang ? adaptation.lang : 'und' ;

            //return value is packed on 15 bits, each character is defined on 5 bits
            // there is a padding value to align on 16 bits
            var firstLetterCode = (language.charCodeAt(0) - 96) << 10 ; //96 decimal base = 0x60
            var secondLetterCode = (language.charCodeAt(1) - 96) << 5;
            var thirdLetterCode = language.charCodeAt(2) - 96;

          
            result = firstLetterCode | secondLetterCode | thirdLetterCode;
            
            return result;
        },

        createMediaHeaderBox = function () {

            //mdhd : The media header declares overall information that is media-independent, and relevant to characteristics of
            //the media in a track.
            var mdhd = new MediaHeaderBox();

            mdhd.version = 1; // version = 1  in order to have 64bits duration value
            mdhd.creation_time = 0; // the creation time of the presentation => ignore (set to 0)
            mdhd.modification_time = 0; // the most recent time the presentation was modified => ignore (set to 0)
            mdhd.timescale = timescale; // the time-scale for the entire presentation => take timescale of current adaptationSet
            mdhd.duration = Math.round(duration * timescale); //integer that declares the duration of this media (in the scale of the timescale). If the
                                         //duration cannot be determined then duration is set to all 1s.
            mdhd.pad = 0; // padding for language value
            mdhd.language = getLanguageCode();
            
            mdhd.pre_defined = 0; // default value

            return mdhd;
        },

        createHandlerReferenceBox = function () {
            
            //This box within a Media Box declares the process by which the media-data in the track is presented, and thus,
            //the nature of the media in a track. For example, a video track would be handled by a video handler.
            var hdlr = new HandlerBox();
            
            hdlr.version = 0; // default value version = 0 
            hdlr.pre_defined = 0; //default value.
            if (adaptation.mimeType !== undefined) 
            {
                switch (adaptation.mimeType)
                {
                    case "video/mp4" :
                        hdlr.handler_type = hdlr.HANDLERTYPEVIDEO;
                        hdlr.name = hdlr.HANDLERVIDEONAME;
                        break;
                    case "audio/mp4" :
                        hdlr.handler_type = hdlr.HANDLERTYPEAUDIO;
                        hdlr.name = hdlr.HANDLERAUDIONAME;
                        break;
                    default :
                        hdlr.handler_type = hdlr.HANDLERTYPETEXT;
                        hdlr.name = hdlr.HANDLERTEXTNAME;
                        break;
                }
            }
            else
            {
                switch (adaptation.contentType)
                {
                    case "video" :
                        hdlr.handler_type = hdlr.HANDLERTYPEVIDEO;
                        hdlr.name = hdlr.HANDLERVIDEONAME;
                        break;
                    case "audio" :
                        hdlr.handler_type = hdlr.HANDLERTYPEAUDIO;
                        hdlr.name = hdlr.HANDLERAUDIONAME;
                        break;
                    default :
                        hdlr.handler_type = hdlr.HANDLERTYPETEXT;
                        hdlr.name = hdlr.HANDLERTEXTNAME;
                        break;
                }
            }
            
            hdlr.reserved = [0x0, 0x0]; //default value
            hdlr.flags = 0; //default value

            return hdlr;
        },

        createMediaInformationBox = function () {

            //This box contains all the objects that declare characteristic information of the media in the track.
            var minf = new MediaInformationBox();
            minf.boxes = new Array();
            
            //Create and add the adapted media header box (vmhd, smhd or nmhd) for audio, video or text.
            switch(adaptation.type)
            {
                case "video" :
                    minf.boxes.push(createVideoMediaHeaderBox.call(this));
                    break;
                case "audio" :
                    minf.boxes.push(createSoundMediaHeaderBox.call(this));
                    break;
                default :
                    //minf.boxes.push(createNullMediaHeaderBox.call(this));
                    break;
            }

            //Create and add Data Information Box (dinf)
            minf.boxes.push(createDataInformationBox.call(this));
             
            //Create and add Sample Table Box (stbl)
            minf.boxes.push(createSampleTableBox.call(this));

            return minf;

        },

        createDataInformationBox = function (){

            //The data information box contains objects that declare the location of the media information in a track.
            var dinf = new DataInformationBox();
            dinf.boxes = [];

            //The data reference object contains a table of data references (normally URLs) that declare the location(s) of
            //the media data used within the presentation
            var dref = new DataReferenceBox();

            dref.version = 0; //is an integer that specifies the version of this box default = 0
            dref.entry_count = 1; //is an integer that counts the actual entries
            dref.flags = 0; //default value

            //The DataEntryBox within the DataReferenceBox shall be either a DataEntryUrnBox or a DataEntryUrlBox.
            dref.boxes = [];
            
            //NAN : not used, but mandatory
            var url = new DataEntryUrlBox();
            url.location = "";

            //add data Entry Url Box in data Reference box
            dref.boxes.push(url);

            //add data Reference Box in data information box
            dinf.boxes.push(dref);

            return dinf;
        },

        createDecodingTimeToSampleBox = function () {
            
            //This box contains a compact version of a table that allows indexing from decoding time to sample number.
            var stts = new TimeToSampleBox();

            stts.version = 0; //is an integer that specifies the version of this box. default value = 0
            stts.entry_count = 0; //is an integer that gives the number of entries in the following table. not used in fragmented
                                  //content 
            stts.flags = 0; //default value = 0

            return stts;
        },

        createSampleToChunkBox = function () {

            //Samples within the media data are grouped into chunks.
            var stsc = new SampleToChunkBox();
                
            stsc.version = 0; //is an integer that specifies the version of this box. default value = 0.
            stsc.entry_count = 0; //is an integer that gives the number of entries in the following table
            
            return stsc;
        },

        createChunkOffsetBox = function () {

            //The chunk offset table gives the index of each chunk into the containing file
            var stco = new ChunkOffsetBox();

            stco.version = 0; //is an integer that specifies the version of this box. default value = 0
            stco.entry_count = 0;//is an integer that gives the number of entries in the following table
            stco.flags = 0; //default value
            
            return stco;
        },

        createSampleSizeBox = function () {
            
            //This box contains the sample count and a table giving the size in bytes of each sample. This allows the media
            //data itself to be unframed. The total number of samples in the media is always indicated in the sample count.
            var stsz = new SampleSizeBox();          

            stsz.version = 0; // default value = 0
            stsz.flags = 0; //default value = 0
            stsz.sample_count = 0; //is an integer that gives the number of samples in the track; if sample-size is 0, then it is
                                   //also the number of entries in the following table         
            stsz.sample_size = 0; //is integer specifying the default sample size.
            
            return stsz;
        },

        createVisualSampleEntry = function () {
            //representation.codecs pour savoir le type de codec video
            this.manifestExt.getCodec(adaptation).then(
            function(codec){
                switch (codec) {
                    case "avc" :
                        break;
                        //NAN : To do complete with other codec than H264
                }
            });
        },
        
        createAudioSampleEntry = function () {
          //representation.codecs pour savoir le type de codec audio
        },
        
        createSampleDescriptionBox = function () {
            
            //The sample description table gives detailed information about the coding type used, and any initialization
            //information needed for that coding.
            var stsd = new SampleDescriptionBox();
            stsd.boxes = [];
                /*NAN : ajouter ici les boxes
                 *       -stsd :
                 *           -avc1 :
                 *               -avcC
                 */
            switch(adaptation.type)
            {
                case "video" :
                    stsd.boxes.push(createVisualSampleEntry.call(this));
                    break;
                case "audio" :
                    stsd.boxes.push(createAudioSampleEntry.call(this));
                    break;
                default :
                    //NAN : To do add text entry
                    break;
            }          

            return stsd;
        },

        createSampleTableBox = function (){

            //The sample table contains all the time and data indexing of the media samples in a track. Using the tables
            //here, it is possible to locate samples in time, determine their type (e.g. I-frame or not), and determine their
            //size, container, and offset into that container.
            var stbl = new SampleTableBox();
            stbl.boxes = [];

            //create and add Decoding Time to Sample Box (stts)
            stbl.boxes.push(createDecodingTimeToSampleBox.call(this));

            //create and add Sample to Chunk Box (stsc)
            stbl.boxes.push(createSampleToChunkBox.call(this));
            
            //create and add Chunk Offset Box (stco)
            stbl.boxes.push(createChunkOffsetBox.call(this));

            //create and add Sample Size Box (stsz)
            stbl.boxes.push(createSampleSizeBox.call(this));
            
            //create and add Sample Description Box (stsd)
            stbl.boxes.push(createSampleDescriptionBox.call(this));

            return stbl;
        },

        createVideoMediaHeaderBox = function () {
            //The video media header contains general presentation information, independent of the coding, for video
            //media. Note that the flags field has the value 1.
            var vmhd = new VideoMediaHeaderBox();
            
            vmhd.version = 0; //default value, is an integer that specifies the version of this box
            vmhd.flags = 1; //default value
            vmhd.graphicsmode = 0;//specifies a composition mode for this video track, from the following enumerated set,
                                 //which may be extended by derived specifications: copy = 0 copy over the existing image
            vmhd.opcolor =  [0x0, 0x0, 0x0];//is a set of 3 colour values (red, green, blue) available for use by graphics modes
                                            //default value opcolor = {0, 0, 0};

            return vmhd;
        },

        createSoundMediaHeaderBox = function () {

            //The sound media header contains general presentation information, independent of the coding, for audio
            //media. This header is used for all tracks containing audio
            var smhd = new SoundMediaHeaderBox();

            smhd.version = 0; //default value, is an integer that specifies the version of this box
            smhd.balance = 0; //is a fixed-point 8.8 number that places mono audio tracks in a stereo space; 0 is centre (the
                           //normal value); full left is -1.0 and full right is 1.0.
            smhd.reserved = 0;

            return smhd;
        },

        createNullMediaHeaderBox = function () {
            //NAN non défini dans mp4lib, à définir
            //var nmhd = new NullMediaHeaderBox();
            //return nmhd;
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

            //Create container for the media information in a track (mdia)
            var mdia = new MediaBox();
            mdia.boxes = new Array();

            //Create and add Media Header Box (mdhd)
            mdia.boxes.push(createMediaHeaderBox.call(this));
            
            //Create and add Handler Reference Box (hdlr)
            mdia.boxes.push(createHandlerReferenceBox.call(this));

            //Create and add Media Information Box (minf)
            mdia.boxes.push(createMediaInformationBox.call(this));

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