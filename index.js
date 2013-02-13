var util = require("util"),
    crypto = require("crypto"),
    fs = require("fs"),
    qs = require("querystring"),
    url = require("url"),
    view = require("./lib/view"),
    config = require("./config/config");

var http, server;

var getall = function(request, response, data, callback){
    if(data.plugins.length > 0){
        var next = data.plugins.pop();
        if(config.plugins && config.plugins[next] && config.plugins[next].disable){
            return getall(request, response, data, callback);
        }

        try{
            var plugin = require("./plugins/" + next);
            plugin.get(request, response, data, getall);
        }catch(e){
            console.log(e);
        }
    } else {
        delete data.plugins;
        view.send(request, response, data);
    }
};

var onRequest = function(request, response){
    request.params = url.parse(request.url, true);
    var path = request.params.pathname.substr(1).split("/");
    var name = path[0];
    switch(name){
        case "favicon.ico":
            response.status = 404;
            return view.send(request, response, config.strings.status404);
        case "":
            /* falls through */
        case "index.html":
            if(config.files && config.files.enable){
                return view.file(request, response);
            } else {
                return view.send(request, response, config.strings.index);
            }
            break;
        case "assets":
            if(config.files && config.files.enable){
                return view.file(request, response, {file: path[1]});
            } else {
                return view.send(request, response, config.strings.disabled, {status: 501});
            }
            break;
        case "json":
            /* falls through */
        case "all":
            if(config.token && request.params.query.token !== config.token){
                return view.send(request, response, "Token required", {status: 404});
            }
            var ap = [];
            for(var p in config.plugins){
                if(config.plugins[p].all === undefined || config.plugins[p].all) ap.push(p) ;
            }
            return getall(request, response, { plugins: ap });
        default:
            if(config.token && request.params.query.token !== config.token){
                return view.send(request, response, "Token required", {status: 404});
            }
            if(config.plugins && config.plugins[name] && config.plugins[name].disable){
                return view.send(request, response, config.strings.disabled, {status: 501});
            }
            try{
                var plugin = require("./plugins/" + name);
                plugin.get(request, response, {}, function(request, response, data){
                    view.send(request, response, data);
                });
            }catch(e){
                console.log(e);
                response.status = 404;
                view.send(request, response, config.strings.status404);
            }
    }

};

if(config.usehttps){
    http = require("https");
    server = http.createServer(config.ssloptions, onRequest);
} else {
    http = require("http");
    server = http.createServer(onRequest);
}

server.listen(config.port);

console.log("Started npsystats server listening on ", config.port);

process.on('SIGINT', function () {
    console.log('SIGINT.  Exiting.');
    process.kill(process.pid);
});
