const { cmd } = require("../command");
const tiktokdl = require("@faouzkk/tiktok-dl");

// 📦 APK DOWNLOADER
cmd({
    pattern: "apk",
    react: "📦",
    desc: "Download APK File via direct link.",
    category: "download",
    filename: __filename
}, async (zanta, mek, m, { from, reply, q }) => {
    try {
        if (!q || !q.startsWith("http")) return reply("❌ *කරුණාකර APK Direct Link එකක් ලබා දෙන්න.*");

        await reply("🔄 *APK එක Download වෙමින් පවතී...*");

        await zanta.sendMessage(from, {
            document: { url: q },
            mimetype: "application/vnd.android.package-archive",
            fileName: `App-${Date.now()}.apk`,
            caption: "*📦 Your APK is ready!*\n\n> *© ZANTA-MD*"
        }, { quoted: mek });

    } catch (e) {
        reply(`❌ *Error:* ${e.message}`);
    }
});

// 🕺 TIKTOK DOWNLOADER
cmd({
    pattern: "tiktok",
    alias: ["ttdl"],
    react: "🕺",
    desc: "Download TikTok Video without watermark.",
    category: "download",
    filename: __filename
}, async (zanta, mek, m, { from, reply, q }) => {
    try {
        if (!q || !q.includes("tiktok.com")) return reply("❌ *කරුණාකර වලංගු TikTok Link එකක් ලබා දෙන්න.*");

        await reply("🔄 *TikTok වීඩියෝව ලබා ගනිමින් පවතී...*");

        const result = await tiktokdl(q, { version: "v2" });
        if (!result || !result.video.no_watermark) return reply("❌ *වීඩියෝව සොයාගත නොහැකි විය.*");

        await zanta.sendMessage(from, {
            video: { url: result.video.no_watermark },
            mimetype: "video/mp4",
            caption: `*🕺 TikTok Downloaded!*\n\n*👤 Creator:* ${result.author.unique_id || 'N/A'}\n\n> *© ZANTA-MD*`
        }, { quoted: mek });

    } catch (e) {
        reply(`❌ *Error:* ${e.message}`);
    }
});
