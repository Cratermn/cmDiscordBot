import { Message} from "eris";
import * as dotenv from 'dotenv';
import MusicBot from "./musicBot";

const Eris = require("eris");
dotenv.config();

let mBot: MusicBot;

const bot = new Eris(process.env.API_KEY, {
    intents: [
        'guildMessages',  // To receive messages in servers
        'guilds',         // To detect and interact with guilds (servers)
        'messageContent',  // To read the content of the messages
        'guildVoiceStates'
    ],
    autoreconnect: true,
});

bot.on("error", (err: Error, shardID: number) => {
    console.error(`Error on shard ${shardID}:`, err);
});

bot.on("disconnect", () => {
    console.warn("Bot disconnected from Discord. Attempting to reconnect...");
});

bot.on("shardDisconnect", (err: Error, id: number) => {
    console.warn(`Shard ${id} disconnected.`);
});

bot.on("ready", () => {
    if (!mBot) {
        mBot = new MusicBot(bot);
    }
    console.log("Ready!");
});

bot.on("messageCreate", async (msg: Message) => {
    if (msg.author.bot) return;
    console.log(msg.content);

    if (msg.content.toLowerCase().startsWith('!')) {
        mBot.parseMessage(msg);
    }

});

bot.connect();