Mss.dependencies.MssParser = function () {
    "use strict";

    var numericRegex = /^[-+]?[0-9]+[.]?[0-9]*([eE][-+]?[0-9]+)?$/;

    var matchers = [
        {
            type: "numeric",
            test: function (str) {
                return numericRegex.test(str);
            },
            converter: function (str) {
                return parseFloat(str);
            }
        }
    ];

    var getCommonValuesMap = function () {
        var adaptationSet,
            representation,
            subRepresentation,
            common;

        common = [
            {
                name: 'profiles',
                merge: false
            },
            {
                name: 'width',
                merge: false
            },
            {
                name: 'height',
                merge: false
            },
            {
                name: 'sar',
                merge: false
            },
            {
                name: 'frameRate',
                merge: false
            },
            {
                name: 'audioSamplingRate',
                merge: false
            },
            {
                name: 'mimeType',
                merge: false
            },
            {
                name: 'segmentProfiles',
                merge: false
            },
            {
                name: 'codecs',
                merge: false
            },
            {
                name: 'maximumSAPPeriod',
                merge: false
            },
            {
                name: 'startsWithSap',
                merge: false
            },
            {
                name: 'maxPlayoutRate',
                merge: false
            },
            {
                name: 'codingDependency',
                merge: false
            },
            {
                name: 'scanType',
                merge: false
            },
            {
                name: 'FramePacking',
                merge: true
            },
            {
                name: 'AudioChannelConfiguration',
                merge: true
            },
            {
                name: 'ContentProtection',
                merge: true
            }
        ];

        adaptationSet = {};
        adaptationSet.name = "AdaptationSet";
        adaptationSet.isRoot = false;
        adaptationSet.isArray = true;
        adaptationSet.parent = null;
        adaptationSet.children = [];
        adaptationSet.properties = common;
        

        representation = {};
        representation.name = "Representation";
        representation.isRoot = false;
        representation.isArray = true;
        representation.parent = adaptationSet;
        representation.children = [];
        representation.properties = common;
        adaptationSet.children.push(representation);
/*
        subRepresentation = {};
        subRepresentation.name = "SubRepresentation";
        subRepresentation.isRoot = false;
        subRepresentation.isArray = true;
        subRepresentation.parent = representation;
        subRepresentation.children = [];
        subRepresentation.properties = common;
        representation.children.push(subRepresentation);*/

        return adaptationSet;
    };

    var getSegmentValuesMap = function () {
        var period,
            adaptationSet,
            representation,
            common;

        common = [
            {
                name: 'SegmentBase',
                merge: true
            },
            {
                name: 'SegmentTemplate',
                merge: true
            },
            {
                name: 'SegmentList',
                merge: true
            }
        ];

        period = {};
        period.name = "Period";
        period.isRoot = false;
        period.isArray = false;
        period.parent = null;
        period.children = [];
        period.properties = common;

        adaptationSet = {};
        adaptationSet.name = "AdaptationSet";
        adaptationSet.isRoot = false;
        adaptationSet.isArray = true;
        adaptationSet.parent = period;
        adaptationSet.children = [];
        adaptationSet.properties = common;
        period.children.push(adaptationSet);

        representation = {};
        representation.name = "Representation";
        representation.isRoot = false;
        representation.isArray = true;
        representation.parent = adaptationSet;
        representation.children = [];
        representation.properties = common;
        adaptationSet.children.push(representation);

        return period;
    };

    var getBaseUrlValuesMap = function () {
        var mpd,
            period,
            adaptationSet,
            representation,
            common;

        common = [];

        mpd = {};
        mpd.name = "mpd";
        mpd.isRoot = true;
        mpd.isArray = true;
        mpd.parent = null;
        mpd.children = [];
        mpd.properties = common;
        mpd.transformFunc = function(node) {
            if(this.isTransformed) {
                return node;
            }
            this.isTransformed = true;
            return {
                profiles: "urn:mpeg:dash:profile:isoff-live:2011",
                type: node.isLive ? "dynamic" : "static",
                timeShiftBufferDepth: node.SmoothStreamingMedia.DVRWindowLength,
                mediaPresentationDuration : node.SmoothStreamingMedia.Duration,
                Period: node.SmoothStreamingMedia,
                Period_asArray: [node.SmoothStreamingMedia]
            };
        };
        mpd.isTransformed = false;

        period = {};
        period.name = "Period";
        period.isRoot = false;
        period.isArray = false;
        period.parent = null;
        period.children = [];
        period.properties = common;
        // here node is SmoothStreamingMedia node
        period.transformFunc = function(node) {
            return {
                duration: node.Duration,
                AdaptationSet: node.StreamIndex,
                AdaptationSet_asArray: node.StreamIndex_asArray
            };
        };
        mpd.children.push(period);

        adaptationSet = {};
        adaptationSet.name = "AdaptationSet";
        adaptationSet.isRoot = false;
        adaptationSet.isArray = true;
        adaptationSet.parent = period;
        adaptationSet.children = [];
        adaptationSet.properties = common;
        //here node is StreamIndex node
        adaptationSet.transformFunc = function(node) {
            return {
                id: node.Name,
                lang: node.Language,
                contenType: node.Type,
                mimeType: node.Type == "video" ? "video/mp4" : "audio/mp4",
                maxWidth: node.MaxWidth,
                maxHeight: node.MaxHeight,
                Representation: node.QualityLevel,
                Representation_asArray: node.QualityLevel_asArray
            };
        };
        period.children.push(adaptationSet);

        representation = {};
        representation.name = "Representation";
        representation.isRoot = false;
        representation.isArray = true;
        representation.parent = adaptationSet;
        representation.children = [];
        representation.properties = common;
        //here node is QualityLevel
        representation.transformFunc = function(node) {
            // extraction of the codec find the first 00000001x7
            var nalHeader = /00000001[0-9]7/.exec(node.CodecPrivateData);
            // find the 6 characters after the first nalHeader (if it exists)
            var avcoti = nalHeader && nalHeader[0] ? (node.CodecPrivateData.substr(node.CodecPrivateData.indexOf(nalHeader[0])+10, 6)) : undefined;
            var codecs = avcoti? "avc1."+avcoti : undefined;

            return {
                id: node.Index,
                bandwidth: node.Bitrate,
                width: node.maxWidth,
                height: node.maxHeight,
                codecs: codecs,
                audioSamplingRate: node.SamplingRate,
                codecPrivateData: node.CodecPrivateData
            };
        };
        adaptationSet.children.push(representation);

        return mpd;
    };

    var getDashMap = function () {
        var result = [];

        result.push(getCommonValuesMap());
        result.push(getSegmentValuesMap());
        result.push(getBaseUrlValuesMap());

        return result;
    };





    var internalParse = function(data, baseUrl) {
        this.logger.debug("[MssParser]", "Doing parse.");
        
        var manifest = null;
        var converter = new X2JS(matchers, '', false);
        var iron = new Custom.utils.ObjectIron(getDashMap());
 
        this.logger.debug("[MssParser]", "Converting from XML.");
        manifest = converter.xml_str2json(data);

        if (manifest === null) {
            this.logger.error("[MssParser]", "Failed to parse manifest!!");
            return Q.when(null);
        }

        this.logger.debug("[MssParser]", "Flatten manifest properties.");
        manifest = iron.run(manifest);

        this.logger.debug("[MssParser]", "Parsing complete.")
        return Q.when(manifest);
    };

    return {
        logger: undefined,
                
        parse: internalParse
    };
};

Mss.dependencies.MssParser.prototype =  {
    constructor: Mss.dependencies.MssParser
};
