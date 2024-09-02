var socket = io.connect();
socket.on("connect", function () {
  // Send emit user id right after connect
  socket.emit("user", user_id);
});

// disconnect socket when when window/browser/site is closed
window.addEventListener("onbeforeunload", function (e) {
  socket.disconnect();
});

// function to be triggered if user recieves seen event
socket.on("update_message_status_seen", function (id) {
  let div = document.getElementById(id);
  div.innerHTML =
    div.innerHTML.substring(0, 6) +
    '<i class="fa-solid fa-check-double" style="color:blue;"></i>';
});

// function to be triggered if user recives recieved event
socket.on("update_message_status_received", function (id) {
  let div = document.getElementById(id);
  div.innerHTML =
    div.innerHTML.substring(0, 6) + '<i class="fa-solid fa-check-double"></i>';
});

// function to be triggered if user recives a realtime new message
socket.on("new_message", function (message) {
  socket.emit("update_message_status_received", message.id);
  message.status = "received";
  if (message.from === current_id) {
    let messages = document.getElementById("messages");
    let data = ` <div class="d-flex ${
      message.from === user_id ? "justify-content-end" : "justify-content-start"
    }">
                            <div class ="card msg ${
                              message.from === user_id
                                ? "color-green"
                                : "bg-light"
                            } p-1 m-1 rounded">
                                <div>${message.message}</div>
                            <div class="text-muted text-end" style="font-size:small">${getTime(
                              message.time
                            )}  </div>
                        </div>
                    <div>`;
    socket.emit("update_message_status_seen", message.id);
    message.status = "seen";
    messages.innerHTML = messages.innerHTML + data;
    messages.scrollTop = messages.scrollHeight;
  } else {
    if (g_data[message.from]) {
      g_data[message.from].received = g_data[message.from].received + 1;
    }
  }
  if (g_data[message.from]) {
    g_data[message.from].messages.push(message);
    g_data[message.from].lasttime = message.time;
  } else {
    getFriendData(message.from);
    var message_data = {
      messages: [message],
      lasttime: message.time,
      name: friend_data.firstName + " " + friend_data.lastName,
      received: 0,
      username: friend_data.username,
    };
    g_data[message.from] = message_data;
    g_data[message.from].received = g_data[message.from].received + 1;
  }
  g_data = sortMessages(g_data);
  showContacts();
});
// update on add friends
socket.on("add_friend", function (id) {
  if (id === user_id) {
    getFriends();
  }
});
