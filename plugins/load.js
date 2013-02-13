var os = require("os"),
    view = require("../lib/view");

var load = function(){
    var l = os.loadavg();
    return {
        "1min": l[0],
        "5min": l[1],
        "10min": l[2]
    };
};

exports.get = function(request, response, data, callback){
    data.load = load();
    return callback(request, response, data, callback);
};