var dict = {
    name: "名称",
    man: "负责人",
    cost: "总额",
    count: "数量",
    carInDate: "进厂时间",
    carOutDate: "出厂时间",
    partRealCost: "配件实收",
    partMayCost: "配件应收",
    allMayCost: "合计应收",
    allRealCost: "合计实收",
    cashier: "收银员",
    carNum: "车牌号码",
    num: "车牌号码",
    type: "车辆型号",
    ownerName: "客户名称",
    ownerTel: "客户电话",
    note: "备注",
    ourSpend: "维修成本",
    isDelayToPay: "记账"
};

module.exports = function(key){
    return (dict[key] || key);
};