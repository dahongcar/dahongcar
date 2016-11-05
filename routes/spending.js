/*
 * 提交维修记录
 */
var sqlclient = require("../lib/sqlclient");
var utils = require("../lib/utils");

exports.post = function (req, res) {
    var body = req.body, date = body.date;

    var spendingData = {
            date: date,
            allMayCost: body.allMayCost,
            allRealCost: body.allRealCost,
            note: body.note
        };

    //插入记录
    var insertPartSucc = false, insertItemSucc = false;
    function insertData(){
        sqlclient.query("insert into spending set ?", spendingData, function(error, results){
            //进货支出
            if(body.partName){
                if(typeof body.partName == "string"){
                    var storageData = {
                        name: body.partName,
                        count: body.partCount || 1,
                        cost: body.partCost || 0,
                        date: date
                    };
                    sqlclient.query("insert into spending_part set ?", storageData, function(){
                        insertPartSucc = true;
                        insertDataSucc();
                    });
                }else{
                    for (var i = 0; i < body.partName.length; i++) {
                        if (!body.partName[i]) {
                            utils.msg(res, "错误：进货支出的名称不能为空！");
                            return;
                        }
                    }
                    sqlclient.multiquery(function(q){
                        for (var i = 0; i < body.partName.length; i++) {
                            var storageData = {
                                name: body.partName[i],
                                count: body.partCount[i] || 1,
                                cost: body.partCost[i] || 0,
                                date: date
                            };
                            q.query("insert into spending_part set ?", storageData);
                        }
                    }, function(){
                        insertPartSucc = true;
                        insertDataSucc();
                    });
                }
            }

            //其他支出
            if(body.itemName){
                if(typeof body.itemName == "string"){
                    var spendingItemData = {
                        name: body.itemName,
                        count: body.itemCount,
                        cost: body.itemCost || 0,
                        date: date
                    };
                    sqlclient.query("insert into spending_item set ?", spendingItemData, function(){
                        insertItemSucc = true;
                        insertDataSucc();
                    });
                }else{
                    for (i = 0; i < body.itemName.length; i++) {
                        if (!body.itemName[i]) {
                            utils.msg(res, "错误：其他支出的名称不能为空！");
                            return;
                        }
                    }
                    sqlclient.multiquery(function(q){
                        for (var i = 0; i < body.itemName.length; i++) {
                            var spendingItemData = {
                                name: body.itemName[i],
                                count: body.itemCount[i],
                                cost: body.itemCost[i] || 0,
                                date: date
                            };
                            q.query("insert into spending_item set ?", spendingItemData);
                        }
                    }, function(){
                        insertItemSucc = true;
                        insertDataSucc();
                    });
                }
            }

            if(!body.partName && !body.itemName) utils.msg(res, "错误：请输入进货条目/其他条目名称！");
        });
    }
    function insertDataSucc(){
        if((!body.partName || (body.partName && insertPartSucc)) && (!body.itemName || (body.itemName && insertItemSucc)))res.redirect("/spending/get?date=" + date);
    }

    //覆盖目前有的数据
    if(body.lastdate){
        sqlclient.query("delete from spending where ?", {
            date: body.lastdate
        }, insertData);
        return;
    }
    sqlclient.query("select * from spending where ?", {
        date: date
    }, function(error, results){
        if(results.length > 0){
            utils.msg(res, date + "已录入，请做修改操作");
            return;
        }
        insertData();
    });
};
exports.get = function (req, res) {
    handle(req, res, req.query.date);
};
exports.edit = function(req, res){
    handle(req, res, req.query.date, "input");
};
exports.del = function (req, res) {
    if(req.params.date){
        sqlclient.query("delete from spending where ?", {
            date: req.params.date
        });
    }
	res.redirect("/tmpl?t=spending/query");
};

function handle(req, res, date, template){
    var spendingData, itemListData, partListData;
    function show(){
        if(spendingData === null){
            utils.msg(res, "暂无数据");
            return;
        }
        if(spendingData !== undefined && itemListData != undefined && partListData != undefined){
            var printData = {};
            utils.extend(printData, spendingData, {
                itemListData: itemListData,
                partListData: partListData
            });
            res.render("spending/" + (template || "settlement"), printData);
        }
    }

    sqlclient.query("select * from spending where ?", {
            date: date
        },
        function (error, results) {
            spendingData = results[0] || null;
            show();
        });
    sqlclient.query("select * from spending_item where ?", {
            date: date
        },
        function (error, results) {
            itemListData = results;
            show();
        });
    sqlclient.query("select * from spending_part where ?", {
            date: date
        },
        function (error, results) {
            partListData = results;
            show();
        });
}