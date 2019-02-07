const { Command } = require('discord.js-commando');
const neko        = require('../../modules/neko.js');

module.exports = class HugCommand extends Command {
    
    constructor(Bot) {
        super(Bot, {
            name: 'slap',
            group: 'images',
            memberName: 'slap',
            description: 'Sends a slap GIF',
            guildOnly: true
        });
    }

    run(message) {
        return neko.SFW(message);
    }
}