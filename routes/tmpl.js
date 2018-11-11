
/*
 * 读取模板api
 */
var sqlclient = require("../lib/sqlclient");

exports.read = function(req, res){
    res.render(req.query.t);
};