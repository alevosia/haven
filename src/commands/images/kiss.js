const { Command } = require('discord.js-commando');
const neko        = require('../../modules/neko.js');

module.exports = class HugCommand extends Command {
    
    constructor(Bot) {
        super(Bot, {
            name: 'kiss',
            group: 'images',
            memberName: 'kiss',
            description: 'Sends a kiss GIF',
            guildOnly: true
        });
    }

    run(message) {
        return neko.SFW(message);
    }
}