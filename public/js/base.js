(function(){
    //设置头部的标签
    window.setTagActive = function(name){
        $("#nav").find("[for='" + name + "']").addClass("active");
    };

    window.default_print = function(){
        $("body").removeClass("narrow");
        window.print();
    };
    window.narrow_print = function(){
        $("body").addClass("narrow");
        window.print();
    }
})();

$(function(){
    //可增加的输入框的增加/删除操作
    $(".js_inputOper")
        .delegate(".addBtn", "click", function(){
            var formGroup = $(this).parents(".form-group");
            formGroup.after(formGroup.clone().find("input").val("").end());
        })
        .delegate(".delBtn", "click", function(){
            if(!confirm("确定删除本项目？")) return;

            var formGroup = $(this).parents(".form-group");
            formGroup.hide();
            setTimeout(function(){
                formGroup.remove();
            }, 100);
        });


    //元素可点击
    $(".clickable").delegate("[clickto]", "click", function(){
        var clickto = this.getAttribute("clickto");
        if (clickto) location.href = clickto;
    });
});