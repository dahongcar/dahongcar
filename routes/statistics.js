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
    var recordData, spendingData, spendingItemData, spendPartData;
    function show(){
        if(recordData !== undefined && spendingData !== undefined && spendingItemData !== undefined && spendPartData !== undefined){
            res.render("statistics/settlement_single", {
                date: date,
                recordData: recordData,
                spendingData: spendingData,
                spendingItemData: spendingItemData,
                partListData: spendPartData
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
            spendPartData = results;
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

                    allRealCost: recordIndex < recordLen ? recordData[recordIndex].allRealCost : 0, // 总收入
                    allDelayPay: recordIndex < recordLen ? recordData[recordIndex].allDelayPay : 0, // 记账金额
                    // 现金

                    // 总支出
                    ourSpend: recordIndex < recordLen ? recordData[recordIndex].ourSpend : 0, // 维修成本
                    allPartCost: spendingIndex < spendingLen ? spendingData[spendingIndex].allPartCost : 0, // 进货支出
                    allItemCost: spendingIndex < spendingLen ? spendingData[spendingIndex].allItemCost : 0, // 其它支出

                    // 本日利润
                    // 本日现金,

                    // 洗车次数
                    allCarWash: recordIndex < recordLen ? recordData[recordIndex].allCarWash : 0
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

    sqlclient.query("select carOutDate,sum(allRealCost) as allRealCost,sum(if(isDelayToPay=1,allRealCost,0)) as allDelayPay,sum(ourSpend) as ourSpend,sum(isCarWash) as allCarWash from record where carOutDate between '" + startDate + "' and '" + endDate + "' group by(carOutDate);",
        function (error, results) {
            recordData = results || null;
            show();
        });
    sqlclient.query("select date,sum(allPartCost) as allPartCost,sum(allItemCost) as allItemCost from spending where date between '" + startDate + "' and '" + endDate + "' group by(date);",
        function (error, results) {
            spendingData = results || null;
            show();
        });
}