var exec = require('child_process').exec,
    view = require("../lib/view"),
    config = require("../config/config");

var command = 'ps ax';

var doit = function(callback){
    return exec(command, function(error, stdout, stderr){
        if(error) throw error;
        if(stderr) throw stderr;
        var lines = stdout.split("\n");
        var info = {};
        var regex = (config && config.plugins && config.plugins.ps && config.plugins.ps.regex) ? config.plugins.ps.regex : false;
        for(var i=1;i<lines.length; i++){
            if(regex){
                if(!lines[i].match(regex)) continue;
            }
            var aline = lines[i].split(/\s+/);
            if(!aline[0] || aline[0].length===0) continue;
            var pid = aline.shift();
            info[pid] = {
                    TTY: aline.shift(),
                    STAT: aline.shift(),
                    TIME: aline.shift(),
                    COMMAND: aline.join(' ')
            };
        }
        return callback(info);
    });

};

exports.get = function(request, response, data, callback){
    return doit(function(out){
        data.ps = out;
        callback(request, response, data, callback);
    });
};
