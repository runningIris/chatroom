const socket = io.connect();
const nicknameLabel = document.getElementById('nickname');
const chatContent = document.getElementById('chat-content');
const nicknameBtn = document.getElementById('change-nickname');
const messageBtn = document.getElementById('message-submit');
const nicknameInput = document.getElementById('nickname-input');
const messageInput = document.getElementById('message-input');

socket.on('nameResult', result => {
  console.log(result);
  if (result.success) {
    nicknameLabel.innerText = result.name;
  } else {
    alert(result.info);
  }
});

socket.on('message', ({ text, user }) => {
  console.log(text);
  chatContent.innerHTML = chatContent.innerHTML + (user === socket.id ? `<div class="content-mine">${text}</div>` : `<div class="content-others">${text}</div>`);
});

nicknameBtn.onclick = () => {
  socket.emit('changeNickname', { name: nicknameInput.value });
};

messageBtn.onclick = () => {
  socket.emit('submitMessage', {
    text: messageInput.value
  })
};