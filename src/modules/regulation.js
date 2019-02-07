const { RichEmbed, MessageReaction, User, GuildMember } = require('discord.js')
const config = require('../config.js');
const util = require('./utility.js');
const zxc = require('../modules/logger.js'); // winston logger

exports.SetPendingRole = function(pendingMember) {
    // sets the role of the new member to pending
    pendingMember.setRoles([config.PendingRoleID]).then(pendingMember => {
        SendPendingMessage(pendingMember);
    }).catch(err => zxc.error(err));
}

/**
 * @param {MessageReaction} reaction
 * @param {User} reactor
 */
exports.PendingMemberVerification = function(reaction, reactor) {

    // return if the reaction is not a verified emoji or the author/reactor is a bot
    if (reaction.emoji.name != config.VerifiedEmojiName || reaction.message.author.bot || reactor.bot) return;

    // fetches the member object named officer from the reactor user
    reaction.message.guild.fetchMember(reactor).then(reactor => {

        // return if the reactor is not an officer
        if (!util.IsOfficer(reactor)) {
            reaction.message.clearReactions().catch(err => zxc.error(err));
            return reaction.message.channel.send(`${reactor}, you don't have the authority to verify pending members.`)
            .catch(err => zxc.error(err));

        // if the officer tried to verify their own
        } else if (reaction.message.author.id == reactor.id) {
            reaction.message.clearReactions().catch(err => zxc.error(err));
            return reaction.message.reply(`what are you trying to achieve?`).catch(err => zxc.error(err));
        }

        const officer = reactor;

        // if the member doesn't have an observer role or uh role yet
        if (!reaction.message.member.roles.has(config.UHMemberRoleID)) {

            // checks if the member's nickname isn't set yet
            if (!reaction.message.member.nickname) {
                reaction.message.clearReactions().catch(err => zxc.error(err));
                const msg = `${reactor}, please set ${reaction.message.member}'s nickname to their`
                        + ` Warframe alias first then react <:verified:454921755505459200> to their message again.`
                        + ` If their Discord username is the same as their alias, add an \* at the end of their nickname.`
                return reaction.message.channel.send(msg).catch(err => zxc.error(err));
                
            } else {
                // sets the roles of the pending member to Unforsaken Haven then sends the welcome messages
                reaction.message.member.setRoles([config.UHMemberRoleID]).then(verifiedMember => {
                    SendMemberVerificationEmbed(officer, verifiedMember);
                    SendLoungeWelcomeMessage(verifiedMember);
                    SendMemberWelcomeDM(verifiedMember);
                }).catch(err => zxc.error(err));
            }
        } else { 
            reaction.message.clearReactions().catch(err => zxc.error(err));
            reaction.message.channel.send(officer + ", " + reaction.message.member.displayName + " is already verified.")
            .catch(err => zxc.error(err)); 
        }

    }).catch(err => zxc.error(err));
}

function SendPendingMessage(pendingMember) {
    pendingMember.guild.channels.get(config.PendingChannelID).send(
        "**Welcome to Unforsaken Haven's Discord server, " + pendingMember + "!**" +
        "\nPlease state your name in Warframe and the name of who contacted or invited you in game." +
        "\nAfter doing so, wait until the officers have confirmed who you are." +
        "\nAs soon as your identity's confirmed, a role will be assigned to you and you'll be able to access the server." +
        "\n\nCheck out our clan rules in the " + pendingMember.guild.channels.get(config.InfoChannelID) + " channel as you wait."
    ).then(sentMessage => {}).catch(err => zxc.error(err));
}

function SendLoungeWelcomeMessage(member) {
    const number = Math.floor(Math.random() * 19);
    let message;
    
    switch (number)
    {
    case 0: message = "Welcome to our secret base, " + member + "! Don't get lost next time."; break;
    case 1: message = "Attention! " + member + " says thank you for your attention."; break;
    case 2: message = "Yo yo yo yo! " + member + " is in da hauz!"; break;
    case 3: message = "This not a drill! I repeat. This is not a drill! " + member + " is really here!"; break;
    case 4: message = "Everybody stop what you're doing and give " + member + " a warm welcome."; break;
    case 5: message = "The prophecy has been fulfilled! " + member + " has finally come."; break;
    case 6: message = "Blessed are the servers where " + member + " is present."; break;
    case 7: message = "Say what ever you want. I say we celebrate " + member + "'s decision to join us.";
    case 8: message = "Alas! " + member + " has decided to join us. Welcome!"; break;
    case 9: message = "Places, everyone. Places! Inspector " + member + " is here to check our ~~sanity~~ sanitation."; break;
    case 10: message = "Summoning complete. Let " + member + " at 'em!";
    case 11: message = "Don't do unto " + member + " what you don't want " + member + " to do to you especially not giving a nice welcome!"; break;
    case 12: message = "Give unto the void and the void giveth " + member + " back."; break;
    case 13: message = "A quick brown " + member + " jumped over the #pending channel with the help of a lazy officer. Welcome!"; break;
    case 14: message = member + " has come to end our suffering in these dire times, ingrates!"; break;
    case 15: message = "We don't deserve " + member + ", but here they are. Welcome!"; break;
    case 16: message = "Does this look familliar to you? " + member.user.avatarURL;
    case 17: message = "Take " + member + " off the most wanted list. We finally got them."; break;
    default: message = "We called and no one answered. But now that " + member + " is here. What do we say?"; break;
    }

    member.guild.channels.get(config.LoungeChannelID).send(message)
        .then(sentMessage => {
            zxc.info("Sent: " + sentMessage.content);
        }).catch(err => zxc.error(err));
}

function SendMemberWelcomeDM(verifiedMember) {

    const infoChannel = verifiedMember.guild.channels.get(config.InfoChannelID);

    verifiedMember.send(":tada: __**Welcome to Unforsaken Haven!**__ :tada:"
    + "\n\nHi! I'm Haven, Unforsaken Haven's Cephalon. Nice to meet you!"
    + " I am here to congratulate you as you have been verified by the officers as a member of the clan" 
    + " and have been granted full access of our Discord server. Feel free to look around the channels and"
    + " familiarize yourself with the topics. Also, please check out the " + infoChannel + " channel and read our clan"
    + " rules and policies. Be sure to follow them at all times if you'd like to stay in this wonderful community we have."
    + "\n\nIf you need anything else, don't hesitate to ask me or your clannies in game or in Discord."
    + " Have fun and enjoy your stay, Tenno:heart_exclamation:"
    ).then(sentMessage => {}).catch(err => zxc.error(err));
}

function SendMemberVerificationEmbed(officer, verifiedMember) {
    // creates the rich embed
    const embed = new RichEmbed()
    .setAuthor(verifiedMember.displayName + " was verified as a clan member by " 
        + officer.displayName, config.VerifiedEmojiImageURL) //verified check image
    .setColor(0xffe500);
    
    // sends the embed to the logs channel
    officer.guild.channels.get(config.MembersLogsChannelID).send({embed}).then(sentMessage => {
        zxc.info("Sent: " + sentMessage.embeds[0].author.name);
    }).catch(err => zxc.error(err));
}

/**
 * @param {GuildMember} oldMember
 */
exports.PreventManualMemberRoleSetting = function(oldMember, newMember) {
    // checks if the user member previously had the pending role/none and now has a uh role
    if ((oldMember.roles.has(config.PendingRoleID) || oldMember.roles.size == 1) && newMember.roles.has(config.UHMemberRoleID)) {

        // fetches 3 entries from the audit logs that has an action type of UPDATE that involves the pending member
        oldMember.guild.fetchAuditLogs({type: "UPDATE"}).then(auditLogs => {

            // gets the entry that has an action of member role update
            const entry = auditLogs.entries.find("target", oldMember.user);
            if (!entry) return

            // fetches the executor of the action
            oldMember.guild.fetchMember(entry.executor).then(executor => {
                if (executor.user.bot) return; // return if the executor is a bot

                // if the executor is a person, set the roles of the user back to pending
                newMember.setRoles([config.PendingRoleID]).then(pendingMember => {
                    pendingMember.guild.channels.get(config.PendingChannelID)
                        .send(`${executor}, please react <:verified:454921755505459200> to ${pendingMember}'s message if you have verified them` +
                        ` as a member of the clan. If that fails, have them re-enter their IGN and react to the new message.`);
                }).catch(err => zxc.error(err));
            }).catch(err => zxc.error(err));
        }).catch(err => zxc.error(err));
    }
}