var templates = {};
var headers = {};
var token = false;

var run = function(){
    var fetch = ['all', 'ps', 'npm'];
    for(var i=0;i<fetch.length;i++){
        getdata(fetch[i]);
    }
};

var getdata = function(p, qs, id, options){
    qs = qs || {};
    p = p || "all";
    id = (id) ? "/"+id : "";

    qs.token = token;

    $.getJSON('/'+p + id, qs, function(data, textStatus){
        $(".loading").hide();
        if(data.info){
            if(data.info.time) $("#time").html(data.info.time);
            if(data.info.hostname) document.title = data.info.hostname + " - NPSysStats";
        }
        $("#message .error").html("");
        for(var plugin in data){
            if(!templates[plugin] && $("#"+plugin+ " .template").length > 0){
                templates[plugin] = $("#"+plugin+ " .template").clone().removeClass('template');
                $("#"+plugin+ " .template").remove();
                headers[plugin] = $("#"+plugin+ " > tbody > tr").clone();
            } else if(templates[plugin] && templates[plugin].length > 0) {
                $("#" +plugin).empty();
                $("#" +plugin).prepend(headers[plugin]);
            }
            $("#"+plugin+"cont").show();
            if(plugin === "ping" || plugin === "ps") console.log(templates[plugin][0].childElementCount);
            for(var field in data[plugin]){
                if(typeof data[plugin][field] === "object"){
                    var fieldname = field.replace(/[^\w]/g, "-");
                    if($("#"+plugin+"_"+fieldname).length < 1){
                        templates[plugin].clone().attr('id', plugin+"_"+fieldname).appendTo("#"+plugin);
                    }
                    $("#" + plugin+"_"+fieldname + " .key").html(field);
                    for(var field1 in data[plugin][field]){
                        if(types && types[plugin] && types[plugin][field1] && typeof types[plugin][field1] === "function"){
                            data[plugin][field][field1] = types[plugin][field1](data[plugin][field][field1]);
                        }
                        $("#" + plugin + "_" + fieldname + " ." + field1).html(data[plugin][field][field1]);
                    }
                } else {
                    if(types && types[plugin] && types[plugin][field] && typeof types[plugin][field] === "function"){
                        data[plugin][field] = types[plugin][field](data[plugin][field]);
                    }
                    if(templates[plugin]){
                        $("#"+plugin).append(templates[plugin].clone().html(data[plugin][field]));
                    } else {
                        $("#"+plugin+"_"+field).html(data[plugin][field]);
                    }
                }
            }
        }
    })
    .error(function(err){
        $(".loading").hide();
        // console.log(err);
        if($("#dialog").length < 1){
            if(err.responseText === "Token required"){
                $("body").append("<div id='dialog' class='hidden'><input type='text' size='32' id='ftoken' name='token'></div>");
                $("#dialog").dialog({
                        title: "Please enter the token for this site:",
                        modal: true,
                        buttons: {
                            "OK": function(){
                                token = $("#ftoken").val();
                                // document.location.search="?token="+token;
                                run();
                                $( this ).dialog( "close" );
                            },
                            "Cancel": function(){ $( this ).dialog( "close" ); }
                        },
                        close: function(){ $(".ui-dialog").remove(); }
                    });
            } else {
                $("body").append("<div id='dialog' class='hidden'>"+ err.responseText +"</div>");
                $("#dialog").dialog({
                        title: "Error",
                        modal: true,
                        buttons: {
                            "OK": function(){
                                run();
                                $( this ).dialog( "close" );
                            }
                        },
                        close: function(){ $(".ui-dialog").remove(); }
                    });
            }
        } else {
            $("#message").html("<span class='error'>A token is required to fetch data from this system.</span>");
        }
    });
};

var filters = {
    kb: function(number){
        number = filters.round(number / 1024, 2);
        return number + "k";
    },
    round: function(number){
        var digits = Math.pow(10,2);
        return Math.round(number * digits)/digits;
    },
    time2days: function(num){
        if(num == num - 0){ num = num - 0;}
        var string = "";
        string = ":" + filters.leftpad(Math.floor(num % 60), "0", 2); // seconds
        num = num / 60;  // convert sec to min
        string = ":" + filters.leftpad(Math.floor(num % 60), "0", 2) + string; // minutes
        num = num / 60;  // convert min to hours
        string = "" + filters.leftpad(Math.floor(num % 24), "0", 2) + string; // hours
        num = Math.floor(num / 24);
        if (num === 1){
            string = "" + num + " day " + string;
        } else if( num > 1){
            string = "" + num + " days " + string;
        }
        return string;
    },
    leftpad: function(string, pad, digits){
        pad = pad || "0"; digits = digits || 2;
        if((string === 0 || string) && typeof string !== "string"){ string = string.toString(); }
        if(string.length >= digits) return string;
        var add = digits - string.length;
        for(var i=0; i<add; i++){
            string = pad.concat(string);
        }
        return string;
    }
};

var types = {
    mem: {
        memfree: function(string){ return filters.kb(string); },
        memtotal: function(string){ return filters.kb(string); },
        swapfree: function(string){ return filters.kb(string); }
    },
    uptime: { up: function(string){ return filters.time2days(string); }},
    load: { '1min': function(string){ return filters.round(string); },
            '5min': function(string){ return filters.round(string); },
            '10min': function(string){ return filters.round(string); }
    }
};

var runping = function(plugin){
    var address = $("#pingaddress").val();
    plugin = plugin || $("input[name=pingtrace]:checked").val();
    $("#pingaddressh3").html(address);
    $("#pingloading").toggle();
    $("#pingcont, #traceroutecont").hide();
    getdata(plugin, false, address);
};

var timer = function(){
    setTimeout(function(){run();timer();}, 60000);
};

$( document ).ready( function() {
    var foo = document.location.search;
    foo = foo.match(/[\&\?]token=([^\&\#]+)/);
    if(foo) token = foo[1];

    run(); timer();
    $( "#container" ).tabs({
        beforeActivate: function(event, ui){
            document.location.hash = ui.newTab.context.hash;
        }
    });
});