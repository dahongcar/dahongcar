/*
 * 提交维修记录
 */
var sqlclient = require("../lib/sqlclient");
var utils = require("../lib/utils");

exports.get = function (req, res) {
    if(req.query.name) handleWithName(req, res, req.query.name);
    else handleWithAll(req, res);
};
exports.getAllName = function(req, res){
    sqlclient.query("select name from spending_part group by(name);",
        function (error, results) {
            var ret = [];
            for (var i = 0; i < results.length; i++) {
                ret.push({value: results[i].name});
            }
            res.send(ret);
        });
};
function handleWithName(req, res, name){
    var storageData, recordData;
    function show(){
        if(storageData === null && recordData === null){
            utils.msg(res, "暂无数据");
            return;
        }
        if(storageData !== undefined && recordData != undefined){
            res.render("storage/settlement_name", {
                name: name,
                storageData: storageData,
                recordData: recordData
            });
        }
    }

    sqlclient.query("select p.count,p.cost,r.id,r.carNum,r.carInDate,r.carOutDate from part as p,record as r where p.name = '"
        + name + "' and p.recordId = r.id order by(r.carOutDate) desc",
        function (error, results) {
            recordData = results || null;
            show();
        });
    sqlclient.query("select * from spending_part where ?", {
            name: name
        },
        function (error, results) {
            storageData = results || null;
            show();
        });
}
function handleWithAll(req, res){
    var storageData, usedData;
    function show(){
        if(storageData !== undefined && usedData !== undefined){
            for (var si = 0; si < storageData.length; si++) {
                var name = storageData[si].name;
                for (var pi = 0; pi < usedData.length; pi++) {
                    if(usedData[pi].name == name){
                        storageData[si].count -= usedData[pi].count;
                        break;
                    }
                }
            }
            res.render("storage/settlement_all", {storageData:storageData});
        }
    }
    sqlclient.query("select name, sum(count) as count from spending_part group by(name)",
        function (error, results) {
            storageData = results || null;
            show();
        });
    sqlclient.query("select name, sum(count) as count from part group by(name)",
        function (error, results) {
            usedData = results || null;
            show();
        });
}