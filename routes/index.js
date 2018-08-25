var express = require('express');
var router = express.Router();

/* GET home page. */
// router.get('/', function (req, res, next) {
//   res.render('index', { title: 'Express' });
// });
var crypto = require('crypto');
var User = require('../model/user');
var Push = require('../model/push');

// module.exports = router;
module.exports = function (app) {
  app.get('/', function (req, res) {
    // res.render('index', {
    //   title: '主页',
    //   user: req.session.user,
    //   success: req.flash('success').toString(),
    //   error: req.flash('error').toString()
    // });
    Push.get(null, function (err, pushs) {
      if (err) pushs = [];
      res.render('index', {
        titile: '主页',
        user: req.session.user,
        pushs: pushs,
        success: req.flash('success').toString(),
        error: req.flash('error').toString()
      });
    });
  });

  app.get('/reg', checkNotLogin);
  app.get('/reg', function (req, res) {
    res.render('reg', {
      title: '注册',
      user: req.session.user,
      success: req.flash('success').toString(),
      error: req.flash('error').toString()
    });
  });

  app.post('/reg', checkNotLogin);
  app.post('/reg', function (req, res) {
    console.log('index.js: app.post');
    var name = req.body.name, passward = req.body.passward;
    var passward_re = req.body['passward-repeat'];
    console.log('name:' + name + 'passward=' + passward + 'passRe=' + passward_re);
    //密码是否一致
    if (passward !== passward_re) {
      req.flash('error', '两次输入密码不一致');
      return res.redirect('/reg');//返回注册页面
    }
    //生成密码的md5值
    var md5 = crypto.createHash('md5');
    passward = md5.update(req.body.passward).digest('hex');
    var newUser = new User({
      name: name,
      passward: passward,
      email: req.body.email
    });

    User.get(newUser.name, function (err, user) {
      if (err) {
        req.flash('error', err);
        return res.redirect('/');
      }
      if (user) {
        req.flash('error', '用户已存在');
        return res.redirect('/reg');
      }
      // 如果不存在，则新增用户
      newUser.save(function (err, user) {
        if (err) {
          req.flash('error', err);
          console.log('reg save user info error:' + err.toString());
          return res.redirect('/reg');
        }
        req.session.user = newUser; //信息存入session
        req.flash('success', '注册成功');
        res.redirect('/');
      });
    });
  });

  //
  app.get('/login', checkNotLogin);
  app.get('/login', function (req, res) {
    res.render('login', {
      title: '登录',
      user: req.session.user,
      success: req.flash('success').toString(),
      error: req.flash('error').toString()
    });
  });

  app.post('/login', function (req, res) {
    var md5 = crypto.createHash('md5');
    var passward = md5.update(req.body.passward).digest('hex');
    //检查用户是否存在
    User.get(req.body.name, function (err, user) {
      if (!user) {
        req.flash('error', '用户不存在');
        return res.redirect('/login'); //用户不存在，转到登录页
      }
      //检查密码是否一致
      if (user.passward != passward) {
        req.flash('error', '密码错误');
        return res.redirect('/login');
      }
      //匹配后，将用户信息存入session
      req.session.user = user;
      req.flash('success', '登录成功');
      res.redirect('/'); //登录成功进入主页
    });
  });

  app.get('/push', checkLogin);
  app.get('/push', function (req, res) {
    // res.render('push', { title: '发表' });
    res.render('post', {
      title: '发表',
      user: req.session.user,
      success: req.flash('success').toString(),
      error: req.flash('error').toString()
    });
  });

  app.post('/push', checkLogin);
  app.post('/push', function (req, res) {
    var currentUser = req.session.user;
    var push = new Push(currentUser.name, req.body.title, req.body.push);
    push.save(function (err) {
      if (err) {
        req.flash('error', err);
        return res.redirect('/');
      }
      req.flash('success', '发布成功');
      return res.redirect('/');
    });
  });

  app.get('/logout', checkLogin);
  app.get('/logout', function (req, res) {
    req.session.user = null;
    req.flash('success', '成功退出');
    res.redirect('/');
    // res.render('logout', { title: 'Express' });
  });

  //检测是否登录
  function checkNotLogin(req, res, next) {
    if (req.session.user) {
      req.flash('error', '已登录');
      res.redirect('back');
    }
    next();
  }

  function checkLogin(req, res, next) {
    if (!req.session.user) {
      req.flash('error', '未登录');
      res.redirect('/login');
    }
    next();
  }
};
