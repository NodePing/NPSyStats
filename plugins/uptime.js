var os = require("os"),
    view = require("../lib/view");

exports.get = function(request, response, data, callback){
    data.uptime = {up: os.uptime()};
    return callback(request, response, data, callback);
};