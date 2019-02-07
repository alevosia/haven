const { Command } = require('discord.js-commando');
const neko        = require('../../modules/neko.js');

module.exports = class CuddleCommand extends Command {
    
    constructor(Bot) {
        super(Bot, {
            name: 'cuddle',
            group: 'images',
            memberName: 'cuddle',
            description: 'Sends a cuddle GIF',
            guildOnly: true
        });
    }

    run(message) {
        return neko.SFW(message);
    }
}