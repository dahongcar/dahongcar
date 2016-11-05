var mysql = require('mysql'),
    _pool = null,
    _setting = {
    host: "localhost",
    port: "3306",
    user: "root",
    password: "sa",
    database: "dahongcar"
};

exports.init = function () {
    if(!_pool)
        _pool = mysql.createPool(_setting);
};

exports.query = function () {//sql, args, callback
    if(arguments.length < 1) return;

    var sql = arguments[0], args, callback;
    if(typeof arguments[1] == "function"){
        args = {}; callback = arguments[1];
    }else{
        args = arguments[1]; callback = arguments[2];
    }

    _pool.getConnection(function (err, client) {
        if (err) {
            console.error('[sqlqueryErr] ' + err.stack);
            return;
        }
        client.query(sql, args, function (error, results, fields) {
            _pool.releaseConnection(client);
            if (error) {
                console.log("ClientReady Error:" + error.message);
                return;
            }
            if(callback) callback.apply(null, [error, results, fields]);
        });
    });
};

exports.multiquery = function (run, callback) {
    var client = mysql.createConnection(_setting);
    var queues = require('mysql-queues');
    queues(client, true);

    var q = client.createQueue();
    run(q);
    q.execute();

    q.query(";", function(){
        if(callback) callback.apply(null);
        client.end();
    });
};

exports.shutdown = function () {
    _pool.end();
};