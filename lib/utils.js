var utils = {
    //extend
    extend: function () {
        var objIndex = 0, isOverwrite = false;//覆盖
        if(arguments[0] == "boolean"){
            isOverwrite = arguments[0];
            objIndex = 1;
        }

        var tgt = arguments[objIndex];
        for (var i = objIndex + 1; i < arguments.length; i++) {
            var arg = arguments[i];
            if (isOverwrite) {
                for (ele in arg) {
                    tgt[ele] = arg[ele];
                }
            } else {
                for (ele in arg) {
                    if (tgt[ele] === undefined || tgt[ele] === null) {
                        tgt[ele] = arg[ele];
                    }
                }
            }
        }
        return arguments[objIndex];
    },

    //金额大写转换函数
    cost2DX: function(cost) {
        if(!cost) return "零元整";
        if (!/^(0|[1-9]\d*)(\.\d+)?$/.test(cost))
            return "数据非法";
        var unit = "仟佰拾亿仟佰拾万仟佰拾元角分", str = "";
        cost += "00";
        var p = cost.indexOf('.');
        if (p >= 0)
            cost = cost.substring(0, p) + cost.substr(p+1, 2);
        unit = unit.substr(unit.length - cost.length);
        for (var i=0; i < cost.length; i++)
            str += '零壹贰叁肆伍陆柒捌玖'.charAt(cost.charAt(i)) + unit.charAt(i);
        return str.replace(/零(仟|佰|拾|角)/g, "零").replace(/(零)+/g, "零").replace(/零(万|亿|元)/g, "$1").replace(/(亿)万|壹(拾)/g, "$1$2").replace(/^元零?|零分/g, "").replace(/元$/g, "元整");
    },

    msg: function(res, title, other){
        res.render("result/status", utils.extend({
            title: title
        }, other));
    }
};

module.exports = utils;