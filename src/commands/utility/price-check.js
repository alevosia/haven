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
    
    run(message, { item }) {
        if (message.channel.id == config.BotsSpamChannelID) {
    
            GetPriceData(item).then(data => {
                if (data[0].thumbnail) {
                    message.react('✅').catch(err => zxc.error(err));
                    message.channel.send(GetPriceCheckEmbed(data[0]));
                } else {
                    message.react('❌').catch(err => zxc.error(err));
                    message.reply("no luck. The item may not be tradable, a riven, or you're spelling needs improvement. " +
                    "For rivens, try asking others for a price check at " + message.guild.channels.get(config.RivensChannelID) + " channel.")
                    .then(sent => zxc.info(sent.content)).catch(err => zxc.error(err));
                }
                
            }).catch(err => {
                zxc.error(err);
                message.reply(err).then(sentMessage => {
                    zxc.info("Sent: " + sentMessage.content);
                    return;
                }).catch(err => zxc.error(err));
            });
        } else {
            message.reply("please use the price check command at " + message.guild.channels.get(config.BotsSpamChannelID)
            + " channel. Thank you.").then(sentMessage => {
                    zxc.info("Sent: " + sentMessage.content);
            }).catch(err => zxc.error(err));
        }
    }
}

async function GetPriceData(item) {
    
    // adds the item name to the get request to the api
    const options = {
        uri: `https://api.warframestat.us/pricecheck/attachment/${item}`,
        json: true,
        rejectUnauthorized: false,
    };

    const result = await request(options);

    return result;
}

function GetPriceCheckEmbed(data) {
    const embed = new RichEmbed();
    
    embed.setTitle(data.title)
    .setColor(data.color)
    .setThumbnail(data.thumbnail['url'])
    .setFooter(data.footer['text']);

    let desc = "";

    for (let i=0; i<data.fields.length; i++) {
       desc += data.fields[i].name + "\n" + data.fields[i].value;
    }

    embed.setDescription(desc);

    return embed;
}