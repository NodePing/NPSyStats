var exec = require('child_process').exec,
    view = require("../lib/view"),
    config = require("../config/config");

var command = 'npm ls -g';
var vcommand = 'node -v';

var doit = function(callback){
    return exec(command, function(error, stdout, stderr){
        if(error) throw error;
        if(stderr) throw stderr;
        var lines = stdout.split("\n");
        var info = { node: {} };
        for(var i=1;i<lines.length; i++){
            var aline = lines[i].match(/(├──|├─┬|└─┬|└──) (.+)$/);
            if(aline){
                var packages = aline[2].split("@");
                info[packages[0]] = {version: packages[1].replace('\n','') };
            }
        }
        return exec(vcommand, function(verror, vout, vderr){
            if(vout) info.node = {version: vout.replace('\n','')};
            return callback(info);
        });

    });

};

exports.get = function(request, response, data, callback){
    return doit(function(out){
        data.npm = out;
        callback(request, response, data, callback);
    });
};
