var exec = require('child_process').exec,
    view = require("../lib/view");

var command = 'df';

var doit = function(callback){
    return exec(command, function(error, stdout, stderr){
        if(error) throw error;
        if(stderr) throw stderr;
        var lines = stdout.split("\n");
        var info = {};
        for(var i=0;i<lines.length; i++){
            if(lines[i].match(/Filesystem/)) continue;
            var sline = lines[i].replace(/\s+/g, ":");
            var aline = sline.split(":");
            if(!aline[5] || aline[5] === "undefined") continue;
            info[aline[5]] = {
                    filesystem: aline[0],
                    blocks: aline[1],
                    used: aline[2],
                    available: aline[3],
                    percent: aline[4],
                    mount: aline[5]
            };
        }
        return callback(info);
    });

};

exports.get = function(request, response, data, callback){
    return doit(function(out){
        data.mounts = out;
        callback(request, response, data, callback);
    });
};
