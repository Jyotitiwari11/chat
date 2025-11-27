// const { get } = require("http");

// Connect to Socket.IO server
const socket = io('http://localhost:8000');

const form = document.getElementById('sub');
const messageInput = document.getElementById('mess-inp');
const messageContainer = document.querySelector('.container');
const file_inp=document.querySelector('.file');
const join=document.querySelector('.join');
const leave=document.querySelector('.leave');

 var audio =new Audio('ding.mp3');
 

 function getTime() { 
    
    const now = new Date();
    return now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit',hour12: true });
}
// const picker = new EmojiButton();
// const picker = new EmojiButton({ 
//   position: 'top-end'
// });
// const bttn=document.querySelector('#emoji-btn');
// bttn.addEventListener('click',(e)=>{
//     e.preventDefault();
//     picker.togglePicker(bttn);
// });
// picker.on('emoji', emoji => {
//   messageInput.value += emoji;
// });
   

                          
const append=(message,position)=>{
    console.log("appending ",message);
    const me=document.createElement('div');
    // const bt=document.createElement('button');
    me.innerText=message;
    me.classList.add('message'); 
    me.classList.add(position); 
    const te=document.createElement('span');
    te.innerText=getTime();
    me.append(te);
    te.classList.add('time');



    // bt.innerText='Translate';
    // bt.classList.add('btn');
    // bt.classList.add('right');
    // add css class to the element
    messageContainer.append(me);
    me.addEventListener('dblclick',(e)=>{
        socket.emit('translate',message);

    })
    // messageContainer.append(bt);
    if(position=='left'){
        audio.play();
    }
    // me.append(getTime());
    // here append is predefined function in dom to add element to container
    //  not upper append function
}
function appendImage(imgData,position){
    const div=document.createElement('div');
    div.classList.add('message',position);
    const img=document.createElement('img');
    img.src=imgData;
    img.classList.add('image');
    div.appendChild(img);
    messageContainer.appendChild(div);

}
function appendPDF(fileName, pdfData, position) {
     const div = document.createElement('div');
    div.classList.add('message', position);

    const link = document.createElement('a');
    link.href = pdfData;
    link.target = "_blank";
    link.textContent = `📄 ${fileName} (Click to view)`;
    link.classList.add('pdf-file');

    div.appendChild(link);
    messageContainer.appendChild(div);
}
// file_inp.addEventListener('change',(e)=>{
//     const file=e.target.files[0];
//     if(!file) return;
//     messageInput.value=file;
//     const reader=new FileReader();  
//     reader.onload=function(e){
//         const fileContent=e.target.result;
//         append(`You sent a file: ${fileContent}`,'right');
//         socket.emit('send',`File: ${file.name}\nContent:\n${fileContent}`);
//     }  
//     reader.readAsDataURL(file);
  
// }); 
file_inp.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/') && file.type !== 'application/pdf') {
        alert("Only images and pdf files allowed");
        return;
    } 

    const reader = new FileReader();
    reader.onload = function (ev) {
        const fileData = ev.target.result;
         
        // Show image in your chat
        if (confirm(`Are you sure you want to send ${file.name} image?`)) {
            if (file.type === 'application/pdf') {
                // appendPDF(file.name, fileData, 'right');
                socket.emit('send-pdf', { name: file.name, data: fileData });
            } else if (file.type.startsWith('image/')) {
                // appendImage(fileData, 'right');
                socket.emit('send-img', fileData);
            }
            append(`You sent the ${file.name} `, 'right');
             // Send to server
        }
       

    }
    reader.readAsDataURL(file);
});
messageInput.addEventListener('input',(e)=>{
    socket.emit('type');
})

join.addEventListener('click',(e)=>{
    const name = prompt("Enter your name to join");
    //  emit is the function used to send an event with some data between the client and server used by both server and client.
    socket.emit('new-user-joined',name);

})
leave.addEventListener('click',(e)=>{
    if (confirm("Are you sure you want to leave the chat?")) {
        socket.emit('discon');
        append(`You left the chat`,"right");
        window.location.reload();
    }
})
socket.on('user-joined',name=>{
    append(`${name} joined the chat`,'right');
    

})
// listening event receive from server
socket.on('receive',data=>{
    append(`${data.name}: ${data.message}`,'left')
    // append(`${getTime()}`,'left')
   
    audio.play();
}) 
socket.on('translated',data=>{
    append(`${data}`,'left');
    // const lastMessage = messageContainer.lastElementChild; // get the latest translated message

     const lastMsg = messageContainer.lastElementChild;

    setTimeout(() => {
        if (!lastMsg) return;

        lastMsg.classList.add('fade-out'); // apply fade effect

        setTimeout(() => {
            lastMsg.remove(); // remove from DOM after fading
        }, 700); // must match transition duration!
    }, 3000);

})
socket.on('receive-img',(imgData)=>{
    appendImage(imgData.image,'left');
    audio.play();
})
socket.on('receive-pdf', (pdfData) => {
    appendPDF(pdfData.name, pdfData.pdf, 'left');
    audio.play();
})
socket.on('left-chat',name=>{
    append(`${name} left the chat`,'left')
})    
socket.on('translate_input',data=>{
    messageInput.value=data;
}) 
let typingTimeout;
socket.on('type',name=>{
    // append(`${name} is typing...`,'left');
    const typingDiv = document.getElementById('typing');
    typingDiv.innerText = `${name} is typing...`;
    clearTimeout(typingTimeout);

    typingTimeout = setTimeout(() => {
        typingDiv.innerText = "";
    }, 4000); // Remove after 1 sec
    // setTimeout(() => {
    //     append(`${name} is typing`);
        
    // }, 4000);
})

messageInput.addEventListener('dblclick',(e)=>{
    socket.emit('translate_input',messageInput.value);
})     
form.addEventListener('submit',(e)=>{
    e.preventDefault();
    // page will not reload
    const mess=messageInput.value;
    append(`You:${mess}`,'right');
    socket.emit('send',mess);
    messageInput.value='';

})

