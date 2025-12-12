const { cmd } = require("../command");
const { getContentType } = require("@whiskeysockets/baileys"); 

// 🖼️ SAVE View Once Image Command
cmd(
{
    pattern: "save",
    react: "💾",
    desc: "Saves View Once image.",
    category: "media",
    filename: __filename,
},
async (zanta, mek, m, { from, reply }) => {
    try {
        if (!m.quoted) {
            return reply("කරුණාකර *View Once Image* පණිවිඩයක් Reply කරන්න.");
        }

        const quotedObject = m.quoted;

        // 1. 🚨 FIX: Inner Message එක ලබා ගැනීම (Android Fixes අන්තර්ගතයි)
        let innerMessage = quotedObject.msg || quotedObject.message; 

        // 1.1. 💡 View Once Wrapper Layer එකක් තවමත් තිබේදැයි පරීක්ෂා කිරීම
        const quotedType = getContentType(innerMessage || quotedObject.message);

        if (quotedType === 'viewOnceMessage') {
             // VO V1 Wrapper එක ඇතුළත ඇති සැබෑ Message Content එක ලබා ගැනීම
             const voContent = innerMessage.viewOnceMessage.message;
             innerMessage = voContent[getContentType(voContent)];
        } else if (quotedType === 'viewOnceMessageV2') {
             // VO V2 Wrapper එක ඇතුළත ඇති සැබෑ Message Content එක ලබා ගැනීම
             const voContent = innerMessage.viewOnceMessageV2.message;
             innerMessage = voContent[getContentType(voContent)];
        } 

        // 1.2. දත්ත නොමැති නම් පරීක්ෂා කිරීම
        if (!innerMessage) {
            return reply(`❌ Reply කළ පණිවිඩයේ දත්ත සොයා ගැනීමට නොහැක.`);
        }

        // 2. 🚨 FINAL CHECK: View Once Message එකක් දැයි පරීක්ෂා කිරීම (viewOnce: true property එක)
        // දැන් innerMessage යනු imageMessage object එක විය යුතුය.
        const isViewOnce = innerMessage.viewOnce === true;

        if (!isViewOnce) {
            // එය View Once Message එකක් නොවේ නම්, Type එක පෙන්වමු.
            const type = innerMessage.type || getContentType(innerMessage);
            return reply(`මෙය *View Once Image* පණිවිඩයක් නොවේ. (Actual Type: ${type})`);
        }

        // 3. Image එකක්දැයි පරීක්ෂා කිරීම
        const actualMessageType = innerMessage.type || getContentType(innerMessage);

        if (actualMessageType !== 'imageMessage') {
            return reply("කරුණාකර *Image* එකක් Reply කරන්න.");
        }

        reply("💾 View Once Image එක Download කරමින්...");

        // 4. Media Buffer එක Download කිරීම
        // m.quoted.download() මගින් Inner Image Data එක කෙලින්ම ගනී.
        const mediaBuffer = await quotedObject.download();

        if (!mediaBuffer || mediaBuffer.length === 0) {
            return reply("❌ Image එක Download කිරීමට නොහැකි විය.");
        }

        // 5. Image එක නැවත Chat එකට යැවීම
        await zanta.sendMessage(
            from,
            {
                image: mediaBuffer,
                caption: `🖼️ *Saved View Once Image*\nSender: @${quotedObject.sender.split('@')[0]}`,
                mentions: [quotedObject.sender]
            },
            { quoted: mek }
        );

        await zanta.sendMessage(from, { react: { text: '✅', key: mek.key } });

    } catch (e) {
        console.error("Save Command Error:", e);
        reply(`*Error:* Save කිරීමේදී දෝෂයක් සිදුවිය. ${e.message}`);
    }
}
);
