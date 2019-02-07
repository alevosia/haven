const { Command } = require('discord.js-commando');
const { Message } = require('discord.js');
const zxc = require('../../modules/logger.js'); // winston logger

class TriviaCommand extends Command {

    constructor(Bot) {
        super(Bot, {
            name: 'trivia',
            group: 'fun',
            memberName: 'trivia',
            description: 'Sends a trivia a queston',
            guildOnly: true,
            throttling: {
                usages: 3,
                duration: 30
            }

        })

        this.api = 'https://opentdb.com/api.php?';
    }
    /**
     * @param {Message} message 
     */
    run(message) {
        const args = message.content.toLowerCase().split(' ');
        zxc.info(args.toString());
    }
}