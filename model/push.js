var mongodb = require('./db');

function Push(name, title, push) {
    this.name = name;
    this.title = title;
    this.push = push;
}

module.exports = Push;
//存储发表信息
Push.prototype.save = function (callback) {

    var date = new Date();
    var time = {
        date: date,
        year: date.getFullYear(),
        month: date.getFullYear() + "-" + (date.getMonth() + 1),
        day: date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate(),
        minute: date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate() + " " +
            date.getHours() + ":" + (date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes())
    };
    //要存入数据库的发表数据
    var push = {
        name: this.name,
        time: time,
        title: this.title,
        push: this.push,
    };
    //打开数据库
    mongodb.open(function (err, db) {
        if (err)
            return callback(err);
        //读取 pushs 集合
        db.collection('pushs', function (err, collection) {
            if (err) {
                mongodb.close();
                return callback(err);
            }
            //将用户数据插入 pushs 集合
            collection.insert(push, { safe: true }, function (err) {
                mongodb.close();
                if (err) {
                    console.log('Db operator insert error');
                    return callback(err);
                }
                callback(null);// success , 
            });
        });
    });
};

//获取push文章信息
Push.get = function (name, callback) {
    //打开数据库
    mongodb.open(function (err, db) {
        if (err)
            return callback(err);
        //读取 pushs 集合
        db.collection('pushs', function (err, collection) {
            if (err) {
                mongodb.close();
                return callback(err);
            }
            var query = {};
            if (name) query.name = name;
            collection.find(query).sort({
                time: -1
            }).toArray(function (err, docs) {
                mongodb.close();
                if (err) {
                    return callback(err);
                }
                callback(null, docs);
            });
        });
    });
};