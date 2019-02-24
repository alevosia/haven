const { Command } = require('discord.js-commando');
const neko        = require('../../modules/neko.js');

module.exports = class BakaCommand extends Command {
    
    constructor(Bot) {
        super(Bot, {
            name: 'baka',
            group: 'images',
            memberName: 'baka',
            description: 'Sends a baka GIF',
            guildOnly: true,
            throttling: {
                usages: 1,
                duration: 60
            }
        });
    }

    run(message) {
        return neko.SFW(message);
    }
}