var fs = require("fs"),
    path = require("path"),
    config = require("../config/config.js");

var view = {
    send: function(request, response, data, options){
        options = options || {};
        data = data || "";
        response.status = options.status || response.status || 200;
        var contenttype = options.contenttype || "application/json";
        response.writeHead(response.status, {"Content-Type": contenttype });
        if(typeof data === "object"){
            try{
                data = JSON.stringify(data);
            }catch(e){
                data = '{"error":"JSON error formatting response: "'+e.message+'}';
            }
        }
        // console.log(typeof data);
        console.log(new Date(), request.connection.remoteAddress, response.status, request.url);

        return response.end(data);
    },

    send404: function(req, response, data, options){
        options = options || {};
        options.status = 404;
        return view.send(req, response, data, options);
    },

    file: function(req, response, options){
        options = options || {};
        if(typeof options === "string"){
            options = { file: options};
        }

        options.file = options.file || "index.html";
        options.file = options.file.replace('[^\w\.\-]', '');

        var mime = options.file.split(".");
        mime = mime.pop();
        switch(mime){
            case 'css':
                options.contenttype = "text/css";
                break;
            case 'js':
                options.contenttype = "application/javascript";
                break;
            case 'html':
                /* false through */
            case 'htm':
                options.contenttype = "text/html";
        }

        var file = config.assetpath || path.resolve(__dirname + "/../assets/" + options.file);

        return fs.readFile(file, 'utf-8', function (err, file) {
            view.send(req, response, file, options);
        });
    }

};


for(var i in view){
    exports[i] = view[i];
}