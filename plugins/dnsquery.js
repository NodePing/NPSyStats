var view = require("../lib/view"),
  dns = require("dns"),
  config = require("../config/config");

var info = {};

var server =
  config &&
  config.plugins &&
  config.plugins.dnsquery &&
  config.plugins.dnsquery.server
    ? config.plugins.dnsquery.server
    : "8.8.8.8";
var fqdns =
  config &&
  config.plugins &&
  config.plugins.dnsquery &&
  config.plugins.dnsquery.fqdns
    ? config.plugins.dnsquery.fqdns
    : [];


dns.setServers([server]);

var query = function (request, callback) {
  var fqdn = fqdns.pop();
  if (fqdn) {
    dns.resolve(fqdn, "A", (err, value) => {
      if (err) {
        info[fqdn] = {server: server, result: err.code, success: 0};
      } else {
        info[fqdn] = {server: server, result: value, success : 1};
      }
      query(request, callback);
    });
  } else {
    callback(info);
  }
};

exports.get = function (request, response, data, callback) {
  console.log("Do I get here?");
  return query(request, function (out) {
    data.dnsquery = out;
    callback(request, response, data, callback);
  });
};


