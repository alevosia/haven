const config  = require('../config.js');
const util = require('./utility.js');
const zxc = require('../modules/logger.js'); // winston logger

exports.ProfanityFilter = function(message) {
    if (util.IsOfficer(message.member)) return;

    const text = message.content.toLowerCase();

    // loops through each profanities listed
    for (let i = 0; i < config.Profanities.length; i++) {

        // if the message contains a profanity
        if (text.includes(config.Profanities[i])) {

            message.reply("watch your mouth.").catch((err) => zxc.error(err));
            return true
        }
    }
    return false
}

exports.ContainsTradingMessage = function(message) {
    const text = message.content.toLowerCase();
    
    // loops through each trading messages listed
    for (let i=0; i<config.TradingMessages.length; i++) {

        // if the message starts with a trading message
        if (text.startsWith(config.TradingMessages[i])) {

            message.reply("please post any trading-related messages at " 
                + message.guild.channels.get(config.TradingChannelID) + " channel. Thank you!")
                    .catch((err) => zxc.error(err));
            return true
        }
    }
    return false
}

exports.ContainsBotCommand = function(message) {
    if (util.IsOfficer(message.member)) return;
    
    const text = message.content.toLowerCase();
    
    if (text.startsWith("n!trivia")) {
        if (message.channel.id == config.TriviaContestChannelID) {
            return true
        } else  {
            message.reply("please use Nitro's trivia command at " + message.guild.channels.get(config.TriviaContestChannelID)
                + " channel. Thank you!").catch((err) => zxc.error(err));
            return true
        }
    } else {
        // loops through each bot prefix
        for (let i=0; i<config.BotsPrefixes.length; i++) {

            // checks if the message starts with a bot prefix
            if (text.startsWith(config.BotsPrefixes[i])) {
                
                message.reply("please use bot commands at " + message.guild.channels.get(config.BotsSpamChannelID)
                    + " channel. Thank you!").catch((err) => zxc.error(err));
                return true
            }
        }
    }
    return false
}


