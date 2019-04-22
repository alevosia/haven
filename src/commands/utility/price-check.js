const { Command }   = require('discord.js-commando');
const { RichEmbed } = require('discord.js');
const request = require('request-promise');
const config  = require('../../config.js');
const zxc = require('../../modules/logger.js'); // winston logger

module.exports = class PriceCheckCommand extends Command {

    constructor(Bot) {
        super(Bot, {
            name: 'pc',
            aliases: ['pricecheck'],
            group: 'utility',
            memberName: 'pricecheck',
            description: 'Price checks a tradable item',
            guildOnly: true,
            args: [
                {
                    key: 'item',
                    prompt: 'what item would you like to price check?',
                    type: 'string'
                }
            ]
        });
    }
    
    async run(message, { item }) {

        if (message.channel.id != config.BotsSpamChannelID) {
            const channel = message.guild.channels.get(config.BotsSpamChannelID);
            return message.reply(`please use the price check command at ${channel} channel. Thank you.`)
        }

        const status = await message.reply(`getting data...`);

        let data;

        try {
            data = await this.GetPriceData(item);
        } catch (err) {
            console.error(err);
            zxc.error(err);
            message.react('❌');
            return status.edit('failed to get price data.');
        }

        if (data.length > 0) {
            message.react('✅');
            status.edit(GetPriceCheckEmbed(data[0]))
        } else {
            message.react('❌');
            const channel = message.guild.channels.get(config.RivensChannelID);
            status.edit(`no luck. The item may not be tradable, a riven, or you're spelling needs improvement. ` +
                `For rivens, try asking other clannies for a price check at ${channel} channel.`);
        }
    }

    async GetPriceData(item) {
    
        // adds the item name to the get request to the api
        const options = {
            uri: `https://api.warframestat.us/pricecheck/attachment/${item}`,
            json: true,
            rejectUnauthorized: false,
        };

        const data = await request(options);
        return data;
    }
    
    GetPriceCheckEmbed(data) {
        const embed = new RichEmbed();
        
        embed.setTitle(data.title)
        .setColor(data.color)
        .setThumbnail(data.thumbnail['url'])
        .setFooter(data.footer['text']);
    
        let desc = '';
    
        for (let i=0; i<data.fields.length; i++) {
           desc += data.fields[i].name + "\n" + data.fields[i].value;
        }
    
        embed.setDescription(desc);
    
        return embed;
    }
}

