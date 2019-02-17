// node modules
const { CommandoClient } = require('discord.js-commando');
const CleverBot = require('cleverbot.io');

// server exclusive  configuration
const config  = require('./config.js');

// my modules
const WarframeWordldState = require('./modules/worldstate.js');
const reg     = require('./modules/regulation.js');   // regulation of members
const filter  = require('./modules/filter.js');   // moderation of chat
const util    = require('./modules/utility.js');
const logs    = require('./modules/logs.js');         // member join/leave/kick etc. and message logs
const fun     = require('./modules/fun.js');          // fun features
const star    = require('./modules/starboard.js');    // upvoting messages
const haiku   = require('./modules/haiku.js');        // detects haikus
const zxc     = require('./modules/logger.js');       // winston logger

// global variables
let cleverBot;
if (process.env.CLEVER_USER) {
    if (process.env.CLEVER_KEY) {
        cleverBot = new CleverBot(process.env.CLEVER_USER, process.env.CLEVER_KEY);
        cleverBot.setNick('Haven');
    } else {
        console.error('No CleverBot Key.');
    }
} else {
    console.error('No CleverBot User.');
}

let lastPerson  = '@@@';

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

        const startMessage = `${Bot.user.username} reporting for duty!`;
        console.log(startMessage);
        zxc.info(startMessage);
        Bot.fetchUser(config.DeveloperID)
            .then(dev => dev.send(startMessage))
            .catch(err => zxc.error(err));
    }, 5000);

    process.on('uncaughtException', (err) => {
        zxc.error(err);
        Bot.users.get(config.DeveloperID).send(err.stack)
            .then(sent => {
                process.exit(1);
            })
            .catch(err => zxc.error(err));
    })
    
    process.on('unhandledRejection', (err) => {
        zxc.error(err);
        Bot.users.get(config.DeveloperID).send(err.stack).catch(err => zxc.error(err));
    })
})

Bot.on('error', (err) => {
    zxc.error(err.stack);
    Bot.fetchUser(config.DeveloperID)
        .then(user => { 
            user.send(err.stack).catch((err) => zxc.error(err)) 
        })
        .catch(err => zxc.error(err));
})

Bot.on('commandError', (command, err, message) => {
    const msg = `${err.name}: ${err.message}`
            + `\`\`\`Command: ${command.name}`
            + `\nMessage: ${message.content} from ${message.guild ? message.member.displayName : message.author.username}\`\`\``;
    zxc.error(msg);
    Bot.fetchUser(config.DeveloperID).then(user => {
        user.send(msg).catch((err) => zxc.error(err));
    })
    .catch(err => zxc.error(err));
})

Bot.on('guildMemberAdd', (pendingMember) => {
    logs.LogServerJoin(pendingMember);
    reg.SetPendingRole(pendingMember);
})

Bot.on('guildMemberRemove', (removedMember) => {
    logs.LogKickOrLeave(removedMember);
})

Bot.on('guildMemberUpdate', (oldMember, newMember) => {
    reg.PreventManualMemberRoleSetting(oldMember, newMember);
})

Bot.on('guildBanAdd', (guild, bannedUser) => {
    logs.LogBan(guild, bannedUser);
})

Bot.on('guildBanRemove', (guild, removedUser) => {
    logs.LogRevokeBan(guild, removedUser);
})

Bot.on('messageReactionAdd', (reaction, reactor) => {
    if (reaction.emoji.name == '⭐') {
        star.UpdateStars(reaction, reactor);
    } else if (reaction.message.channel.id == config.PendingChannelID) {
        reg.PendingMemberVerification(reaction, reactor);
    }
})

Bot.on('messageReactionRemove', (reaction, reactor) => {
    if (reaction.emoji.name == '⭐' && reactor.id != reaction.message.author.id) {
        star.UpdateStars(reaction, reactor);
    }
})

Bot.on('messageDelete', (message) => {
    logs.LogMessageDelete(message);
})

Bot.on('messageDeleteBulk', (messages) => {
    zxc.info(`Bulk Deleted ${messages.size} messages.`);
})

Bot.on('messageUpdate', (oldMessage, updatedMessage) => {
    logs.LogMessageEdit(oldMessage, updatedMessage);

    if (updatedMessage.channel.id == config.OneWordStoryChannelID) {
        fun.CheckOneWordStoryEdit(updatedMessage);
    }
})

Bot.on('message', (message) => {
    if (message.author.bot) return;

    if (message.channel.id == config.OneWordStoryChannelID) {
        return fun.OneWordStory(message, lastPerson).then(name => { 
            lastPerson = name; 
        });
    
    // chat bot replies when dm'd or mentioned in guild
    } else if (!message.guild || message.isMentioned(Bot.user)) {
        return fun.CleverBot(message, cleverBot);
    }

    filter(message);
    haiku(message);
})

module.exports = Bot;
