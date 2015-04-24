module.exports = function(io, rooms){

	var chatrooms = io.of('/roomlist').on('connection', function(socket){
		console.log('Connection established');
		socket.emit('roomupdate',JSON.stringify(rooms));

		socket.on('newroom', function(data){
			rooms.push(data);
			socket.broadcast.emit('roomupdate', JSON.stringify(rooms));
			socket.emit('roomupdate',JSON.stringify(rooms));
		});

	})

	var messages = io.of('/messages').on('connection', function(socket){
		console.log('Room connection created');

		socket.on('joinroom', function(data){
			console.log('1');
			socket.username = data.user;
			socket.userPic=data.userPic;
			socket.join(data.room);
			updateUserList(data.room, true);

		});

		socket.on('newMessage', function(data){
			console.log("RIGIRESEARCH: I knw the User: " + data.user + "sent :" + data.message + ". I can send this to the context engine for AWESOMENESS!!");
			socket.broadcast.to(data.room_number).emit('messagefeed',JSON.stringify(data));
		});

		socket.on('updateUsers', function(data){
			updateUserList(data.room);
		});
	
		function updateUserList(room, updateAll) {
			var getUsers = io.of('/messages').clients(room);
			var userList = [];

			for(i in getUsers) {
				userList.push({
					user:getUsers[i].username,
					userPic:getUsers[i].userPic
				});
			}

			socket.to(room).emit('updateUsersList', JSON.stringify(userList));
			
			if(updateAll) {
				socket.broadcast.to(room).emit('updateUsersList', JSON.stringify(userList));
			}


		}

	});

	





}