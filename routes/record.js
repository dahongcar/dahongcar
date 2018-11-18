/*
 * 提交维修记录
 */
var sqlclient = require("../lib/sqlclient");
var dict = require("../lib/dict");
var utils = require("../lib/utils");

exports.post = function (req, res) {
    //插入数据
    var body = req.body;

    //获得车牌号（去空格，转大写）
    var carNum = body.carNum.replace(/\s+/g, "").toUpperCase(),
        carData = {
            num: carNum,
            type: body.carType,
            ownerName: body.ownerName,
            ownerTel: body.ownerTel
        },
        recordData = {
            carNum: carNum,
            carInDate: body.carInDate,
            carOutDate: body.carOutDate,
            partMayCost: body.partMayCost,
            partRealCost: body.partRealCost,
            allMayCost: body.allMayCost,
            allRealCost: body.allRealCost,
            cashier: body.cashier,
            ourSpend: body.ourSpend,
            isWeixin: body.isWeixin,
            isDelayToPay: body.isDelayToPay,
            note: body.note,
        },
        recordId;

    //插入记录
    var insertProjSucc = false, insertPartSucc = false;
    function overwriteRecord(){
        if(body.recordId){//覆盖目前有的记录
            sqlclient.query("delete from record where ?", {
                id: body.recordId
            }, insertRecord);
            return;
        }
        insertRecord();
    }
    function insertRecord(){
        sqlclient.query("insert into record set ?", recordData, function(error, results){
            recordId = results.insertId;

            //项目列表
            if(body.projectName){
                if(typeof body.projectName == "string"){
                    var projectData = {
                        name: body.projectName,
                        man: body.projectMan,
                        //time: body.projectTime || 0,
                        cost: body.projectCost || 0,
                        recordId: recordId
                    };
                    sqlclient.query("insert into project set ?", projectData, function(){
                        insertProjSucc = true;
                        insertRecordSucc();
                    });
                }else{
                    sqlclient.multiquery(function(q){
                        for (var i = 0; i < body.projectName.length; i++) {
                            var projectData = {
                                name: body.projectName[i],
                                man: body.projectMan[i],
                                //time: body.projectTime || 0,
                                cost: body.projectCost[i] || 0,
                                recordId: recordId
                            };
                            q.query("insert into project set ?", projectData);
                        }
                    }, function(){
                        insertProjSucc = true;
                        insertRecordSucc();
                    });
                }
            }

            //配件列表
            if(body.partName){
                if(typeof body.partName == "string"){
                    var partData = {
                        name: body.partName,
                        count: body.partCount || 1,
                        cost: body.partCost || 0,
                        recordId: recordId
                    };
                    sqlclient.query("insert into part set ?", partData, function(){
                        insertPartSucc = true;
                        insertRecordSucc();
                    });
                }else{
                    sqlclient.multiquery(function(q){
                        for (var i = 0; i < body.partName.length; i++) {
                            var partData = {
                                name: body.partName[i],
                                count: body.partCount[i] || 1,
                                cost: body.partCost[i] || 0,
                                recordId: recordId
                            };
                            q.query("insert into part set ?", partData);
                        }
                    }, function(){
                        insertPartSucc = true;
                        insertRecordSucc();
                    });
                }
            }

            if(!body.projectName && !body.partName) insertRecordSucc();
        });
    }
    function insertRecordSucc() {
        if((!body.projectName || (body.projectName && insertProjSucc)) && (!body.partName || (body.partName && insertPartSucc))) res.redirect("/record/get/" + encodeURI(carNum) + "/" + recordId);
    }

    //检测是否有车辆
    sqlclient.query("select * from car where ?", {
        num: carNum
    }, function (error, results) {
        if(!results.length){
            //如果没有，插入数据
            sqlclient.query("insert into car set ?", carData, overwriteRecord);
        }else{
            sqlclient.query("update car set type='" + body.carType + "',ownerName='" + body.ownerName + "',ownerTel='" + body.ownerTel + "' where ?", {num: carNum}, overwriteRecord);
        }
    });
};
exports.get = function (req, res) {
    if(req.params.recordId || req.query.recordId){
        handleWithRecordId(req, res, req.params.recordId || req.query.recordId);
    }
    else if(req.params.carNum || req.query.carNum){
        handleWithCarNum(req, res, req.params.carNum || req.query.carNum, "get");
    }
    else if(req.query.date){
        handleWithDate(req, res);
    }
    else{
        handleWithOwner(req, res);
    }
};
exports.add = function(req, res){
    handleWithCarNum(req, res, req.params.carNum, "add");
};
exports.edit = function(req, res){
    handleWithRecordId(req, res, req.params.recordId, "input");
};
exports.del = function (req, res) {
    if(req.params.recordId){
        sqlclient.query("delete from record where ?", {
            id: req.params.recordId
        });
    }
	res.redirect("/tmpl?t=record/query");
};

function handleData(results, thead, tbody, getClickto){
    if(results.length > 0){
        //获取列表项名字
        for(var key in results[0]){
            if(typeof results[0][key] == "function") break;

            thead.push(dict(key));
        }
    }

    //获取列表项的值
    for(var i = 0, len = results.length; i < len; ++i){
        var result = [];
        if(getClickto) result.clickto = getClickto(results[i]);
        for(key in results[i]){
            if(typeof results[i][key] == "function") break;

            result.push(results[i][key]);
        }
        if(result.length > 0) tbody.push(result);
    }
}
function handleWithOwner(req, res){
    var cond = "";
    if(req.query.ownerName && req.query.ownerTel){
        cond = "ownerName = '" + req.query.ownerName + "' and ownerTel = '" + req.query.ownerTel + "'";
    }else if(req.query.ownerName){
        cond = "ownerName = '" + req.query.ownerName + "'";
    }else{
        cond = "ownerTel = '" + req.query.ownerTel + "'";
    }
    sqlclient.query("select * from car where " + cond,
        function(error, results){
            var thead = [], tbody = [];
            handleData(results, thead, tbody, function(item){
                return "/record/get/" + encodeURIComponent(item.num);
            });
            res.render("result/dbquery",{thead: thead, tbody: tbody});
        });
}
function handleWithDate(req, res){
    sqlclient.query("select id,carNum,carInDate,carOutDate from record where carInDate = '" + req.query.date + "' or carOutDate = '" + req.query.date + "' order by carInDate desc",
        function(error, results){
            var thead = [], tbody = [];
            handleData(results, thead, tbody, function(item){
                return "/record/get/" + encodeURIComponent(item.carNum) + "/" + item.id;
            });
            res.render("result/dbquery",{thead: thead, tbody: tbody});
        });
}
function handleWithCarNum(req, res, carNum, type){
    if(type == "get"){
        sqlclient.query("select id,carNum,carInDate from record where carNum like '%" + carNum.toUpperCase() + "%' order by carInDate desc",
            function(error, results){
                var thead = [], tbody = [];
                handleData(results, thead, tbody, function(item){
                    return "/record/get/" + encodeURIComponent(item.carNum) + "/" + item.id;
                });
                res.render("result/dbquery",{thead: thead, tbody: tbody});
            });
    }else{
        sqlclient.query("select * from car where ?", {
                num: carNum
            },
            function(error, results){
                res.render("record/input", results[0]);
            });
    }
}
function handleWithRecordId(req, res, recordId, template){
    var carData, recordData, projectListData, partListData;
    function show(){
        if(carData != undefined && recordData != undefined && projectListData != undefined && partListData != undefined){
            var printData = {};
            utils.extend(printData, carData, recordData, {
                allRealCostDX: utils.cost2DX(recordData.allRealCost),
                projectListData: projectListData,
                partListData: partListData
            });
            res.render("record/" + (template || "settlement"), printData);
        }
    }
    sqlclient.query("select * from record where ?", {
            id: recordId
        },
        function (error, results) {
            recordData = results[0];
            sqlclient.query("select * from car where ?", {
                    num: results[0].carNum
                },
                function (error, results) {
                    carData = results[0];
                    show();
                });
        });
    sqlclient.query("select name,man,time,cost from project where ?", {
            recordId: recordId
        },
        function (error, results) {
            projectListData = results;
            show();
        });
    sqlclient.query("select name,count,cost from part where ?", {
            recordId: recordId
        },
        function (error, results) {
            partListData = results;
            show();
        });
}