// node modules
const { CommandoClient } = require('discord.js-commando');
const CleverBot = require('cleverbot.io');

// my modules
const WarframeWordldState = require('./modules/worldstate.js');
const config  = require('./config.js');
const reg     = require('./modules/regulation.js');   // regulation of members
const mod     = require('./modules/moderation.js');   // moderation of chat
const util    = require('./modules/utility.js');
const logs    = require('./modules/logs.js');         // member join/leave/kick etc. and message logs
const fun     = require('./modules/fun.js');          // fun features
const star    = require('./modules/starboard.js');    // upvoting messages
const zxc     = require('./modules/logger.js');       // winston logger

// global variables
const cleverBot = new CleverBot(process.env.CLEVER_USER, process.env.CLEVER_KEY);
cleverBot.setNick('Haven');
let lastPerson = '@@@';

// Client
const Bot = new CommandoClient({ 
    owner: config.OwnerID,
    commandPrefix: config.prefix,
    disableEveryone: true,
    unknownCommandResponse: false,
    messageCacheMaxSize: -1, // infinite
    messageCacheLifetime: 2592000, // messages that are 30 days old will be deleted from cache
    messageSweepInterval: 86400 // sweep messages daily
});

Bot.registry
    .registerDefaultTypes()
    .registerDefaultGroups()
    .registerDefaultCommands({
        eval_: false,
        commandState: false
    })
    .registerGroups([
        ['fun', 'Fun'],
        ['images', 'Images'],
        ['utility', 'Utilities']
    ])
    .registerCommandsIn(require('path').join(__dirname, 'commands'))

Bot.on('ready', () => {
    setTimeout(() => {
        const guild = Bot.guilds.get(config.GuildID);

        setInterval(() => { util.UpdateActivity(Bot) }, config.ActivityUpdateInterval*1000);

        new WarframeWordldState()
        .on('alert', alert => {
            util.SendAlert(guild, alert);
        }).on('night', cetus => {
            util.MentionCetusNight(guild, cetus.msg);
        }).on('update', update => {
            util.SendUpdate(guild, update);
        });
        
        let startMessage = `${Bot.user.username} reporting for duty!`;
        console.log(startMessage);
        zxc.info(startMessage);
        Bot.fetchUser(config.DeveloperID)
            .then(dev => dev.send(startMessage))
            .catch(err => zxc.error(err));
    }, 5000);

    process.on('uncaughtException', (err) => {
        zxc.error(err);
        Bot.users.get(config.DeveloperID).send(err.stack).catch(err => zxc.error(err));
        process.exit(1);
    })
    
    process.on('unhandledRejection', (err) => {
        zxc.error(err);
        Bot.users.get(config.DeveloperID).send(err.stack).catch(err => zxc.error(err));
    })
})

Bot.on('error', (error) => {
    const msg = `<=== ERROR EVENT ===>\n\`\`\`${error.name}: ${error.message}\`\`\``
    zxc.error(msg);
    Bot.fetchUser(config.DeveloperID).then(user => { user.send(msg).catch((err) => zxc.error(err)) })

}).on('commandError', (command, error, message) => {
    const msg = `<=== COMMAND ERROR ===>`
            +`\n\`\`\`${error.name}: ${error.message}`
            + `\nCommand: ${command.name}`
            + `\nMessage: ${message.content} from ${message.member ? message.member.displayName : message.author.username}\`\`\``;
    zxc.error(msg);
    Bot.fetchUser(config.DeveloperID).then(user => {
        user.send(msg).catch((err) => zxc.error(err));
    })

}).on('guildMemberAdd', (pendingMember) => {
    logs.LogServerJoin(pendingMember);
    reg.SetPendingRole(pendingMember);

}).on('guildMemberRemove', (removedMember) => {
    logs.LogKickOrLeave(removedMember);

}).on('guildMemberUpdate', (oldMember, newMember) => {
    reg.PreventManualMemberRoleSetting(oldMember, newMember);

}).on('guildBanAdd', (guild, bannedUser) => {
    logs.LogBan(guild, bannedUser);

}).on('guildBanRemove', (guild, removedUser) => {
    logs.LogRevokeBan(guild, removedUser);

}).on('messageReactionAdd', (reaction, reactor) => {
    if (reaction.emoji.name == '⭐') {
        star.UpdateStars(reaction, reactor);
    } else if (reaction.message.channel.id == config.PendingChannelID) {
        reg.PendingMemberVerification(reaction, reactor);
    }

}).on('messageReactionRemove', (reaction, reactor) => {
    if (reaction.emoji.name == '⭐' && reactor.id != reaction.message.author.id) {
        star.UpdateStars(reaction, reactor);
    }

}).on('messageDelete', (message) => {
    logs.LogMessageDelete(message);

}).on('messageDeleteBulk', (messages) => {
    zxc.info(`Bulk Deleted ${messages.size} messages.`);

}).on('messageUpdate', (oldMessage, updatedMessage) => {
    logs.LogMessageEdit(oldMessage, updatedMessage);

    if (updatedMessage.channel.id == config.OneWordStoryChannelID) {
        fun.CheckOneWordStoryEdit(updatedMessage);
    }

}).on('message', (message) => {
    if (message.author.bot) return;

    if (message.channel.id == config.OneWordStoryChannelID) {
        return fun.OneWordStory(message, lastPerson).then(name => { 
            lastPerson = name; 
        });
    }

    // chat bot - replies when dm'd or mentioned in guild and not in one word story channel
    if (!message.guild || (message.isMentioned(Bot.user) && message.channel.id != config.OneWordStoryChannelID)) {
        return fun.CleverBot(message, cleverBot);
    }
        
    mod.ProfanityFilter(message);

    if (message.content.toLowerCase().startsWith('h!')) {
        message.reply(`my new command prefix is \`${Bot.commandPrefix}\`.`);
    }
    // if the message is not posted on the bots spam channel and contains a bot prefix
    if (message.channel.id != config.BotsSpamChannelID)
        if (mod.ContainsBotCommand(message)) return;

    // if the message is not posted on the trading channel and contains a trading message
    if (message.channel.id != config.TradingChannelID)
        if (mod.ContainsTradingMessage(message)) return;
})

module.exports = Bot;
