const GiveawaysManager = require('./giveaways-manager.js');
const config = require('../config.js');
const zxc = require('../modules/logger.js'); // winston logger

class Updater {
    constructor() {
        console.log('Giveaways Updater instantiated');
        zxc.info('Giveaways Updater instantiated');
        this.giveawaysManager = new GiveawaysManager();
        this.start();
    }

    start() {
        this.handle = setInterval(() => { this.updateGiveaways(); }, config.GiveawaysUpdateInterval*1000);
        this.running = true;
        console.log('Giveaways Updater started');
        zxc.info('Giveaways Updater started')
        
    }

    stop() {
        clearInterval(this.handle);
        this.handle = null;
        this.running = false;
        console.log('Giveaways Updater stopped');
        zxc.info('Giveaways Updater stopped')
    }

    updateGiveaways() {
        this.giveawaysManager.getOngoingGiveaways().then(giveaways => {
            if (giveaways.length == 0) {
                console.log('No ongoing giveaways.');
                zxc.info(`No ongoing giveaways.`);
                return this.stop();
            }

            giveaways.forEach(giveaway => {
                const timeLeft = giveaway.endDate - Date.now()
                
                if (timeLeft > 0) {
                    giveaway.update();

                    if (timeLeft < config.GiveawaysUpdateInterval) {
                        zxc.info(`${giveaway.prize} giveaway will end in ${Math.floor(timeLeft/1000)} seconds`);
                        setTimeout(() => {
                            giveaway.end();
                            this.giveawaysManager.endGiveaway(giveaway.messageId);
                        }, timeLeft);
                    }

                } else {
                    giveaway.end();
                    this.giveawaysManager.endGiveaway(giveaway.messageId);
                }
            })
        }).catch(err => zxc.error(err));
    }
}

module.exports = Updater;