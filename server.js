const express=require('express');
const _=require('underscore');
var app=express();
const server=require('http').createServer(app);
const io=require('socket.io').listen(server);

connUsers=[];//Keeps track of connected users.
discUsers=[]//Keeps track of disconnected users for "recently connected" tab.
connections=[];//Keeps track of connected sockets.

server.listen(process.env.PORT || 3000,()=>{
    console.log("Server active...");
});

//Route the URL to specific locations
app.get('/',(req,res)=>{
    res.sendFile(__dirname+'/index.html');
});

//Register, Deregister a listner
io.sockets.on('connection',(socket)=>{
    connections.push(socket);
    console.log('Connected: %s sockets connected',connections.length);


    //Disconnect a user.
    socket.on('disconnect',(data)=>{
        console.log(socket.username);
        //Add disconnected user to array.
        discUsers.push(socket.username);
        //Remove username from connected users array.
        connUsers.splice(connUsers.indexOf(socket.username),1);
        //Remove connection entry of that user from connections array.
        connections.splice(connections.indexOf(socket),1);
        //Update usernames on "online users" tab after disconnection.
        updateUserNames();
        //Display connected users after disconnetion.
        console.log('Disconnected: %s sockets connected',connections.length);
    });

    //Send message to all the sockets.
    socket.on('sendMessage',(data)=>{
        console.log(data);
        io.sockets.emit('newMessage',{msg:data,user:socket.username});
    });

    //newUser listner, to add new user added to connUsers array.
    socket.on('newUser',(data,callback)=>{
        callback(true);
        console.log(_.isEmpty(data));
        socket.username=data;
        console.log(data);
        connUsers.push(socket.username);
        updateUserNames();
    });

    //updateUserNames will pass usernames of connected and disconnected users and total number of connected users    
    function updateUserNames(){
        io.sockets.emit('getUsers',connUsers,discUsers,connections.length);
    }
});