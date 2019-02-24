const { Command } = require('discord.js-commando');
const neko        = require('../../modules/neko.js');
const config      = require('../../config.js');
const zxc = require('../../modules/logger.js'); // winston logger

module.exports = class NSFWCommand extends Command {
    constructor(Bot) {
        super(Bot, {
            name: 'nsfw',
            group: 'fun',
            memberName: 'nsfw',
            description: 'posts an NSFW image based on the category given',
            guildOnly: true,
            args: [
                {
                    key: 'text',
                    prompt: 'what category do you want?',
                    type: 'string'
                }
            ],
            throttling: {
                usages: 3,
                duration: 60
            }
        });
    }
    
    run(message, {text}) {
        if (message.channel.id == config.PervsChannelID || message.channel.id == config.BotSettingsChannelID
                && message.member.roles.has(config.PervRoleID)) {
            return neko.NSFW(message, text);
        } else {
            message.reply('Hm?').then().catch(err => zxc.error(err));
        }
    }
}