const { RichEmbed } = require('discord.js');
const config = require('../config.js');
const zxc = require('../modules/logger.js'); // winston logger

class Giveaway {
    /**
     * @param {string} messageId 
     * @param {string} hostId 
     * @param {string} prize 
     * @param {number} winnersCount 
     * @param {string} imageURL 
     * @param {Date} endDate 
     * @param {boolean} ended 
     */
    constructor(messageId, hostId, prize, winnersCount, imageURL, endDate, ended) {
        this.messageId = messageId;
        this.hostId = hostId;
        this.prize = prize;
        this.winnersCount = winnersCount;
        this.imageURL = imageURL;
        this.endDate = endDate instanceof(Date) ? endDate : endDate.toDate();
        this.ended = ended;
    }

    update() {
        const Bot = require('../bot.js');
        const channel = Bot.channels.get(config.GiveawaysChannelID);

        if (!channel) return zxc.info(`Failed to load Giveaways channel for ${this.prize} giveaway. Trying again next update...`);

        channel.fetchMessage(this.messageId).then(message => {
            const embed = new RichEmbed()
                .setAuthor(`${this.prize} Giveaway!`)
                .setDescription(`React with :gift_heart: to join!`)
                .addField(`Host:`, `<@${this.hostId}>`, true)
                .addField(`Winners:`, this.winnersCount, true)
                .addField(`Time Remaining:`, this.durationString)
                .setFooter(`Ends`)
                .setTimestamp(new Date(this.endDate))
                .setThumbnail(this.imageURL)
                .setColor(0xf934ff) // peach

            message.edit({embed}).catch(err => zxc.error(err));
        }).catch(err => zxc.error(err));
    }

    end() {
        return new Promise((resolve, reject) => {
            const Bot = require('../bot.js');
            const channel = Bot.channels.get(config.GiveawaysChannelID);
    
            if (!channel) {
                zxc.error(`Failed to load Giveaways channel and end ${this.prize} giveaway.`);
                resolve(false);
            }
    
            channel.fetchMessage(this.messageId).then(giveawayMessage => {
    
                const giftReaction = giveawayMessage.reactions.get('💝');
    
                giftReaction.fetchUsers().then(users => {
    
                    users.delete(config.BotID); // removes the bot
    
                    // removes the host from the participants if present
                    if (users.has(this.hostId)) {
                        users.delete(this.hostId); 
                    }
    
                    const looters = users.keyArray(); // gets all the users' id into an array
                    const winners = [];
    
                    if (looters.length == 0) {
                        this.endGiveawayMessage(giveawayMessage, winners)
                            .then(success => {
                                if (success) {
                                    return resolve(true);
                                }
                            }).catch(err => reject(err));
                    }
    
                    for (let i=0; i<this.winnersCount; i++) {
                        const index = Math.floor(Math.random() * looters.length);
                        winners.push(`<@${looters.splice(index, 1)}>`);
                    }
                    zxc.info(`Winners: ${winners}`);
    
                    this.endGiveawayMessage(giveawayMessage, winners)
                        .then(success => {
                            if (success) {
                                return resolve(true);
                            }
                        }).catch(err => reject(err));

                }).catch(err => reject(err));
            }).catch(err => reject(err));
        })
    }

    endGiveawayMessage(giveawayMessage, winners) {

        return new Promise((resolve, reject) => {

            try {   
                const embed = new RichEmbed()
                .setAuthor(`${this.prize} Giveaway Ended`)
                .addField(`Host:`, `<@${this.hostId}>`)
                .addField(`Winners:`, (winners.length > 0 ? winners.join(' | ') : 'None'))
                .setFooter(`Ended`)
                .setTimestamp(new Date(this.endDate))
                .setThumbnail(this.imageURL)
                .setColor(0x000000) // black
            } catch (err) {
                return reject(err);
            }
            
            giveawayMessage.edit({embed}).then(endedGiveawayMessage => {

                const msg = `Congratulations ${winners.join(', ')}! You won the **${this.prize}** giveaway! :tada:\n`
                    + `Contact <@${this.hostId}> for your prize.`;

                endedGiveawayMessage.channel.send(winners.length > 0 ? msg : `Nobody joined the **${this.prize}** giveaway. :cry:`)
                    .then(sent => {
                        resolve(true);
                    }).catch(err => reject(err));
            }).catch(err => reject(err));
        })
    }

    get durationString() {
        // duration in seconds
        const duration = Math.floor((this.endDate - Date.now()) / 1000);

        const days = Math.floor(duration / 86400);
        const hours = Math.floor(duration % 86400 / 3600);
        const minutes = Math.floor(duration % 3600 / 60);
        const seconds = Math.floor(duration % 60);
    
        const string = `${ (days ? ` ${days} days` : '') }` +
                     `${ (hours ? ` ${hours} hours` : '') }` +
                     `${ (minutes ? ` ${minutes} minutes` : '') }` +
                     `${ (seconds ? ` ${seconds} seconds`: '') }`;
    
        return string;
    }
}

module.exports = Giveaway;