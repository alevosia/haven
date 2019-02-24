const { Command } = require('discord.js-commando');
const neko        = require('../../modules/neko.js');

module.exports = class HugCommand extends Command {
    
    constructor(Bot) {
        super(Bot, {
            name: 'pat',
            group: 'images',
            memberName: 'pat',
            description: 'Sends a pat GIF',
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