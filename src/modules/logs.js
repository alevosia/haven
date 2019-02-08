const Discord = require('discord.js');
const config  = require('../config.js');
const util    = require('./utility.js');
const zxc = require('../modules/logger.js'); // winston logger

exports.LogMessageDelete = function(message) {

    // ignore if author of the message deleted is a bot or the owner of the server
    if (message.author.bot || message.author.id == config.OwnerID || !message.guild) return
    
    const nick = message.member.displayName;
    const avatar = message.author.avatarURL;
    const color = 0x510000;

    let text = "None";
    if (message.content) {
        text = message.content.length <= 300 ? message.content : message.content.substr(0, 300).concat('...');
    }
    
    const embed = new Discord.RichEmbed()
        .setAuthor(`${nick}'s message was deleted in ${message.channel.name}`, avatar)
        .setDescription(text)
        .setColor(color)
        .setTimestamp();

    if (message.attachments.size > 0) {
        if (message.attachments.first().height)
            embed.setThumbnail(message.attachments.first().proxyURL);
    }

    message.guild.channels.get(config.MessagesLogsChannelID).send({embed}).catch((err) => zxc.error(err));
}

exports.LogMessageEdit = function(oldMessage, updatedMessage) {

    if (oldMessage.content == updatedMessage.content || updatedMessage.author.bot 
        || updatedMessage.author.id == config.OwnerID || !oldMessage.guild) {
            return
    }
    
    const nick = updatedMessage.member.displayName;
    const avatar = updatedMessage.author.avatarURL;
    const color = 0xbab8b8;

    let oldText = 'None';
    let updatedText = 'None';
    
    if (oldMessage.content) {
        oldText = oldMessage.content.length <= 300 ? oldMessage.content : oldMessage.content.substr(0, 300).concat('...');
    }

    if (updatedMessage.content) {
        updatedText = updatedMessage.content.length <= 300 ? updatedMessage.content : updatedMessage.content.substr(0, 300).concat('...');
    }

    const embed = new Discord.RichEmbed()
        .setAuthor(`${nick} edited their message in ${updatedMessage.channel.name}`, avatar)
        .addField("Previously", oldText)
        .addField("Now", updatedText)
        .setColor(color)
        .setTimestamp();

    updatedMessage.guild.channels.get(config.MessagesLogsChannelID).send({embed}).catch((err) => zxc.error(err));
}

exports.LogServerJoin = function(pendingMember) {
    SendJoinEmbed(pendingMember);
}

exports.LogKickOrLeave = function(removedMember) {
    // gets 3 entries from the audit logs whose action type is DELETE
    removedMember.guild.fetchAuditLogs({type: "DELETE", limit: 3}).then(auditLogs => {

        // gets the first entry from the fetched entries
        const entry = auditLogs.entries.first();

        // if the first entry's target is the removed member and it the action is a kick, log it as kick
        if (entry.target.username == removedMember.user.username && entry.action == "MEMBER_KICK") {

            // fetches the member object from the executor of the kick
            removedMember.guild.fetchMember(entry.executor).then(officer => {
                SendKickEmbed(officer, removedMember, entry.reason);
            }).catch((err) => zxc.error(err));

        } else if (entry.action == "MEMBER_BAN_ADD"){ // LogBan already handles it
            return;
        } else {
            SendLeaveEmbed(removedMember);
            
            // if the user left the server while having the deserter role
            if (removedMember.roles.has(config.DeserterRoleID)) {
                removedMember.ban({days: 0, reason: "Deserting the cause"}).catch((err) => zxc.error(err));
            } else if (removedMember.roles.has(config.PendingRoleID)) {
                removedMember.ban({days: 0, reason: "Leaving the server while pending"}).catch((err) => zxc.error(err));
            }
        }
    }).catch((err) => zxc.error(err));
}

exports.LogBan = function(guild, bannedUser) {
    zxc.info("-----" + bannedUser.username + " WAS BANNED!!! ------");
    
    guild.fetchAuditLogs({type:"DELETE", limit: 1}).then(auditLogs => {

        const entry = auditLogs.entries.first();

        if (entry.target.username == bannedUser.username && entry.action == "MEMBER_BAN_ADD") {
            zxc.info(`${bannedUser.username} found in Audit Logs.`);
            // fetches the member object from the executor of the kick
            guild.fetchMember(entry.executor).then(officer => {
                SendUserBanEmbed(bannedUser, officer, entry.reason);
            }).catch((err) => zxc.error(err));
        }
        
    }).catch((err) => zxc.error(err));
}

exports.LogRevokeBan = function(guild, removedUserBan) {
    guild.fetchAuditLogs({type:"CREATE", limit: 1}).then(auditLogs => {

        zxc.info("Revoked ban of " + removedUserBan.username);
        const entry = auditLogs.entries.first();
        
        if (entry.target.username == removedUserBan.username && entry.action == "MEMBER_BAN_REMOVE") {
            // fetches the member object from the executor of the kick
            guild.fetchMember(entry.executor).then(officer => {

                guild.fetchAuditLogs({type: "CREATE", }).then(auditLogs2 => {
                    const results = auditLogs2.entries.findAll("target", removedUserBan);
                    for (let i=0; i<results.length; i++) {
                        if (results[i].target == removedUserBan && results[i].action == "MEMBER_BAN_ADD") {
                            const dateBanned = results[i].createdAt.toUTCString();
                            SendRevokeBanEmded(removedUserBan, dateBanned, officer);
                            break;
                        }
                    }
                }).catch((err) => zxc.error(err));
            }).catch((err) => zxc.error(err));
        }
    }).catch((err) => zxc.error(err));
}

function SendJoinEmbed(pendingMember) {
    const username  = pendingMember.user.username;
    const disc      = pendingMember.user.discriminator;
    const avatarURL = pendingMember.user.avatarURL;
    const id        = pendingMember.user.id;
    const createdAt = pendingMember.user.createdAt.toUTCString();

    const embed = new Discord.RichEmbed()
        .setTitle(username + "#" + disc + " joined the server")
        .addField("__User ID__", id)
        .addField("__Account Created__", createdAt)
        .setThumbnail(avatarURL)
        .setColor(0x32CD32)
        .setTimestamp();

    pendingMember.guild.channels.get(config.MembersLogsChannelID).send({embed})
    .catch((err) => zxc.error(err));
}

function SendLeaveEmbed(leaver) {
    const nickname  = leaver.displayName;
    const username  = leaver.user.username + "#" + leaver.user.discriminator;
    const id        = leaver.user.id;
    const avatarURL = leaver.user.avatarURL
    const joinedAt  = leaver.joinedAt.toUTCString();
    const roles     = util.GetRoles(leaver).toString();
    
    const embed = new Discord.RichEmbed()
        .setTitle(nickname + " left the server")
        .addField("__Username__", username)
        .addField("__User ID__", id, true)
        .addField("__Roles__", roles)
        .addField("__Joined At__", joinedAt, true)
        .setThumbnail(avatarURL)
        .setColor(0xcc0000)
        .setTimestamp();

    leaver.guild.channels.get(config.MembersLogsChannelID).send({embed})
    .catch((err) => zxc.error(err));
}

function SendKickEmbed(officer, removedMember, reason) {
    const nickname  = removedMember.displayName;
    const id        = removedMember.user.id;
    const username  = removedMember.user.username + "#" + removedMember.user.discriminator;
    const avatarURL = removedMember.user.avatarURL
    const joinedAt  = removedMember.joinedAt.toUTCString();
    const roles     = util.GetRoles(removedMember).toString();
    
    const embed = new Discord.RichEmbed()
        .setTitle(nickname + " has been kicked by " + officer.displayName)
        .addField("__Username__", username)
        .addField("__User ID__", id, true)
        .addField("__Reason__", reason)
        .addField("__Roles__", roles)
        .setFooter(`Joined: ${joinedAt}`)
        .setThumbnail(avatarURL)
        .setColor(0xe50000)
        .setTimestamp();

    officer.guild.channels.get(config.MembersLogsChannelID).send({embed})
    .catch((err) => zxc.error(err));
}

function SendUserBanEmbed(bannedUser, officer, reason) {
    const username  = bannedUser.username;
    const disc      = bannedUser.discriminator;
    const id        = bannedUser.id;
    const avatarURL = bannedUser.avatarURL
    
    const embed = new Discord.RichEmbed()
        .setTitle(username + "#" + disc + " has been banned by " + officer.displayName)
        .addField("__User ID__", id)
        .addField("__Reason__", reason)
        .setThumbnail(avatarURL)
        .setColor(0xff0000)
        .setTimestamp();

    officer.guild.channels.get(config.MembersLogsChannelID).send({embed})
    .catch((err) => zxc.error(err));
}

function SendRevokeBanEmded(removedUserBan, dateBanned, officer) {
    const username  = removedUserBan.username;
    const disc      = removedUserBan.discriminator;
    const id        = removedUserBan.id;
    const avatarURL = removedUserBan.avatarURL
    
    const embed = new Discord.RichEmbed()
        .setTitle(username + "#" + disc + "'s ban has been revoked by " + officer.displayName)
        .addField("__User ID__", id)
        .addField("__Date Banned__", dateBanned, true)
        .setThumbnail(avatarURL)
        .setColor(0x00dfff)
        .setTimestamp();

    officer.guild.channels.get(config.MembersLogsChannelID).send({embed})
    .catch((err) => zxc.error(err));
}