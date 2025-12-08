// antidelete.js
// Baileys හි getContentType function එක import කරන්න
const { getContentType } = require('@whiskeysockets/baileys');

// Antidelete Logic එකට zanta object එක index.js එකේ Plugin Loader එක මඟින් ලැබිය යුතුයි
module.exports = zanta => {

// Baileys 'messages.delete' Event Listener එක
zanta.ev.on('messages.delete', async (messageData) => { 
try {
// 1. Basic checks
if (!messageData || !messageData.keys || messageData.keys.length === 0) return;

const deleteKey = messageData.keys[0];  
// Bot එක delete කළ message නම් නොසලකා හරියි
if (deleteKey.fromMe) return; 

// 🛑 Debugging Log: Delete Event එක ක්‍රියාත්මක වූ බවට පරීක්ෂාව
console.log(`[ANTIDELETE LOG] Delete Event Fired for ID: ${deleteKey.id}`);

// 2. Cache එකෙන් මුල් පණිවිඩය ලබා ගැනීම
const deletedMessage = zanta.messages.get(deleteKey.id);

if (!deletedMessage) {
console.log(`[ANTIDELETE LOG] Message ID ${deleteKey.id} NOT FOUND in cache.`);
// Cache එකේ නොමැති නම් නවත්වන්න
return; 
}
console.log(`[ANTIDELETE LOG] Successfully retrieved message from cache.`);

// 3. Extract sender and chat info
const senderJid = deletedMessage.key.participant || deletedMessage.key.remoteJid;  
const senderNumber = senderJid.replace('@s.whatsapp.net', '');
const pushname = deletedMessage.pushName || senderNumber;

let text = "Message Content Not Found"; // Default text

// 4. Extract Message Content using getContentType (The Fix)
if (deletedMessage.message) {

// Ephemeral Message (View Once/Disappearing) Check
const effectiveMessage = deletedMessage.message.ephemeralMessage 
? deletedMessage.message.ephemeralMessage.message 
: deletedMessage.message;

        // Message Type එක getContentType මඟින් ලබා ගනී
const messageType = getContentType(effectiveMessage);
const content = effectiveMessage[messageType];

// Message Type එක අනුව Content extract කිරීම
switch (messageType) {
case 'conversation':
text = content || 'No Text Content';
break;
case 'extendedTextMessage':
text = content.text || content.caption || 'No Text Content';
break;
case 'imageMessage':
text = `PHOTO 🖼️`;
if (content.caption) {
text += `\n*Caption:* ${content.caption}`;
}
break;
case 'videoMessage':
text = `VIDEO 🎥`;
if (content.caption) {
text += `\n*Caption:* ${content.caption}`;
}
break;
case 'stickerMessage':
text = "STICKER 🌟";
break;
case 'documentMessage':
text = `DOCUMENT 📄 (${content.fileName || 'No Name'})`;
break;
case 'audioMessage':
text = "AUDIO 🎤";
break;
case 'contactMessage':
text = `CONTACT 📞: ${content.displayName || 'No Name'}`;
break;
case 'locationMessage':
text = `LOCATION 📍`;
break;
default:
text = `TYPE: ${messageType}`;
}
}

// 5. Create and Send the Notification Message
const deleteNotification = `
*🚫 MESSAGE DELETED!*
*👤 Sender:* ${pushname} (@${senderJid.split('@')[0]})
*🗑️ Deleted Content:*
--------------------------------
${text}
--------------------------------
`;

await zanta.sendMessage(
deleteKey.remoteJid, // Send back to the original chat/group
{
text: deleteNotification,
mentions: [senderJid] // Mention the user who deleted the message
}, 
{ quoted: deletedMessage } 
);

// 6. Cache එකෙන් පණිවිඩය ඉවත් කිරීම
zanta.messages.delete(deleteKey.id);


} catch (error) {
console.error("Error in AntiDelete Plugin:", error);
}
});
};
