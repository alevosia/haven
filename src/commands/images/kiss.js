const { Command } = require('discord.js-commando');
const neko        = require('../../modules/neko.js');

module.exports = class HugCommand extends Command {
    
    constructor(Bot) {
        super(Bot, {
            name: 'kiss',
            group: 'images',
            memberName: 'kiss',
            description: 'Sends a kiss GIF',
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