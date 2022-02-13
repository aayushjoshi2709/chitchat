// global variables
var socket = io.connect(IP+':3000');
var g_data;
var current_id;

socket.on('connect',function(){ 
    // Send emit user id right after connect
    socket.emit('user', user_id);
});

// disconnect socket when when window/browser/site is closed
window.addEventListener("onbeforeunload", function (e) {
    socket.disconnect();
});

// convert date object string to time
function getTime(str){
    let today = new Date(str);
    let hour = today.getHours() < 10 ? "0"+today.getHours():today.getHours();
    let minute = today.getMinutes() < 10 ? "0"+today.getMinutes():today.getMinutes();
    let time = hour + ":" + minute;
    return time;    
}
// get all the data from the server
function getData(){
    let url = "/user/"+user_id+"/message";
    contacts.innerHTML ="";
    fetch(url).then(response => response.json()).then(
        data =>{
            g_data = data;
            checkRecieved();
            showContacts();
        } 
    )
}

// get all the data from the server
getData();

// check all the recieved messages 
function checkRecieved(){
    for(let key in g_data)
    {
        var count = 0;
        g_data[key].messages.forEach(function(message){
                if(message.status && (message.status !="seen" && message.to == user_id)){
                    socket.emit('update_message_status_received',message.id);     
                    message.status = "received";
                    count++;
                }
            }
        );     
        g_data[key].received = count;    
    }
}

// show all the contacts to the user
function showContacts(){
    let contacts = document.getElementById("contacts");
    contacts.innerHTML = "";
    for(let key in g_data)
    {
        let friend = `
            <div class="card p-3" onclick="showMessages(this,'${key}')">
                <div class="row">
                <div class="col-1"style="width: 42px;" >
                    <img src="https://winaero.com/blog/wp-content/uploads/2019/11/Photos-new-icon.png" class="rounded-circle" width="42px" height="42px">
                </div>
                <div class="col-10 ">
                    <div class="row ">
                        <div class="col-8">
                            ${g_data[key].name}
                        </div>
                        <div class="col-4 text-end text-muted" style="font-size: small; text-align: end;">
                            ${getTime(g_data[key].lasttime)}
                        </div>
                    </div>
                    <div class ="row">
                        <div class="col-8 contact-last-msg text-muted" >
                            ${g_data[key].messages[(g_data[key].messages.length-1)].message+"..."}
                        </div>
                        ${g_data[key].received>0?`<div class="col-4 d-flex justify-content-end " style="font-size: small; text-align: end;">
                        <div style="background-color:green;width:20px;border-radius:50%;text-align:center;">${g_data[key].received}</div> 
                    </div>`:''}
                        
                    </div>
                    
                </div>	
            </div>`;
                contacts.innerHTML = contacts.innerHTML  +friend;
    }
}

// show all the messages from currently selected user
function showMessages(ele,id){
    if(g_data[id].received >0){
        var element = ele.children[0].children[1].children[1].children[1].children[0];
        element.parentElement.removeChild(element);
    }
    g_data[id].received =0;
    current_id = id;
    let messages = document.getElementById("messages");
    let friend_name = document.getElementById("friend-name");
    friend_name.textContent = g_data[id].name;
    messages.innerHTML = " ";
    g_data[id].messages.forEach(
        message=>{
            if(message.status &&(message.to == user_id && (message.status == "received" || message.status == "sent"))){
                socket.emit('update_message_status_seen',message.id);        
                message.status = "seen";
            }
            // make messages appear on the messages pane
            // tick logic
            let msgdiv =`<div class="d-flex ${message.from == user_id?'justify-content-end':'justify-content-start'}">
                            <div class ="card msg ${message.from == user_id?'color-green':'bg-light'} p-1 m-1 rounded">
                                <div>
                                    ${message.message}
                                </div>
                                <div id="${message.id}" class="text-muted text-end" style="font-size:small">${getTime(message.time)} ${
                                    (message.status == "sent" && message.from == user_id)?
                                    '<i class="fa-solid fa-check"></i>':
                                    (message.status == "received" && message.from == user_id)?
                                    '<i class="fa-solid fa-check-double"></i>'
                                    :(message.status == "seen" && message.from == user_id)?
                                    '<i class="fa-solid fa-check-double" style="color:blue;"></i>':''
                                } </div>
                            </div>
                        <div>`;
            messages.innerHTML = messages.innerHTML + msgdiv;
        }
    );
    messages.scrollTop = messages.scrollHeight;
}

// comparator for sort messages function
function comparator(a,b){
    
    if(a[1].lasttime > b[1].lasttime)
        return -1;
    else if (a[1].lasttime < b[1].lasttime)
        return 1;
    else
        return 0;
}

// sort messages by last time
function sortMessages(result){
    let arr =[];
    let res = {};
    for (let key in result) {
        arr.push([key, result[key]]);
    }
    arr.sort(comparator);
    arr.forEach(element=>{
        res[element[0]] = element[1];
    });
    return res;
}

// addend event listner to the mesage box
document.getElementById("sendText").addEventListener("keypress",function(key){
    if(key.keyCode == 13){
        document.getElementById("sendButton").click();
    }
});

// function for sending messages
document.getElementById("sendButton").addEventListener("click",function(){
    let msgVal = document.getElementById("sendText");
    if(msgVal.value.length >0){
        let mid;
        let message ={
            from: user_id,
            to: current_id,
            message: msgVal.value,
            status: "sent",
            time: Date.now()
        }
        fetch("/user/"+user_id+"/message", {
            method: "POST",
            headers: {'Content-Type': 'application/json'}, 
            body: JSON.stringify(message)
        }).then(response=>response.json()).then(
            data=>{
                message.id = data.id;
                socket.emit('new_message',message);
                let messages = document.getElementById("messages");
                let msgdiv =`<div class="d-flex ${message.from == user_id?'justify-content-end':'justify-content-start'}">
                                    <div class ="card msg ${message.from == user_id?'color-green':'bg-light'} p-1 m-1 rounded">
                                        <div>${message.message}</div>
                                    <div  id="${message.id}" class="text-muted text-end" style="font-size:small">${getTime(message.time)} <i class="fa-solid fa-check"></i></div>
                                </div>
                            <div>`;
                messages.innerHTML = messages.innerHTML + msgdiv;
                messages.scrollTop = messages.scrollHeight;
                msgVal.value = "";        
                g_data[current_id].messages.push(message);
                g_data[current_id].lasttime = message.time;
                g_data = sortMessages(g_data);
                showContacts();
            }
        );
        
    }
});

// function to be triggered if user recives a realtime new message
socket.on('new_message',function(message){
    socket.emit('update_message_status_received',message.id);     
    message.status = "received";
    
    if(message.from == current_id){
        let messages = document.getElementById("messages");
        let data =` <div class="d-flex ${message.from == user_id?'justify-content-end':'justify-content-start'}">
                            <div class ="card msg ${message.from == user_id?'color-green':'bg-light'} p-1 m-1 rounded">
                                <div>${message.message}</div>
                            <div class="text-muted text-end" style="font-size:small">${getTime(message.time)}  </div>
                        </div>
                    <div>`;
        socket.emit('update_message_status_seen',message.id);        
        message.status = "seen";        
        messages.innerHTML = messages.innerHTML + data;
        messages.scrollTop = messages.scrollHeight;     
    }else{
        g_data[message.from].received = g_data[message.from].received + 1;
    }
    g_data[message.from].messages.push(message);
    g_data[message.from].lasttime = message.time;
    g_data = sortMessages(g_data);
    showContacts();
});

// function to be triggered if user recieves seen event
socket.on('update_message_status_seen',function(id){
    let div = document.getElementById(id);
    div.innerHTML = div.innerHTML.substring(0,6) + '<i class="fa-solid fa-check-double" style="color:blue;"></i>';
});

// function to be triggered if user recives recieved event
socket.on('update_message_status_received',function(id){
    let div = document.getElementById(id);
    div.innerHTML = div.innerHTML.substring(0,6) + '<i class="fa-solid fa-check-double"></i>';
});