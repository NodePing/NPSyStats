var spawn = require('child_process').spawn,
    view = require("../lib/view"),
    url = require("url"),
    config = require("../config/config");

var command = 'traceroute';

var doit = function(request, callback){
    var path = url.parse(request.url);
    path = path.pathname.substr(1).split("/");

    if(!path[1].match(/^[\w\.\-]+$/)){
        return callback("Illegal address");
    }

    var ping = spawn(command, ['-q 1', path[1]]);

    var out = "", error = "";

    ping.stdout.on('data', function(data){
        out += data;
    });

    ping.stderr.on('data', function(data){
        error += data;
    });

    ping.on('exit', function(code){
        // console.log("Ping",out, error, code);
        var lines = out.split("\n");
        var info = { results: {}};

        for(var i=0;i<lines.length; i++){
            var tline = lines[i].split(/\s+/);
            if(tline.length === 6){
                info["hop" +tline[1]] = {
                    hop: tline[1],
                    name: tline[2],
                    address: tline[3].replace(/[\(\)]*/g, ""),
                    time: tline[4]
                };
            }
        }

        // info['results'] = lines;
        info.error = error;
        callback(info);
    });

    //     , function(error, stdout, stderr){
    //     if(error) throw error;
    //     if(stderr) throw stderr;
    //     return {"result": stdout};
    //     var lines = stdout.split("\n");
    //     var info = { node: {} };
    //     for(var i=1;i<lines.length; i++){
    //         var aline = lines[i].match(/(├──|├─┬|└─┬|└──) (.+)$/);
    //         if(aline){
    //             var packages = aline[2].split("@");
    //             info[packages[0]] = {version: packages[1].replace('\n','') };
    //         }
    //     }
    // });

};

exports.get = function(request, response, data, callback){
    return doit(request, function(out){
        data.traceroute = out;
        callback(request, response, data, callback);
    });
};
