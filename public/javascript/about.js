// global variables
var socket = io.connect();
var g_data;
var current_id;
var g_friends;
socket.on('connect',function(){ 
    // Send emit user id right after connect
    socket.emit('user', user_id);
});

// disconnect socket when when window/browser/site is closed
window.addEventListener("onbeforeunload", function (e) {
    socket.disconnect();
});

// get friends
function getFriends(){
    let url = "/user/"+user_id+"/friend";
    document.getElementById("friends-table-body").innerHTML ="";
    fetch(url).then(response => response.json()).then(
        friends =>{
            let count  =1;
            g_friends = friends;
            friends.forEach(data=>{
            let tr =`<tr>
                <th scope="row">${count}</th>
                    <td>${data.firstName + " " + data.lastName }</td>
                    <td>${data.email}</td>
                    <td>@${data.username}</td>
                    <td class="d-flex justify-content-end"><button onclick="deleteFriend(this,'${data._id}')" class="btn btn-danger">Remove</button></td>
                </tr>`;    
            count++;
            document.getElementById("friends-table-body").innerHTML = document.getElementById("friends-table-body").innerHTML +tr;
            });    
        } 
    )
}
//delete friend
function deleteFriend(ele,id){
    child = ele.parentElement.parentElement;
    ele.parentElement.parentElement.parentElement.removeChild(child);
    let url ="/user/"+user_id+"/friend/?_method=delete";
    let msg = {
        id : id
    }
    fetch(url, {
        method: "POST",
        headers: {'Content-Type': 'application/json'}, 
        body: JSON.stringify(msg)
    }).then(response=>response.json()).then(
       getFriends()
    );   
}
getFriends();


document.getElementById("friends-container").style.display="none";
document.getElementById("friends-container-trigger").addEventListener("click",function(){
    getFriends();
    document.getElementById("details-container").style.display = "none";
    document.getElementById("friends-container").style.display = "block";
    document.getElementById("details-container-trigger").classList.remove("active");
    document.getElementById("friends-container-trigger").classList.add("active");
})
document.getElementById("details-container-trigger").addEventListener("click",function(){
    document.getElementById("details-container").style.display = "block";
    document.getElementById("friends-container").style.display = "none";
    document.getElementById("details-container-trigger").classList.add("active");
    document.getElementById("friends-container-trigger").classList.remove("active");

})
document.getElementById("friend-add-search-table").style.display = "none";
document.getElementById("friend-add-search-text").addEventListener("keydown",function(){
    let text = document.getElementById("friend-add-search-text").value;
    
    fetch(`/user/${user_id}/friend/search/${text}`, {
    }).then(response=>response.json()).then(
        data=>{
            if(data.length >0)
            {
                document.getElementById("friend-add-search-table").style.display = "block";
                document.getElementById("friends-search-body").innerHTML =" ";
                    
                data.forEach(ele=>{
                    let count =1;
                    let tr =`<tr>
                            <th scope="row">${count}</th>
                                <td>${ele.firstName + " " + ele.lastName }</td>
                                <td>${ele.email}</td>
                                <td>@${ele.username}</td>
                                <td class="d-flex justify-content-end"><button onclick="addFriend('${ele._id}')" class="btn btn-success">Add</button></td>
                            </tr>`;
                    document.getElementById("friends-search-body").innerHTML =document.getElementById("friends-search-body").innerHTML + tr;
                    count ++;  
                }
                );
            }else{
                document.getElementById("friend-add-search-table").style.display = "none";

            }
        }
    );

});
function addFriend(friend){
    let url ="/user/"+user_id+"/friend/";
    let msg = {
        friend_id : friend
    }
    fetch(url, {
        method: "POST",
        headers: {'Content-Type': 'application/json'}, 
        body: JSON.stringify(msg)
    }).then(()=>{
        getFriends();
        socket.emit("add_friend",friend);
    }); 
}
