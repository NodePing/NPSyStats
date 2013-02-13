npsystats
========

npsystats is an application that gathers system information and makes it available as JSON via HTTP.  This application was originally written to give us an easy way to get system information from hosts in JSON format so it can easily be used with [NodePing](http://nodeping.com) server monitoring.  Nothing did quite what we wanted, so here's this.

npsystats is written in node.js.  Currently it only supports linux hosts.

Information available
---------------------
* basic system information such as hostname and arch
* uptime
* memory usage
* network interfaces and traffic
* hd partitions and space available
* running processes
* npm modules
* and more

Installation
------------
1. download it
2. run it
No special permissions are required for the included plugins.  There are no external dependencies to install, other than assumptions in some plugins about /proc contents and the availability of ping and traceroute.

Usage
-----
Visit the host and port in a browser.  Plugins are accessible using their name:
/info
/load
/mem
/mounts
/network
/npm
/ping
/ps
/traceroute
/uptime

Or, you can get all of the information from all plugins configured for 'all' using
/all

Configuration
-------------
Configuration information is in config/config.js, and is in JSON format.  See the sample config for details.

* usehttps - boolean.  If this is set to true config must also include ssloptions.
* ssloptions - object with path to ssl cert information as shown at http://nodejs.org/api/https.html#https_https_createserver_options_requestlistener
* token - if present, must be included in query string with subsequent requests to plugins (ie ?token=foobar).  Note that this is not designed to be real security. Please do not rely on this to protect sensitive information.
* files - configure static file handling.  files.enable (bool) turns static files on and off.  If it is off then strings.index and strings.disabled will be used instead.
* port - what port to listen on for HTTP requests
* plugins - list of available plugins.  If a plugin is missing from this list, it is still accessible directly, but it will not be included in /all.  Listed plugins can be disabled by including 'disable':true for that plugin, and can be omitted from /all by setting 'all':false.  If plugins take config options, set them here as well.
* strings - list of strings used in various places.

Plugins
-------
npsystats uses plugins.  Each plugin should gather and provide information on one topic.

Plugin Development
------------------
Plugins must export a get method, and must add their output to the data object and call the callback using the same arguments as were received, as in this method from the uptime plugin:
```
exports.get = function(request, response, data, callback){
    data.uptime = {up: os.uptime()};
    return callback(request, response, data, callback);
};
```
Other than that, plugins can do anything.  Drop it in plugins/ and it will immediately be available (although you can turn off individual plugins in the config)

Plugins should not require elevated permissions.

HTML output
-----------
HTML output can be changed by editing assets/index.html and its accompanying files.  Currently the HTML interface uses /all to get data from the info, load, mem, uptime, network and mounts plugins.  ps and npm are retrieved separately, and ping and traceroute are run on demand.

Contributors
------------
David Caylor
Shawn Parrish

Contributing
------------
We would welcome additional plugins or other enhancements to this tool.

License
-------
(MIT License)
Copyright (c) 2013 NodePing LLC <info@nodeping.com>

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
"Software"), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.