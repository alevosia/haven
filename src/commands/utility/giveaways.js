const { Command } = require('discord.js-commando');
const { Message, RichEmbed } = require('discord.js');
const Giveaway = require('../../giveaways/giveaway.js');
const GiveawaysUpdater = require('../../giveaways/updater.js');
const config = require('../../config.js');
const util = require('../../modules/utility.js');
const zxc = require('../../modules/logger.js'); // winston logger

class GiveawaysCommand extends Command {
    constructor(Bot) {
        super(Bot, {
            name: 'giveaways',
            aliases: ['giveaway'],
            group: 'utility',
            memberName: 'giveaways',
            description: 'Create, reroll or end giveaways',
            guildOnly: true,
            args: [
                {
                    key: 'action',
                    type: 'string',
                    default: 'create',
                    prompt: 'what do you want to do?'
                }
            ]
        })
        this.creating = false;
        this.giveawaysUpdater = new GiveawaysUpdater();
    }

    /**
     * @param {Message} message
     */
    run(message, args) {
        if (!message.member.roles.has(config.GiveawaysMasterRoleID)) {
            const role = message.guild.roles.get(config.GiveawaysMasterRoleID);
            return message.reply(`you must have the <@&${role.id}> role in order to host giveaways. ` + 
                `Enter \`${this.client.commandPrefix}join giveaways master\` to get it.`);
        } else if (message.channel.id != config.GiveawaysSpamChannelID) {
            const channel = message.guild.channels.get(config.GiveawaysSpamChannelID);
            return message.reply(`please use giveaways command at ${channel} channel.`);
        }

        switch(args.action)
        {
        case 'create':
            if (this.creating) return message.reply(`a giveaway is still being set up.`);

            this.giveawaysUpdater.giveawaysManager.getOngoingGiveaways().then(giveaways => {
                if (giveaways.length >= config.MaxGiveaways) return message.reply(`there are already ${giveaways.length} giveaways ongoing.`);
                this.askPrize(message);
            })
            break;

        case 'end':
            this.endGiveaway(message);
            break;

        case 'reroll':
            this.rerollGiveaway(message);
            break;

        case 'cancel':
            break;

        default: message.reply('invalid action. Available giveaways actions: \`create • end • reroll\`.');
        }
    }

    /**
     * @param {Message} message
     */
    rerollGiveaway(message) {
        message.reply('enter the giveaway\'s message ID. Enter `cancel` anytime to cancel command.');
        const filter = response => response.author.id === message.author.id;

        message.channel.awaitMessages(filter, { maxMatches: 1, time: 30000, errors: ['time'] }).then(msgs => {
            const response = msgs.first();
            if (response.content.toLowerCase() == 'cancel') {
                return message.reply('giveaway command cancelled.');
            }
            
            this.giveawaysUpdater.giveawaysManager.getGiveaway(response.content).then(giveaway => {
                if (!giveaway) {
                    return message.reply('the message ID you have entered does not exist.');
                }

                if (giveaway.hostId != response.author.id && !util.IsOfficer(message.member)) {
                    return message.reply(`you didn't host that giveaway.`);
                }

                if (!giveaway.ended) {
                    return message.reply(`the ${giveaway.prize} giveaway has not ended yet.`);
                }
                giveaway.end();
                message.reply(`Rerolled ${giveaway.prize} giveaway's winners.`);
            }).catch(err => console.error(err));
        })
    }

    endGiveaway(message) {
        message.reply('enter the giveaway\'s message ID. Enter `cancel` anytime to cancel command.');
        const filter = response => response.author.id === message.author.id;

        message.channel.awaitMessages(filter, { maxMatches: 1, time: 30000, errors: ['time'] }).then(msgs => {
            const response = msgs.first();
            if (response.content.toLowerCase() == 'cancel') {
                return message.reply('giveaway command cancelled.');
            } 

            this.giveawaysUpdater.giveawaysManager.getGiveaway(response.content).then(giveaway => {
                if (!giveaway) {
                    return message.reply('the message ID you have entered does not exist.');
                } 

                if (giveaway.hostId != response.author.id && !util.IsOfficer(message.member)) {
                    return message.reply(`you didn't host that giveaway.`);
                }
                    
                if (giveaway.ended) {
                    return message.reply(`the ${giveaway.prize} giveaway had already ended.`);
                }

                giveaway.end();
                message.reply(`Ended ${giveaway.prize} giveaway.`);
            }).catch(err => console.error(err));
        })
    }

    cancelGiveaway() {
        message.reply('enter the giveaway\'s message ID. Enter `cancel` anytime to cancel command.');
        const filter = response => response.author.id === message.author.id;

        message.channel.awaitMessages(filter, { maxMatches: 1, time: 30000, errors: ['time'] }).then(msgs => {
            const response = msgs.first();
            if (response.content.toLowerCase() == 'cancel') {
                return message.reply('giveaway command cancelled.');
            }

            this.giveawaysUpdater.giveawaysManager.getGiveaway(response.content).then(giveaway => {
                if (!giveaway) {
                    return message.reply('the message ID you have entered does not exist.');
                }

                if (giveaway.hostId != response.author.id && !util.IsOfficer(message.member)) {
                    return message.reply(`you didn't host that giveaway.`);
                }
                
                if (giveaway.ended) {
                    return message.reply(`the ${giveaway.prize} giveaway had already ended.`);
                }

                giveaway.end();
                message.reply(`Ended ${giveaway.prize} giveaway.`);
            }).catch(err => console.error(err));
        })
    }

    askPrize(message) {
        this.creating = true;
        const giveaway = {
            messageId: '',
            hostId: message.author.id,
            prize: '',
            winnersCount: null,
            imageURL: '',
            endDate: null,
            ended: 0,
            duration: null
        }

        message.reply('what do you want to giveaway? Enter `cancel` anytime to cancel giveaway setup.');

        const filter = response => response.author.id === giveaway.hostId;
        message.channel.awaitMessages(filter, {maxMatches: 1, time: 100000, errors: ['time']}).then(msgs => {
            const response = msgs.first();
            if (response.content.toLowerCase() == 'cancel') {
                response.reply('giveaway setup cancelled.');
                return this.creating = false;
            }

            giveaway.prize = response.content.substr(0, 50);
            
            const msg = `the prize will be ${giveaway.prize}. How long do you want the giveaway to last? `
                    + `Add a suffix \`m\` for minutes, \`h\` for hours, or \`d\` for days. `
                    + `Max duration of ${this.getDurationString(config.MaxGiveawayDuration)}.`;
            response.reply(msg).catch(err => zxc.error(err));

            this.askDuration(message, giveaway);
        }).catch(err => { 
            zxc.error(err);
            message.reply('you\'ve run out of time to respond to enter the prize.');
            this.creating = false;
        });
    }

    askDuration(message, giveaway) {
        const filter = response => response.author.id === giveaway.hostId && (!isNaN(parseInt(response.content)) || response.content.toLowerCase() == 'cancel')

        message.channel.awaitMessages(filter, {maxMatches: 1, time: 100000, errors: ['time']}).then(msgs => {
            const response = msgs.first();
            if (response.content.toLowerCase() == 'cancel') {
                response.reply('giveaway setup cancelled.');
                return this.creating = false;
            }

            let duration = parseInt(response.content);

            if (response.content.toLowerCase().endsWith('d')) {
                duration = duration * 86400;
            } else if (response.content.toLowerCase().endsWith('h')) {
                duration = duration * 3600;
            } else if (response.content.toLowerCase().endsWith('m')) {
                duration = duration * 60
            }

            if (duration > config.MaxGiveawayDuration) {
                message.reply(`woops! You've exceeded the maximum duration of ${this.getDurationString(config.MaxGiveawayDuration)}. `
                    + `Setting it to maximum duration instead.`);
                duration = config.MaxGiveawayDuration;
            } else if (duration < config.MinGiveawayDuration) {
                message.reply(`that's too short! Setting it to minimum duration instead.`);
                duration = config.MinGiveawayDuration;
            }
            
            giveaway.duration = duration;

            const msg = `the giveaway will last for ${this.getDurationString(duration)}. How many winners will there be?`;
            response.reply(msg).catch(err => zxc.error(err));
            
            this.askWinnerCount(message, giveaway)
        }).catch(err => { 
            zxc.error(err);
            message.reply('you\'ve run out of time to enter the duration of the giveway.');
            this.creating = false;
        });        
    }

    askWinnerCount(message, giveaway) {
        const filter = response => response.author.id === giveaway.hostId && (!isNaN(parseInt(response.content)) || response.content.toLowerCase() == 'cancel')

        message.channel.awaitMessages(filter, {maxMatches: 1, time: 100000, errors: ['time']}).then(msgs => {
            const response = msgs.first();
            if (response.content.toLowerCase() == 'cancel') {
                response.reply('giveaway setup cancelled.');
                return this.creating = false;
            }
            
            giveaway.winnersCount = parseInt(response.content);

            const msg = `there will be ${giveaway.winnersCount} winners. Do you want to include an image of the prize?`;
            response.reply(msg).catch(err => zxc.error(err))

            this.askImage(message, giveaway)
        }).catch(err => { 
            zxc.error(err);
            message.reply('you\'ve run out of time to enter the number of winners.');
            this.creating = false;
        });
    }

    askImage(message, giveaway) {
        const filter = response => response.author.id === giveaway.hostId && (response.content.toLowerCase() == 'yes' 
        || response.content.toLowerCase() == 'no' || response.content.toLowerCase() == 'cancel');

        message.channel.awaitMessages(filter, {maxMatches: 1, time: 100000, errors: ['time']}).then(msgs => {
            const response = msgs.first();
            if (response.content.toLowerCase() == 'cancel') {
                response.reply('giveaway setup cancelled.');
                return this.creating = false;
            }

            if (response.content.toLowerCase() == 'yes') {
                this.askImageURL(message, giveaway);
            } else {
                giveaway.imageURL = 'https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/120/emojione/151/heart-with-ribbon_1f49d.png';
                this.confirmGiveaway(message, giveaway)
            }

        }).catch(err => {
            zxc.error(err);
            message.reply('you\'ve run out of time to respond.')
            this.creating = false;
        });
    }

    askImageURL(message, giveaway) {
        message.reply(`enter the image's URL.`);
        
        const filter = response => response.author.id === giveaway.hostId;
        message.channel.awaitMessages(filter, {maxMatches: 1, time: 100000, errors: ['time']}).then(msgs => {
            const response = msgs.first();
            if (response.content.toLowerCase() == 'cancel') {
                response.reply('giveaway setup cancelled.');
                return this.creating = false;
            }

            giveaway.imageURL = response.content;
            response.delete();
            this.confirmGiveaway(message, giveaway);
        }).catch(err => { 
            zxc.error(err);
            message.reply('you\'ve run out of time to enter the URL.')
            this.creating = false;
        });
    }

    /**
     * 
     * @param {Message} message 
     */
    confirmGiveaway(message, giveaway) {
        giveaway.endDate = new Date(Date.now() + (giveaway.duration*1000));
        const embed = new RichEmbed()
            .setAuthor(`${giveaway.prize} Giveaway!`)
            .setDescription(`React with :gift_heart: to join!`)
            .addField(`Host:`, `<@${giveaway.hostId}>`, true)
            .addField(`Winners:`, giveaway.winnersCount, true)
            .addField(`Time Remaining:`, this.getDurationString(giveaway.duration))
            .setFooter(`Ends`)
            .setTimestamp(new Date(giveaway.endDate))
            .setThumbnail(giveaway.imageURL)
            .setColor(0xf934ff) // peach

        message.channel.send({embed}).then(previewMessage => {
            message.reply('this is how your giveaway will look like. Let\'s post it?');

            const filter = response => response.author.id === giveaway.hostId && (response.content.toLowerCase() == 'yes' 
            || response.content.toLowerCase() == 'no' || response.content.toLowerCase() == 'cancel');
    
            message.channel.awaitMessages(filter, {maxMatches: 1, time: 100000, errors: ['time']}).then(msgs => {
                const response = msgs.first();
                if (response.content.toLowerCase() == 'cancel' || response.content.toLowerCase() == 'no') {
                    response.reply('giveaway setup cancelled.');
                    return this.creating = false;
                }

                this.postGiveaway(message, giveaway)
    
            }).catch(err => {
                zxc.error(err);
                message.reply('you\'ve run out of time to respond.')
                this.creating = false;
            });
        });
    }

    /**
     * @param {Message} message 
     */
    async postGiveaway(message, giveaway) {
        this.creating = false;

        const channel = message.guild.channels.get(config.GiveawaysChannelID);
        const embed = new RichEmbed()
                .setAuthor(`${giveaway.prize} Giveaway!`)
                .setDescription(`React with :gift_heart: to join!`)
                .addField(`Host:`, `<@${giveaway.hostId}>`, true)
                .addField(`Winners:`, giveaway.winnersCount, true)
                .addField(`Time Remaining:`, this.getDurationString(giveaway.duration))
                .setFooter(`Ends`)
                .setTimestamp(new Date(giveaway.endDate))
                .setThumbnail(giveaway.imageURL)
                .setColor(0xf934ff) // peach
                
        const looterRole = message.guild.roles.get(config.LooterRoleID);

        await looterRole.setMentionable(true, `${giveaway.prize} giveaway`).catch(err => zxc.error(err));
        await channel.send(`<@&${looterRole.id}>`).catch(err => zxc.error(err));
        await looterRole.setMentionable(false, `Mentioned`).catch(err => zxc.error(err));
        
        channel.send({embed}).then(giveawayMessage => {
            message.react('✅').catch(err => zxc.error(err));
            message.reply(`${giveaway.prize} giveaway posted.`).catch(err => zxc.error(err));
            giveawayMessage.react('💝');
            giveaway.messageId = giveawayMessage.id;
            
            const giveawayObj = new Giveaway(giveaway.messageId, giveaway.hostId, giveaway.prize,
                giveaway.winnersCount, giveaway.imageURL, giveaway.endDate, 0);

            this.giveawaysUpdater.giveawaysManager.createGiveaway(giveawayObj).then(success => {
                if(success && !this.giveawaysUpdater.running) {
                    this.giveawaysUpdater.start();
                }
            })

        }).catch(err => zxc.error(err));
    }

    getDurationString(duration) {

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

module.exports = GiveawaysCommand;