var express = require('express');
var router = express.Router();
var mysql = require('mysql') ;
/* GET home page. */
var usname='';

router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/index', function(req, res, next) {
    res.render('index', { title: 'Express' });
});

router.post('/psw', function(req, res, next) {
    var name = req.body.name;
    var opwd=req.body.psw
    var pwd = req.body.npsw;
    var pwd2=req.body.npsw2;
    var connection = mysql.createConnection({
        host : 'localhost' ,
        user : 'root' ,
        password : '95263yzh' ,
        database : 'chat'
    });
    if(!opwd || opwd == "") {
        console.log("Password cannot be empty.");
        res.send('Password cannot be empty.');
        return;
    }
    if(!pwd || pwd == "") {
        console.log("Newpassword cannot be empty.");
        res.send('Newpassword cannot be empty.');
        return;
    }
    if(pwd  !== pwd2) {
        console.log("The passwords entered are not the same.");
        res.send('The passwords entered are not the same.');
        return;
    }
    //查库比较
    //connection.connect();
    connection.query('SELECT COUNT(*) checkNum FROM `t_user` WHERE name = \''+name+'\' AND psw =\''+ opwd +'\'', function(err, rows, fields) {
        if (err) throw err;
        var checkNum = rows[0].checkNum;
        console.log('Results: ', rows[0].checkNum);
        if(checkNum ==0){
            console.log('Password is incorrect.');
            res.send('Password is incorrect.');
        }else{

            connection.query('UPDATE t_user SET psw = \''+pwd+'\''+ 'WHERE name = \''+name+'\'', function(err,result){
                if( err ){
                    console.log( "error:" + err.message);
                    return err;
                }

            });
            console.log('Modify password success');
            //返回结果
            res.writeHead(200, {'Content-type' : 'text/html'});
            res.write('<h1>Modify password success</h1>');
            res.end('<a href="/">Back to sign in</a>');


        }
    });
    //关闭连接
    //connection.end();
})
;

router.post('/modify', function(req, res) {
        var name = req.body.name;
        res.render('modify', { title: 'Express',
                                 uname: name});
    })
;



router.get('/signup', function(req, res, next) {
    res.render('signup', { title: 'signup' });
})
    .post('/signup', function(req, res) {
        var name = req.body.name;
        var pwd = req.body.psw;
        var pwd2=req.body.psw2;
        var connection = mysql.createConnection({
            host : 'localhost' ,
            user : 'root' ,
            password : '95263yzh' ,
            database : 'chat'
        });
        if(!name || name == "") {
            console.log("Username cannot be empty.");
            res.send('Username cannot be empty.');
            return;
        }
        if(!pwd || pwd == "") {
            console.log("Password cannot be empty.");
            res.send('Password cannot be empty.');
            return;
        }
        if(pwd  !== pwd2) {
            console.log("The passwords entered are not the same");
            res.send('The passwords entered are not the same');
            return;
        }
        //查库比较
        //connection.connect();
        connection.query('SELECT COUNT(*) checkNum FROM `t_user` WHERE name = \''+name+'\'', function(err, rows, fields) {
            if (err) throw err;
            var checkNum = rows[0].checkNum;
            console.log('Results is: ', rows[0].checkNum);
            if(checkNum !=0){
                console.log('Account exists. ');
                res.send('Account exists. ');
            }else{
                connection.query('insert into t_user value(?,?)', [name, pwd], function(err,result){
                    if( err ){
                        console.log( "error:" + err.message);
                        return err;
                    }

                });
                //返回结果
                res.writeHead(200, {'Content-type' : 'text/html'});
                res.write('<h1>Sign up success</h1>');
                res.end('<a href="/">Back to sign in</a>');


            }
        });
        //关闭连接
        //connection.end();
    })
;

router.post('/chat', function(req, res) {
      var name = req.body.name;
      var pwd = req.body.psw;
      var connection = mysql.createConnection({
        host : 'localhost' ,
        user : 'root' ,
        password : '95263yzh' ,
        database : 'chat'
      });
      if(!name || name == "") {
        console.log("Username cannot be empty.");
        res.send('Username cannot be empty.');
        return;
      }
      if(!pwd || pwd == "") {
        console.log("Password cannot be empty.");
        res.send('Password cannot be empty.');
        return;
      }
      //查库比较
      //connection.connect();
      connection.query('SELECT COUNT(*) checkNum FROM `t_user` WHERE name = \''+name+'\' AND psw =\''+ pwd +'\'', function(err, rows, fields) {
        if (err) throw err;
        var checkNum = rows[0].checkNum;
        console.log('Results: ', rows[0].checkNum);
        if(checkNum == 0){
          console.log('Password or account is incorrect.');
          res.send('Password or account is incorrect.');
        }else{
          console.log('Login success');
          //返回结果
          //res.send('登录成功，账号密码为：'+name+"---"+pwd);
          res.render('chat', {
            uname: name,
            psw: pwd,
            title: 'Express'});
        }
      });
      //关闭连接
      //connection.end();
    })
;
module.exports = router;
