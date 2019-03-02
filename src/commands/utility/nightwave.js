const { Command } = require('discord.js-commando');
const { RichEmbed } = require('discord.js');
const request = require('request-promise');

class NightwaveCommand extends Command {
    constructor(Bot) {
        super(Bot, {
            name: 'nightwave',
            group: 'utility',
            memberName: 'nightwave',
            description: 'Show the active nightwave challenges.',
            guildOnly: true,
            throttling: {
                usages: 1,
                duration: 15
            }
        }) 

        this.officialWorldstateAPI = 'http://content.warframe.com/dynamic/worldState.php';
        this.parsedWorldstateAPI = 'https://api.warframestat.us/pc';

        this.message = null;
    }

    async run(message) {

        if (this.message) this.message.delete();

        const status = await message.reply(`getting nightwave information...`);

        const options = {
            uri: this.parsedWorldstateAPI,
            json: true
        }

        let data;

        console.time(`Worldstate API`);
        try {
            data = await request(options);
        } catch (err) {
            console.error(err);
            return status.edit(`${message.author}, failed to get nightwave data.`);
        }
        console.timeEnd(`Worldstate API`);

        const challenges = data.nightwave.activeChallenges;

        let daily = [];
        let weekly = [];
        let elite = [];

        for (let i=0; i<challenges.length; i++) {
            if (challenges[i].isDaily) {
                daily.push(challenges[i]);
            } else if (challenges[i].isElite) {
                elite.push(challenges[i]);
            } else {
                weekly.push(challenges[i]);
            }
        }

        const embed = new RichEmbed()
            .setAuthor(`Nightwave`, 'https://i.imgur.com/E4qKdkW.png') // clan emblem
            .setColor(0x0b3c5d) // prussian blue
            .setTimestamp();

        const embedWidth = 70;

        // DAILY ==================================================================
        const dailyTitle = this.center('Daily Challenges', embedWidth, 'title');
        embed.setTitle(dailyTitle);

        let fieldWidth = 24;

        for (let i=0; i<daily.length; i++) {

            if (i % 3 == 0) {
                if (daily.length - i == 2) {
                    fieldWidth = embedWidth / 2;
                } else if (daily.length - i == 1) {
                    fieldWidth = embedWidth;
                }
            }

            const name = this.center(daily[i].title, fieldWidth);
            const timeLeft = this.center(this.constructor.timeString(new Date(daily[i].expiry) - new Date()), fieldWidth, 'time');
            const desc = this.squeeze(daily[i].desc, fieldWidth);

            let result = desc.split('\n');
            let final = [];

            for (let i=0; i<result.length; i++) {
                final.push(this.center(result[i], fieldWidth));
            }

            embed.addField(name, timeLeft + '\n' + final.join('\n'), true);
        }

        // WEEKLY =================================================================
        const weeklyTitle = this.center('Weekly Challenges', embedWidth, 'title');
        let timeLeft = this.center(this.constructor.timeString(new Date(weekly[0].expiry) - new Date()), embedWidth, 'time');
        
        // Weekly Challenges Title
        embed.addField(weeklyTitle, timeLeft);

        fieldWidth = 24;

        for (let i=0; i<weekly.length; i++) {

            if (i % 3 == 0) {
                if (weekly.length - i == 2) {
                    fieldWidth = embedWidth / 2;
                } else if (weekly.length - i == 1) {
                    fieldWidth = embedWidth;
                }
            }

            const name = this.center(weekly[i].title, fieldWidth);
            const desc = this.squeeze(weekly[i].desc, fieldWidth);

            let result = desc.split('\n');
            let final = [];

            for (let i=0; i<result.length; i++) {
                final.push(this.center(result[i], fieldWidth));
            }
            
            embed.addField(name, final.join('\n'), true);
        }

        // ELITE ==================================================================

        const eliteTitle = this.center('Elite Weekly Challenges', embedWidth, 'title');
        timeLeft = this.center(this.constructor.timeString(new Date(elite[0].expiry) - new Date()), embedWidth, 'time');
        
        // Elite Challenges Title
        embed.addField(eliteTitle, timeLeft);

        fieldWidth = 24;

        for (let i=0; i<elite.length; i++) {

            if (i % 3 == 0) {
                if (elite.length - i == 2) {
                    fieldWidth = embedWidth / 2;
                } else if (elite.length - i == 1) {
                    fieldWidth = embedWidth;
                }
            }

            const name = this.center(elite[i].title, fieldWidth);
            const desc = this.squeeze(elite[i].desc, fieldWidth);

            let result = desc.split('\n');
            let final = [];

            for (let i=0; i<result.length; i++) {
                final.push(this.center(result[i], fieldWidth));
            }

            embed.addField(name, final.join('\n'), true);
        }

        status.edit(embed);
        
    }


    static timeString(ms) {
        const seconds = ms / 1000;
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor(seconds % 3600 / 60);
        const string = `${hours >= 1 ? `${hours}:` : ''}`
			         + `${hours >= 1 ? `0${minutes}`.slice(-2) : minutes}:`
                     + `${`0${Math.floor(seconds % 60)}`.slice(-2)}`;
        
        return string;
    }

    /**
     * @returns string
     */
    center(text, width, type='text') {

        if (!text) throw new Error('Missing text parameter');
        if (!width) return console.error('Missing width parameter')

        if (text.length > width) return text;

        const count = Math.floor((width-text.length)/2);
    
        let pad1 = '';
        let pad2 = '';

        for (let i=0; i<count; i++) {
            pad1 += '\u200b\u2000';
            pad2 += '\u2000\u200b'
        }
        
        let result = pad1 + text + pad2;

        if (type.toLowerCase() === 'title') result = '**' + result + '**';
        if (type.toLowerCase() === 'time') result = '`' + result + '`';

        return result;
    }

    /**
     * @param {string} text
     * @param {number} width
     * @returns string
     */
    squeeze(text, width) {
        let result = '';

        while (text.length > 0) {

            if (text.length <= width) {
                result += text + '\n\u200b';
                break;
            }

            let foo = text.substring(0, width);
            let index = foo.lastIndexOf(' ');

            result += text.substring(0, index ? index : width) + '\n';
            text = text.substring(index ? (index+1) : width);
        }
        return result;
    }
} 

module.exports = NightwaveCommand;