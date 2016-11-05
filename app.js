
/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes');
var tmpl = require('./routes/tmpl');
var sqlclient = require("./lib/sqlclient");
var record = require('./routes/record');
var spending = require('./routes/spending');
var statistics = require('./routes/statistics');
var storage = require('./routes/storage');
var http = require('http');
var path = require('path');

var app = express();

// all environments
app.set('port', 18080);
app.set('views', path.join(__dirname, 'views'));
app.engine('.html', require('ejs').__express);
app.set('view engine', 'html');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

//开发环境
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

//启动数据库连接池
sqlclient.init();

//路由规则
app.get('/', routes.index);
app.get('/tmpl', tmpl.read);

app.post('/record/post', record.post);
app.get('/record/get', record.get);
app.get('/record/get/:carNum', record.get);
app.get('/record/get/:carNum/:recordId', record.get);
app.get('/record/add/:carNum', record.add);
app.get('/record/edit/:carNum/:recordId', record.edit);
app.get('/record/del/:carNum/:recordId', record.del);

app.post('/spending/post', spending.post);
app.get('/spending/get', spending.get);
app.get('/spending/edit', spending.edit);
app.get('/spending/del/:date', spending.del);

app.get('/storage/get', storage.get);
app.get('/storage/getAllName', storage.getAllName);

app.get('/statistics/get', statistics.get);

//ejs自定义方法
app.locals.get = function(name, def){
    return this[name] || def || "";
};
app.locals.set = function(name, value){
    this[name] = value;
};


//表单时间选择器默认选今天
var now = new Date();
var day = ("0" + now.getDate()).slice(-2);
var month = ("0" + (now.getMonth() + 1)).slice(-2);
app.locals.today = now.getFullYear()+"-"+(month)+"-"+(day);

//加载员工
var employees = [];
sqlclient.query("select name from employee", function(error, results){
    for (var i = 0; i < results.length; i++) {
        employees.push(results[i].name);
    }
    app.locals.employees = employees;
});

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});