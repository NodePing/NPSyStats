var os = require("os"),
    view = require("../lib/view");

var info = function(){
    return {
        hostname: os.hostname(),
        type: os.type(),
        platform: os.platform(),
        arch: os.arch(),
        release: os.release(),
        time: new Date()
    };

};

exports.get = function(request, response, data, callback){
    data.info = info();
    return callback(request, response, data, callback);
};