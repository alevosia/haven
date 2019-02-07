const { Command } = require('discord.js-commando');
const neko        = require('../../modules/neko.js');

module.exports = class HugCommand extends Command {
    
    constructor(Bot) {
        super(Bot, {
            name: 'smug',
            group: 'images',
            memberName: 'smug',
            description: 'Sends a smug GIF',
            guildOnly: true
        });
    }

    run(message) {
        return neko.SFW(message);
    }
}