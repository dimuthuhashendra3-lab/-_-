const fs = require('fs');
if (fs.existsSync('config.env')) require('dotenv').config({ path: './config.env' });

function convertToBool(text, fault = 'true') {
    return text === fault ? true : false;
}
module.exports = {
SESSION_ID: process.env.SESSION_ID || "8MsmwD4K#912RVQxK8vQZHN3adk6Di2tO1w6xQaYkmWtM4lTw97k",
ALIVE_IMG: process.env.ALIVE_IMG || "https://raw.githubusercontent.com/Akashkavindu/ZANTA_MD/refs/heads/main/images/ChatGPT%20Image%20Nov%2021%2C%202025%2C%2001_21_32%20AM.png",
ALIVE_MSG: process.env.ALIVE_MSG || "*Hello👋...${BOT_NAME} Is Alive Now😍*\n\n*You can contact me using this link*\n\nhttp://wa.me/+94743404814?text=*Hey__ZANTA*\n\n*You can join my whatsapp group*\n\n*https://chat.whatsapp.com/EChgJJtPHbY8IvrHApocWc*\n\n*You can join Our Whatsapp Chanel*\n\n*https://whatsapp.com/channel/0029VbBc42s84OmJ3V1RKd2B*\n\n> ZANTA MD WA BOT",
BOT_OWNER: '94743404814',  // Replace with the owner's phone number
BOT_NAME: process.env.BOT_NAME || "ZANTA-MD",  // Set your bot name
};
