const config = require('../config.js');
const util   = require('./utility.js');
const zxc    = require('../modules/logger.js'); // winston logger
const { Message } = require('discord.js');

exports.Infect = function(message, infectedList) {
    // ignore if no member is mentioned
    if (message.mentions.members.size <= 0) return;

    // checks if the one attempting to infect is infected or an officer
    if (exports.IsInfected(message.member, infectedList) || util.IsOfficer(message.member)) {
        const target = message.mentions.members.first()
        const targetName = target.displayName;

        // if the target is the owner of the bot
        if (target.user.id == config.OwnerID || target.user.bot) {
            message.reply("nice try.").then(sentMessage => {
                zxc.info("Sent: " + sentMessage.content);
            }).catch(err => zxc.error(err));
            return
        }

        // checks if the target is not yet infected
        if (!exports.IsInfected(target, infectedList)) {

            infectedList[targetName] = Date.now();
            message.channel.send(target + " has been infected with 💩 by " + message.member + ".")
            .then(sentMessage => {
                zxc.info("Sent: " + sentMessage.content);
            }).catch(err => zxc.error(err));
            zxc.info(infectedList);

        } else {
            message.reply(target.displayName + " is already infected.").then(sentMessage => {
                zxc.info("Sent: " + sentMessage.content);
            }).catch(err => zxc.error(err));
        }

    } else {
        message.reply("only infected members may infect others.").then(sentMessage => {
            zxc.info("Sent: " + sentMessage.content);
        }).catch(err => zxc.error(err));
    }
}

exports.Heal = function(message, infectedList) {
    if (message.mentions.members.size <= 0) return;

    // if the one attempting to heal is not infected or the owner of the bot
    if (!exports.IsInfected(message.member, infectedList) || message.author.id == config.OwnerID) {

        if (message.mentions.members.size > 0) {

            const target = message.mentions.members.first()
            const targetName = target.displayName;

            // no self-healing allowed
            if (targetName == message.member.displayName) {
                message.reply("you can't heal yourself. :stuck_out_tongue:").then(sentMessage => {
                    zxc.info("Sent: " + sentMessage.content);
                }).catch(err => zxc.error(err));
                return
            }

            // checks if the target is infected
            if (exports.IsInfected(target, infectedList)) {

                delete infectedList[targetName];

                message.channel.send(":flag_gg: " + target + " has been healed by " + message.member + ".").then(sentMessage => {
                    zxc.info("Sent: " + sentMessage.content);
                }).catch(err => zxc.error(err));
                zxc.info(infectedList);

            } else {
                message.reply(target.displayName + " is not infected.").then(sentMessage => {
                    zxc.info("Sent: " + sentMessage.content);
                }).catch(err => zxc.error(err));
            }
        } else {
            message.reply("you have to mention someone to heal.").then(sentMessage => {
                zxc.info("Sent: " + sentMessage.content);
            }).catch(err => zxc.error(err));
        }
    } else {
        message.reply("only the pure may heal the infected.").then(sentMessage => {
            zxc.info("Sent: " + sentMessage.content);
        }).catch(err => zxc.error(err));
    }
}

// removes all who has been infected for more than 15 minutes
exports.AutoHeal = function(infectedList, Bot) {
    for (let name in infectedList) {

        const timeElapsed = Date.now() - infectedList[name];

        if (timeElapsed >= 900000) { // milliseconds - 15 minutes

            delete infectedList[name];

            Bot.channels.get(config.BotsSpamChannelID).send(":flag_gg: " + name + " has been healed by time.")
                .then(sentMessage => {
                    zxc.info("Sent: " + sentMessage.content);
                }).catch(err => zxc.error(err));
        } 
    }
}

exports.IsInfected = function(member, infectedList) {
    // checks if the member is in the infected list
    for (let name in infectedList) {
        if (member.displayName == name) {
            return true
        }
    }
    return false
}

exports.Cleanse = function(message, infectedList) {
    if (message.author.id == config.OwnerID) {

        // deletes all names in the infected list
        for (let name in infectedList) {
            delete infectedList[name];
        }
        zxc.info(infectedList);

        message.channel.send(":flag_gg: All infected members have been alleviated.")
        .then(sentMessage => {
            zxc.info("Sent: " + sentMessage.content);
        }).catch(err => zxc.error(err));

    } else {
        message.reply("you don't wield that ability.").then(sentMessage => {
            zxc.info("Sent: " + sentMessage.content);
        }).catch((err) => zxc.error(err));
    }
}

exports.OneWordStory = function(message, lastPerson) {
    return new Promise((resolve, reject) => {
        const word = message.content;

        if (message.member.displayName == lastPerson || word.includes(" ") || word.includes("\n")|| word.includes("_")) {
            message.delete().catch((err) => zxc.error(err));
            return resolve(lastPerson);
        } else if (word.length > config.MaxWordLength) {
            if (!word.includes(`<`) && !word.includes(`>`)) {
                message.delete().catch((err) => zxc.error(err));
                return resolve(lastPerson);
            }
        }
        
        if (word == '.' || word == '!' || word == '?') {
            message.channel.fetchMessages({limit: 100}).then(messages => {
                const messages_array = messages.array();
                const word_list = [];
    
                for (let i=1; i<messages_array.length; i++) {
                    if (messages_array[i].author.bot) break;
                    word_list.unshift(messages_array[i]);
                }
    
                if (word_list.length <= 1) {
                    message.delete().catch(err => zxc.error(err));
                    return resolve(lastPerson);
                }
    
                const story = word_list.join(" ").concat(word);
                message.channel.send(story).then(msg => {
                    zxc.info(`Story Sent: ${msg.content}`);
                    return resolve(message.member.displayName);
                }).catch(err => zxc.error(err));
            })
        } else {
            return resolve(message.member.displayName);
        }
    })
}

/**
 * @param {Message} message
 */
exports.CheckOneWordStoryEdit = function(message) {

    const word = message.content;

    if (word.includes(" ") || word.includes("\n")|| word.includes("_")) {
        message.delete().catch((err) => zxc.error(err));
    } else if (word.length > config.MaxWordLength) {
        if (!word.includes(`<`) && !word.includes(`>`)) {
            message.delete().catch((err) => zxc.error(err));
        }
    }
}

exports.CleverBot = function(message, clever) {

    message.channel.startTyping();

    let text = message.content;
    text = text.replace("<@!432912965130387456>", "");
    text = text.replace("<@432912965130387456>", "").trim();
    
    zxc.info(`${message.guild ? `Mentioned by ${message.member.displayName}` : `DM from ${message.author.username}`}: ${text}`);
    
    clever.ask(text, (err, response) => {

        if (err) return message.reply("I am speechless.").catch(err => zxc.error(err));

        message.channel.stopTyping(true);

        message.reply(response).then(sent=> {
            zxc.info(`Replied to ${message.author.username}: ${sent.content}`);
        }).catch(err => zxc.error(err));

    });
}