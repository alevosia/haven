const { Command } = require('discord.js-commando');
const { Message, RichEmbed } = require('discord.js');
const config = require('../../config.js');
const db = require('../../firebase/database.js');
const zxc = require('../../modules/logger.js'); // winston logger

class GetStarsCommand extends Command {

    constructor(Bot) {
        super(Bot, {
            name: 'stars',
            aliases: ['star'],
            group: 'utility',
            memberName: 'stars',
            description: 'Gets the number of stars your posts have accumulated.',
            guildOnly: true,
            throttling: {
                usages: 1,
                duration: 60
            }
        })
    }

    /**
     * @param {Message} message 
     */
    run(message) {
        const botSpamChannel = this.client.channels.get(config.BotsSpamChannelID);
        if (message.channel.id != botSpamChannel.id) {
            return message.reply(`please use bot commands at ${botSpamChannel}. Thanks.`)
        }

        let authorId = '';
        if (message.mentions.users.size > 0) {
            authorId = message.mentions.users.first().id;
        } else {
            authorId = message.author.id;
        }

        db.collection('starboard').where('authorID', '==', authorId).get()
            .then(snapshot => {
                if (snapshot.empty) {
                    return message.reply(`${message.author.id == authorId ? 'you' : 'they'} have no stars yet.`);
                }

                let stars = 0;
                snapshot.forEach(doc => { stars += doc.data().stars; }) // add all the stars from each document

                
                this.client.fetchUser(authorId, false)
                    .then(user => {

                        const embed = new RichEmbed()
                        .addField(`Member:`, user, true)
                        .addField(`Stars:`, `${stars} ⭐`, true)
                        .setThumbnail(user.displayAvatarURL)
                        .setColor(0xFFFF00);

                        message.channel.send({embed}).catch(err => zxc.error(err));
                    }).catch(err => {
                        zxc.error(err);
                        message.reply(err).catch(err => zxc.error(err));
                    })
                
            }).catch(err => zxc.error(err));
    }
}

module.exports = GetStarsCommand;