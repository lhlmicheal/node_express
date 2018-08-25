var mongodb = require('./db');

function User(user) {
    this.name = user.name;
    this.passward = user.passward;
    this.email = user.email;
}

module.exports = User;
//存储用户信息
User.prototype.save = function (callback) {
    //要存入数据库的用户数据
    var user = {
        name: this.name,
        passward: this.passward,
        email: this.email,
    };
    //打开数据库
    mongodb.open(function (err, db) {
        if (err)
            return callback(err);
        //读取 users 集合
        db.collection('users', function (err, collection) {
            if (err) {
                mongodb.close();
                return callback(err);
            }
            //将用户数据插入 users 集合
            collection.insert(user, { safe: true }, function (err, user) {
                mongodb.close();
                if (err) {
                    console.log('Db operator insert error');
                    return callback(err);
                }
                callback(null, user[0]);// success , 
            });
        });
    });
};

//获取用户信息
User.get = function (name, callback) {
    //打开数据库
    mongodb.open(function (err, db) {
        if (err)
            return callback(err);
        //读取 users 集合
        db.collection('users', function (err, collection) {
            if (err) {
                mongodb.close();
                return callback(err);
            }
            //查找用户名(name健值)为 name 的一个文档
            collection.findOne({ name: name }, function (err, user) {
                mongodb.close();
                if (err) return callback(err);
                callback(null, user);
            });
        });
    });
};