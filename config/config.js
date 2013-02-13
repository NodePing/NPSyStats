var config = {
    usehttps:  false,
    port: 8086,
    files: {'enable': true},
    token: "foobar",
    plugins: {
        'info': {'disable': false, 'all': true},
        'load': {'all': true},
        'mem': {'all': true},
        'uptime': {'all': true},
        'network': {'all': true},
        'mounts': {'all': true},
        'ps': {'all': false, 'regex': 'bin/node' },
        'npm': {'all': false}
    },
    strings: {
        index: "Welcome to npsystats",
        status404: "Not found",
        disabled: "Disabled"
    }
};

for(var i in config){
    exports[i] = config[i];
}