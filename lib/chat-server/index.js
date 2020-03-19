const socketio = require('socket.io');

exports.listen = server => {
  const io = socketio.listen(server);
  const currentRoom = {};
  const nickNames = {};
  const nameUsed = [];
  let guestNumber = 1;
  
  const assignGuestName = socket => {
    const name = `Guest${guestNumber}`;
    
    guestNumber++;
    nickNames[socket.id] = name;
    socket.emit('nameResult', {
      success: true,
      name
    });
    nameUsed.push(name);
  };
  
  const joinRoom = (socket, room) => {
    socket.join(room);
    currentRoom[socket.id] = room;
    socket.emit('joinResult', { room });
    socket.broadcast.to(room).emit('message', {
      text: `${nickNames[socket.id]} has join room ${room}`
    });
  };
  
  io.sockets.on('connection', socket => {
    
    console.log('socket connection: ' + socket.id);
    
    assignGuestName(socket, guestNumber, nickNames, nameUsed);
    joinRoom(socket, 'Lobby');
    
    socket.on('changeNickname', ({ name }) => {
      const prevName = nickNames[socket.id];
      
      if (name === prevName) {
        socket.emit('nameResult', {
          success: false,
          info: 'You have to input a nickname different from the previous one .'
        });
      } else if (nameUsed.indexOf(name) !== -1) {
        socket.emit('nameResult', {
          success: false,
          info: 'That name is already in use.'
        });
      } else {
        nickNames[socket.id] = name;
        delete nameUsed[nameUsed.indexOf(prevName)];
        nameUsed.push(name);
  
        socket.emit('nameResult', {
          success: true,
          name
        });
  
        socket.emit('message', {
          text: `I have changed name to ${name}.`,
          user: socket.id
        });
        socket.broadcast.to(currentRoom[socket.id]).emit('message', {
          text: `User ${prevName} has changed name to ${name}.`,
          user: socket.id
        });
  
      }
    });
    
    socket.on('submitMessage', ({ text }) => {
      socket.emit('message', {
        text: text,
        user: socket.id
      });
      socket.broadcast.to(currentRoom[socket.id]).emit('message', {
        text: `${nickNames[socket.id]}: ${text}`,
        user: socket.id
      });
    });
  });
};

