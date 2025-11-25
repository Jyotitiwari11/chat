
// const io = require('socket.io')(8000);
// const axios = require('axios');
const io = require('socket.io')(8000, {
    cors: {
        origin: "http://127.0.0.1:3000",
        methods: ["GET", "POST"]
    }
});

const users = {};

// async function translateText(text, targetLang = "en") {
//     try {
//         const res = await axios.post( "https://de.libretranslate.com/translate"
// , {
//             q: text,
//             source: "auto",   // detect language automatically
//             target: targetLang,
//             format: "text"
//         }, {
//             headers: { "Content-Type": "application/json" }
//         });

//         return res.data.translatedText;
//     } catch (err) {
//         console.log("Translation error:", err);
//         return text;  // fallback: return original message
//     }
// }
// async function translateText(text, targetLang = "en") {
//     try {
//         const res = await fetch("https://libretranslate.com/translate", {
//             method: "POST",
//             body: JSON.stringify({
//                 q: text,
//                 source: "auto",
//                 target: targetLang,
//                 format: "text"
//             }),
//             headers: { "Content-Type": "application/json" }
//         });

//         const data = await res.json();

//         // console.log("TRANSLATE RESPONSE:", data);   // Debug

//         // FIX: check if translatedText exists
//         if (!data.translatedText) {
//             return text; // fallback
//         }

//         return data.translatedText;
//     } 
//     catch (err) {
//         console.log("Translation Error:", err);
//         return text;
//     }
// }
async function googleTranslate(text, targetLang = "eng") {
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${targetLang}&dt=t&q=${encodeURIComponent(text)}`;
    
    try {
        const res = await fetch(url);
        const data = await res.json();

        // Google returns nested array -> extract translated text
        return data[0][0][0];
    } catch (error) {
        console.log("Translation error:", error);
        return text; // fallback
    }
}
// async function romanHindiToEnglish(text) {
//     const res = await axios.get("https://api.mymemory.translated.net/get", {
//         params: {
//             q: text,
//             langpair: "hi|en"
//         }
//     });
//     return res.data.responseData.translatedText;
// }

console.log('Socket.IO server listening on port 8000');

// io.on will listen for incoming connections; socket.on listens for events from a particular client
io.on('connection', socket => {
    console.log('Client connected:', socket.id);

    socket.on('new-user-joined', name => {
        // console.log("nameis ",name);
        users[socket.id] = name;
        socket.broadcast.emit('user-joined', name);
        // broadcast.emit will send the message to all users except the one who joined
    });
    //   these are custom events created by us in socket.io
    socket.on('send', async msg => {
        // const translated = await translateText(msg); 
        // const translated = await googleTranslate(msg, "hi");
        // console.log("Translated text:", translated);
        // const translated = await romanHindiToEnglish(msg);
        socket.broadcast.emit('receive', { message: msg, name: users[socket.id] });
        // will send event to client 
    }); 
    socket.on('translate', async msg => {
        // const translated = await translateText(msg); 
        const translated = await googleTranslate(msg, "hi");
        socket.emit('translated', translated);
    });
    socket.on('translate_input', async msg => {
        const translated = await googleTranslate(msg, "eng");
        socket.emit('translate_input', translated);
    });
    socket.on('send-img', (imgData) => {
    socket.broadcast.emit('receive-img', {
        name: users[socket.id],
        image: imgData
    });
});
socket.on('send-pdf', (pdfData) => {
    socket.broadcast.emit('receive-pdf', {
        name: users[socket.id],
        pdf: pdfData.data
    });
});
socket.on('type',data=>{
    socket.broadcast.emit('type',users[socket.id])
})

    // disconnect is a built-in event in socket.io
    socket.on('disconnect', message => {
        socket.broadcast.emit('left-chat',  users[socket.id] );
        delete users[socket.id];
        // will send event to client 
    });

  
});