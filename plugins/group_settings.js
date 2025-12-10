const { cmd, commands } = require("../command");
const { getGroupAdmins } = require("../lib/functions");

// --- 🛡️ Core Admin Check Helper Function ---
// Mute/Unmute වැනි commands සඳහා මෙය තවමත් Bot Admin Check එක සිදු කරයි.
const checkAdminStatus = async (zanta, from, reply, isGroup, m, requireUserAdmin = true) => {
    if (!isGroup) {
        reply("*This command can only be used in a Group!* 🙁");
        return false;
    }

    try {
        let groupMeta = await zanta.groupMetadata(from);
        const botJid = zanta.user.id.includes(':') ? zanta.user.id.split(':')[0] + '@s.whatsapp.net' : zanta.user.id;
        const senderJid = m.sender; 
        
        const admins = getGroupAdmins(groupMeta.participants);
        const isBotAdminNew = admins.includes(botJid);
        const isUserAdminNew = admins.includes(senderJid);

        // Mute/Unmute වැනි Group Settings වෙනස් කිරීමට Bot Admin අත්‍යවශ්‍යයි.
        if (!isBotAdminNew) {
            return false; // Silent Stop
        }
        
        // User Admin අවශ්‍ය නම් පරීක්ෂා කරයි
        if (requireUserAdmin && !isUserAdminNew) {
            reply("*You must be an Admin to use this command!* 👮‍♂️❌");
            return false;
        }

        return true; 
        
    } catch (e) {
        console.error("Error fetching Group Metadata for Admin check:", e);
        reply("*Error:* Failed to check admin status. Please ensure I am an admin and try again. 😔");
        return false;
    }
};


// --- MUTE/CLOSE COMMAND ---
cmd(
  {
    pattern: "mute",
    alias: ["close"],
    react: "🔒",
    desc: "Closes the group.",
    category: "group",
    filename: __filename,
  },
  async (zanta, mek, m, { from, reply, isGroup }) => {
    // Admin Check එක තබා ඇත (මෙය Admin commands නිසා)
    if (!await checkAdminStatus(zanta, from, reply, isGroup, m)) return;

    try {
      reply("*Closing group for members... 🔒*");
      await zanta.groupSettingUpdate(from, 'announcement');
      return reply(`*Group successfully closed! Only Admins can send messages now. 🤐✅*`);
      
    } catch (e) {
      console.error(e);
      reply(`*Error:* Failed to mute the group. ${e.message || e}`);
    }
  }
);

// --- UNMUTE/OPEN COMMAND ---
cmd(
  {
    pattern: "unmute",
    alias: ["open"],
    react: "🔓",
    desc: "Opens the group for all.",
    category: "group",
    filename: __filename,
  },
  async (zanta, mek, m, { from, reply, isGroup }) => {
    // Admin Check එක තබා ඇත
    if (!await checkAdminStatus(zanta, from, reply, isGroup, m)) return;

    try {
      reply("*Opening group for all members... 🔓*");
      await zanta.groupSettingUpdate(from, 'not_announcement');
      return reply(`*Group successfully opened! All members can send messages now. 💬✅*`);
      
    } catch (e) {
      console.error(e);
      reply(`*Error:* Failed to unmute the group. ${e.message || e}`);
    }
  }
);

// --- INVITE LINK COMMAND (NO ADMIN REQUIRED) ---
cmd(
  {
    pattern: "invite",
    alias: ["link"],
    react: "🔗",
    desc: "Get group invite link.",
    category: "group",
    filename: __filename,
  },
  async (zanta, mek, m, { from, reply, isGroup }) => {
    // 👈 Admin Check එක සම්පූර්ණයෙන්ම ඉවත් කර ඇත (ඕනෑම කෙනෙකුට භාවිතා කළ හැකියි)
    if (!isGroup) return reply("*This command is for Groups only!*");

    try {
      reply("*Generating Invite Link... 🔗*");
      
      const code = await zanta.groupInviteCode(from);
      
      if (!code) {
          // Bot Admin නොමැති නම් මෙහිදී Error එකක්/Null එකක් ලැබීමට ඉඩ ඇත.
          return reply("*Failed to generate the invite link. The bot may need to be a group admin.* 😔");
      }

      const inviteLink = `https://chat.whatsapp.com/${code}`;
      
      await zanta.sendMessage(
        from,
        { 
          text: `*🔗 Group Invite Link:*\n\n${inviteLink}`,
        },
        { quoted: mek }
      );
      
      return reply("> *වැඩේ හරි 🙃✅*");
      
    } catch (e) {
      console.error(e);
      reply(`*Error:* Failed to fetch the invite link. ${e.message || e}`);
    }
  }
);


// --- TAGALL COMMAND (NO ADMIN REQUIRED) ---
cmd(
  {
    pattern: "tagall",
    alias: ["all"],
    react: "🔔",
    desc: "Tags all members in group.",
    category: "group",
    filename: __filename,
  },
  async (zanta, mek, m, { from, reply, isGroup, q }) => {
    // 👈 Admin Check එක සම්පූර්ණයෙන්ම ඉවත් කර ඇත (ඕනෑම කෙනෙකුට භාවිතා කළ හැකියි)
    if (!isGroup) return reply("*This command is for Groups only!*");

    try {
        // Group metadata ලබා ගැනීම (Admin නොවුනත් සාමාජිකයන් ලැයිස්තුව ලබාගත හැකියි)
        let groupMeta = await zanta.groupMetadata(from);
        
        // All participants
        const participants = groupMeta.participants.map(p => p.id);
        
        let messageText = q || "*🔔 Attention Group! 🔔*";
        
        // Message එක Mention සමග යැවීම
        await zanta.sendMessage(from, {
            text: messageText,
            mentions: participants 
        }, { quoted: mek });
        
        return; // Command එක සාර්ථකව අවසන්
      
    } catch (e) {
      console.error("Error in tagall:", e);
      reply(`*Error:* Failed to tag all members. ${e.message || e}`);
    }
  }
);
