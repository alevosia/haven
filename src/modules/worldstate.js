const { EventEmitter } = require('events');
const request     = require('request-promise');
const cheerio     = require('cheerio');
const WorldState  = require('warframe-worldstate-parser');
const config      = require('../config.js');
const zxc         = require('../modules/logger.js'); // winston logger

class WarframeWorldState extends EventEmitter {
    constructor(options = { interval: 60000 }) {
        super();
        this.refresh();
        setInterval(() => this.refresh(), options.interval);
        this.alerts = new Map();
        this.sentCetusNight = false;

        console.log("New WarframeWorldState instance created.");
        zxc.info("New WarframeWorldState instance created.");
    }

    get worldStateData() {
        return new Promise((resolve, reject) => {
            request.get("http://content.warframe.com/dynamic/worldState.php").then(worldstateData => {
                resolve(worldstateData);
            }).catch((err) => { reject(err); });
        })
    }

    refresh() {
        this.worldStateData.then(worldstateData => {
            const worldState = new WorldState(worldstateData);
            //this.getAlerts(worldState);
            this.getCetusTime(worldState);
            this.getUpdates(worldState);
            //this.getBaroStatus(worldState);
        }).catch(err => zxc.error(err));
    }

    /**
     * @param {WorldState} ws 
     */
    getUpdates(ws) {
        const news = ws.news;

        for (let i=news.length-1; i>=0; i--) {
            if (news[i].update && (news[i].message.includes("Update") || news[i].message.includes("Hotfix"))) {

                // if no current update is set yet
                if (!this.update) {
                    console.log(`Current Update: ${news[i].message}`);
                    zxc.info(`Current Update: ${news[i].message}`);
                    this.update = news[i].message;
                } else if (this.update !== news[i].message && (Date.now() - news[i].date.getTime() <= 3600000)) {

                    zxc.info(`New Warframe Update: ${news[i].message}`)

                    for (let j=news.length-1; j>=0; j--) {
                        zxc.info(`${j}: ${news[j].message}`);
                        console.log(`${j}: ${news[j].message}`);
                    }

                    let description = '';

                    // fetch the article's content
                    request(news[i].link, (err, res, body) => {
                        if (err) return zxc.error(err);
                        if (res.statusCode != 200) {
                            return zxc.error(`Error Getting Updates: ${res.statusCode}`);
                        }

                        const $ = cheerio.load(body);

                        const article = $('div.ipsType_normal.ipsType_richText.ipsContained').first();
                        const paragraphs = article.children('p').text().split('\n');

                        for (let l=2; l<12; l++) {
                            description += paragraphs[l] + '\n';
                            if (l+1 >= paragraphs.length) break;
                        }

                        description += `\n[Go To Forums Post](${news[i].link})`;

                        this.emit('update', {
                            title: news[i].message,
                            link: news[i].link,
                            desc: description,
                            image: news[i].imageLink
                        })

                        this.update = news[i].message;
                    })
                }
                break;
            }
        }
    }

    /**
     * @param {WorldState} ws 
     */
    getAlerts(ws) {
        const alerts = ws.alerts;
        
        for (let i=0; i<alerts.length; i++) {

            const rewardType = alerts[i].rewardTypes[0];

            // skip if the reward is not listed as useful, it's already posted, or already active
            if (!config.UsefulAlertsRewards.includes(rewardType) || this.alerts.has(rewardType) || alerts[i].activation < new Date()) continue;
            
            this.alerts.set(rewardType, alerts[i]);

            const image = (rewardType != 'aura' ? alerts[i].getReward().getTypesFull()[0].thumbnail 
                : 'http://img05.deviantart.net/b442/i/2016/144/8/d/lotus_3_0_by_starkrust-da3mfje.png');
            const color = alerts[i].getReward().getTypesFull()[0].color;

            this.emit('alert', { 
                rewardName: alerts[i].mission.reward.itemString,
                rewardType: rewardType,
                missionType: alerts[i].mission.type,
                missionFaction: alerts[i].mission.faction,
                missionNode: alerts[i].mission.node,
                eta: alerts[i].eta,
                image: image,
                color: color,
            });
        }

        this.removeExpiredAlerts();
    }

    /**
     * @param {WorldState} ws 
     */
    getBaroStatus(ws) {
        const baro = ws.voidTrader;
    }

    /**
     * @param {WorldState} ws 
     */
    getCetusTime(ws) {
        const cetusCycle = ws.cetusCycle;

        // if it's day
        if (cetusCycle.isDay) {
            // if the night is coming in less than 10 minutes and hasn't pinged
            if (cetusCycle.expiry - Date.now() <= 600000 && !this.sentCetusNight) {
                this.emit('night', { 
                    msg: `The night is coming. Ready your Amp and Warframe, operator.\n${cetusCycle.shortString}` 
                })
                this.sentCetusNight = true;
            }
        } else {
            this.sentCetusNight = false; // set it back to false if it's nighttime already
        }
    }

    removeExpiredAlerts() {
        const entries = this.alerts.entries();
        const dateNow = new Date();
        
        for (let i=0; i<this.alerts.size; i++) {

            const entry = entries.next().value;
            
            if(entry[1].expiry < dateNow) {
                this.alerts.delete(entry[0]);
            }
        }
    }
}

module.exports = WarframeWorldState;