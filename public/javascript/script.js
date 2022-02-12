var socket = io.connect('https://'+IP+':3000');
var g_data;
var current_id;
function getTime(str){
    let today = new Date(str);
    let hour = today.getHours() < 10 ? "0"+today.getHours():today.getHours();
    let minute = today.getMinutes() < 10 ? "0"+today.getMinutes():today.getMinutes();
    let time = hour + ":" + minute;
    return time;    
}
function getData(){
    let url = "/user/"+user_id+"/message";
    contacts.innerHTML ="";
    fetch(url).then(response => response.json()).then(
        data =>{
            g_data = data;
            showContacts();
        } 
    )
    let messages = document.getElementById("messages");
}
getData();

// show all the contacts to the user
function showContacts(){
    let contacts = document.getElementById("contacts");
    contacts.innerHTML = "";
    for(let key in g_data)
            {
                let friend = `
                <div class="card p-3" onclick="showMessages('${key}')">
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
                            <div class="text-muted" style="font-size: small;">${g_data[key].messages[(g_data[key].messages.length-1)].message}</div>
                        </div>	
                    </div>
                </div>`;
                contacts.innerHTML = contacts.innerHTML  +friend;
            }
}

// show all the messages from currently selected user
function showMessages(id){
    current_id = id;
    let messages = document.getElementById("messages");
    let friend_name = document.getElementById("friend-name");
    friend_name.textContent = g_data[id].name;
    messages.innerHTML = " ";
    g_data[id].messages.forEach(
        message=>{
            let data =` <div class="d-flex ${message.from == user_id?'justify-content-end':'justify-content-start'}">
                            <div class ="card msg ${message.from == user_id?'color-green':'bg-light'} p-1 m-1 rounded">
                                <div>${message.message}</div>
                                <div class="text-muted text-end" style="font-size:small">${getTime(message.time)}</div>
                            </div>
                        <div>`;
            messages.innerHTML = messages.innerHTML + data;
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

document.getElementById("sendButton").addEventListener("click",function(){
    let msgVal = document.getElementById("sendText");
    if(msgVal.value.length >0){
        let message ={
            from: user_id,
            to: current_id,
            message: msgVal.value,
            time: Date.now()
        }
        let messages = document.getElementById("messages");
        let data =` <div class="d-flex ${message.from == user_id?'justify-content-end':'justify-content-start'}">
                            <div class ="card msg ${message.from == user_id?'color-green':'bg-light'} p-1 m-1 rounded">
                                <div>${message.message}</div>
                            <div class="text-muted text-end" style="font-size:small">${getTime(message.time)}</div>
                        </div>
                    <div>`;
        messages.innerHTML = messages.innerHTML + data;
        messages.scrollTop = messages.scrollHeight;
        msgVal.value = "";
        fetch("/user/"+user_id+"/message", {
            method: "POST",
            headers: {'Content-Type': 'application/json'}, 
            body: JSON.stringify(message)
        }).then();
        g_data[current_id].messages.push(message);
        g_data[current_id].lasttime = message.time;
        g_data = sortMessages(g_data);
        console.log(g_data);
        showContacts();
    }  
    //socket.emit("message", message);
})