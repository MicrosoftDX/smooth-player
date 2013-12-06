Mss.dependencies.MssParser = function () {
    "use strict";

    var customParse = function(data, baseUrl) {
        console.error("Nothing here ! Please implement MssParser");
    };

    return {
        logger: undefined,
        system: undefined,
        
        parse: customParse
    };
};

Mss.dependencies.MssParser.prototype =  {
    constructor: Mss.dependencies.MssParser
};
