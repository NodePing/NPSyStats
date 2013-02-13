var spawn = require('child_process').spawn,
    view = require("../lib/view"),
    url = require("url"),
    config = require("../config/config");

var command = 'ping -c 10';

var doit = function(request, callback){
    var path = url.parse(request.url);
    path = path.pathname.substr(1).split("/");

    if(!path[1].match(/^[\w\.\-]+$/)){
        return callback("Illegal address");
    }

    var ping = spawn('ping', ['-c 10', path[1]]);

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
        var info = {};
        for(var i=0;i<lines.length; i++){
            var key;
            var icmp = lines[i].match(/(\d+)\s+bytes\s+from\s+([\w\.\-]+)\s*(\(([\d\.]+)\))*:\s+\w+=(\d+)\s+ttl=(\d+)\s+time=([\d\.]+)/);
            if(icmp){
                info["seq"+icmp[5]] = {bytes: icmp[1], rdns: (icmp[4] && icmp[4].length) ? icmp[2] : "", ip: icmp[4] || icmp[2], seq: icmp[5], ttl: icmp[6], time: icmp[7]};
            } else {

                icmp = lines[i].match(/(\d+)\spackets\s+transmitted,\s+(\d+)\sreceived,\s+([\d\.]+)%\s+packet\s+loss,\s+time\s+(\d+)ms/);
                if(icmp){
                    info.stats = {transmitted: icmp[1], received: icmp[2], loss: icmp[3], time: icmp[4]};
                } else {
                    icmp = lines[i].match(/rtt\s+min\/avg\/max\/mdev\s+=\s+([\d\.]+)\/([\d\.]+)\/([\d\.]+)\/([\d\.]+)\s+ms/);
                    if(icmp) info.rtt = {min: icmp[1], avg: icmp[2], max: icmp[3], mdev: icmp[4]};
                }

            }
        }
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
        data.ping = out;
        callback(request, response, data, callback);
    });
};
