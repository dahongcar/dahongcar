/*
 * 提交维修记录
 */
var sqlclient = require("../lib/sqlclient");
var utils = require("../lib/utils");

exports.get = function (req, res) {
    if(req.query.endDate) {
        new Date(req.query.endDate) > new Date(req.query.startDate) ? handleWithInterval(req, res, req.query.startDate, req.query.endDate) : handleWithInterval(req, res, req.query.endDate, req.query.startDate);
    }
    else handleWithSingle(req, res, req.query.startDate);
};

function handleWithSingle(req, res, date){
    var recordData, spendingData, spendingItemData, partListData;
    function show(){
        if(recordData !== undefined && spendingData !== undefined && spendingItemData !== undefined && partListData !== undefined){
            res.render("statistics/settlement_single", {
                date: date,
                recordData: recordData,
                spendingData: spendingData,
                spendingItemData: spendingItemData,
                partListData: partListData
            });
        }
    }

    sqlclient.query("select * from record where ?", {
            carOutDate: date
        },
        function (error, results) {
            recordData = results || null;
            show();
        });
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
            spendingItemData = results || null;
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
function handleWithInterval(req, res, startDate, endDate){
    var recordData, spendingData, startDateSec = +new Date(startDate), endDateSec = +new Date(endDate);

    function show(){
        if(recordData !== undefined && spendingData !== undefined){
            var printData = [], recordIndex = 0, spendingIndex = 0, recordLen = recordData.length, spendingLen = spendingData.length;

            while(startDateSec <= endDateSec){
                var day = new Date(startDateSec);
                day = day.getFullYear()+"-"+(("0" + (day.getMonth() + 1)).slice(-2))+"-"+(("0" + day.getDate()).slice(-2));

                for(recordIndex = 0;recordIndex < recordLen;++recordIndex){
                    if(recordData[recordIndex].carOutDate == day) break; // 找到当天的record
                }
                for(spendingIndex= 0;spendingIndex < spendingLen;++spendingIndex){
                    if(spendingData[spendingIndex].date == day) break; // 找到当天的spending
                }

                printData.push({
                    date: day, // 日期

                    // 总收入
                    // 记账金额
                    // 现金

                    // 总支出
                    // 进货支出
                    // 其它支出

                    // 本日利润
                    // 维修成本
                    // 本日现金

                    // 洗车次数
                    recordAllMayCost: recordIndex < recordLen ? recordData[recordIndex].allMayCost : 0,
                    recordAllRealCost: recordIndex < recordLen ? recordData[recordIndex].allRealCost : 0,
                    spendingAllMayCost: spendingIndex < spendingLen ? spendingData[spendingIndex].allMayCost : 0,
                    spendingAllRealCost: spendingIndex < spendingLen ? spendingData[spendingIndex].allRealCost : 0
                });


                startDateSec += 24 * 60 * 60 * 1000;
            }

            res.render("statistics/settlement_interval", {
                startDate: startDate,
                endDate: endDate,
                printData: printData
            });
        }
    }

    sqlclient.query("select carOutDate,sum(allMayCost) as allMayCost,sum(allRealCost) as allRealCost from record where carOutDate between '" + startDate + "' and '" + endDate + "' group by(carOutDate);",
        function (error, results) {
            recordData = results || null;
            show();
        });
    sqlclient.query("select date,sum(allMayCost) as allMayCost,sum(allRealCost) as allRealCost from spending where date between '" + startDate + "' and '" + endDate + "' group by(date);",
        function (error, results) {
            spendingData = results || null;
            show();
        });
}