const { Command } = require('discord.js-commando');
const zxc = require('../../modules/logger.js'); // winston logger

module.exports = class GuessCommand extends Command {
    constructor(Bot) {
        super(Bot, {
            name: 'guess',
            group: 'fun',
            memberName: 'guess',
            description: 'Guess the number and win a prize',
            guildOnly: true
        });
    }
    
    run(message) {
        const number = Math.floor((Math.random() * 100) + 1);

        message.reply("Guess the number I'm thinking and win an absurd prize...").catch(err => zxc.error(err));

        // the filter
        const filter = response => response.author == message.author;

        // waits for a response for the author
        message.channel.awaitMessages(filter, {maxMatches: 1, time: 10000, errors: ['time']}).then(response => {
            const guess = parseInt(response.first().content);
            if (isNaN(guess)) {
                message.reply("what?").catch(err => zxc.error(err));

            } else if (guess === number) {
                message.reply("Congratulations! DM Alev for your prize. :wink:").catch(err => zxc.error(err));
                
            } else {
                message.reply("Woops! It was " + (number) + ". Better luck next time! :yum:").catch(err => zxc.error(err));
            }

        }).catch(err => {
            message.reply("Uh oh! You've run out of time, sorry.").catch(err => zxc.error(err))
        });
    }
}