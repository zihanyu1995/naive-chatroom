/**
 * @Name    :  chatroom.js
 * @Module  :  Socket.io Module
 * @Author  :  Linxiaozhou
 * @Date    :  2016.09.20
 * @Ref1    :  Node.js in Action (Mike Cantlon, Marc Harter, T.J.Holowaychuk, Nathan Rajlich)
 * @Ref2    :  http://socket.io/docs/
 * @Ref3    :  https://github.com/socketio/socket.io/blob/master/examples/chat/index.js
 * @Brief   :  Process chatroom through socket.io
 */

var socketio = require('socket.io');
var io;
var guest_num = 0;
var userlist = new Array();
var mysql = require('mysql') ;
//connection config
var connection = mysql.createConnection({
    host : 'localhost' ,
    user : 'root' ,
    password : '95263yzh' ,
    database : 'chat'
});

// 外部接口
exports.listen = function(server) {

    io = socketio(server);

    io.on('connection', function (socket) {

        console.log("in");
        

        /* *************** 用户emit消息"join"时，响应 *************** */
        socket.on('join', function (username) {



           
            for(var i=0; i<userlist.length; i++) {
                if(userlist[i] == username) {
                    username = username+Math.ceil(Math.random()*10000);
                    break;
                }
            }
            userlist.push(username);
            // 用户信息存储在socket会话中
            socket.username = username;
            ++guest_num;


   
        
            // 告知用户登录成功
            socket.emit('login', {
                username: username,
                numUsers: guest_num
            }
            );

            connection.query('SELECT * FROM t_msg ORDER BY time', function selectCb(err, results, fields) {
                if (err) {
                    throw err;
                }

                var temp='';
                for(var i=0;i<results.length;i++)
                {

                    
                    temp+="<p>"+(results[i].time+"---  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"+results[i].name+": "+results[i].msg)+"</p>";
                    if(temp.length>10000) {
                        console.log(temp.length);
                        socket.emit('history', temp
                        );
                        temp='';
                    }
                    
                }


                socket.emit('history', temp
                );

            });
           

            // 广播告知所有用户
            socket.broadcast.emit('user_joined', {
                username: username,
                msg: "Welcome "+username,
                type: "BROADCAST",
                numUsers: guest_num
            });
        });


        /* *************** 用户离开 *************** */
        socket.on('disconnect', function () {

            
                --guest_num;
                console.log("leave");
                userlist = removeArr(userlist, socket.username);
                // 告知所有用户
                socket.broadcast.emit('user_left', {
                    username: socket.username,
                    msg: socket.username + " leave！",
                    type: "BROADCAST",
                    numUsers: guest_num
                });

        });



        /* *************** 发送消息 *************** */
        socket.on('send_msg', function (msg,name) {

        
                insertMsg(connection,name,msg);
                // 广播消息

                socket.broadcast.emit('msg_sent', {
                    username: name,
                    msg: msg,
                    type: "BROADCAST",
                });

        });

        function insertMsg(client , username , msg){
          
            var sd = require('silly-datetime');
            var time=sd.format(new Date(), 'YYYY/MM/DD HH:mm:ss');

            client.query('insert into t_msg value(?,?,?)', [username, msg,time], function(err,result){

                if( err ){
                    console.log( "error:" + err.message);
                    return err;
                }

            });
        }



       

// 移除数组元素
        var removeArr = function(arr, ele) {
            var new_arr = new Array();
            for(var i=0; i<arr.length; i++) {
                if(ele != arr[i]) {
                    new_arr.push(arr[i])
                }
            }
            return new_arr;
        }


        /* *************** 更多 *************** */
        // 在这里添加更多监听的消息
        // ...


    });

};

