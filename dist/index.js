"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ytmusic_api_1 = __importDefault(require("ytmusic-api"));
const fs_1 = require("fs");
const dotenv = __importStar(require("dotenv"));
const Eris = require("eris");
const { Readable } = require('stream');
const fs = require('fs');
const path = require('path');
const ffmpeg = require('fluent-ffmpeg');
const ffmpegPath = require('ffmpeg-static');
const youtubedl = require("youtube-dl-exec");
const ytmusic = new ytmusic_api_1.default();
dotenv.config();
let queue = [];
let playing = false;
const mp3FilePath = path.join(process.cwd(), "tmp", "output.mp3");
const YDL_OPTIONS = { 'noplaylist': true };
const bot = new Eris(process.env.API_KEY, {
    intents: [
        'guildMessages', // To receive messages in servers
        'guilds', // To detect and interact with guilds (servers)
        'messageContent', // To read the content of the messages
        'guildVoiceStates'
    ],
    autoreconnect: true,
});
bot.on("error", (err, shardID) => {
    console.error(`Error on shard ${shardID}:`, err);
});
bot.on("disconnect", () => {
    console.warn("Bot disconnected from Discord. Attempting to reconnect...");
});
bot.on("shardDisconnect", (err, id) => {
    console.warn(`Shard ${id} disconnected.`);
});
bot.on("ready", () => {
    initializeYTMusic();
    console.log("Ready!");
});
bot.on("messageCreate", (msg) => __awaiter(void 0, void 0, void 0, function* () {
    if (msg.author.bot)
        return;
    console.log(msg.content);
    if (msg.content === "!ping") {
        console.log(`Message received: ${msg.content}`);
        try {
            sendMessage(getTextChannelID(msg), "Pong!");
        }
        catch (e) {
            console.log(e);
        }
    }
    // Check for the !connect command
    if (msg.content.toLowerCase() === '!connect') {
        connect(msg);
    }
    if (msg.content.startsWith("!play ")) {
        parseQuery(msg);
    }
    if (msg.content.toLowerCase() === '!start') {
        startQueue(msg);
    }
    if (msg.content.toLowerCase() === '!pause') {
        pause(msg);
    }
    if (msg.content.toLowerCase() === '!resume') {
        resume(msg);
    }
    if (msg.content.toLowerCase() === '!skip') {
        skip(msg);
    }
    if (msg.content.toLowerCase() === '!clear') {
        clear(msg);
    }
    if (msg.content.toLowerCase() === '!display') {
        display(msg);
    }
    if (msg.content.toLowerCase().startsWith('!remove')) {
        remove(msg);
    }
    if (msg.content.toLowerCase() === '!help') {
        sendMessage(getTextChannelID(msg), " !connect - for me to connect to the channel \n !play URL - to add a song to que \n !start - begin playing music");
    }
}));
bot.on;
function initializeYTMusic() {
    return __awaiter(this, void 0, void 0, function* () {
        yield ytmusic.initialize(); // You can optionally provide custom cookies if needed
    });
}
function display(msg) {
    return __awaiter(this, void 0, void 0, function* () {
        let que = "Songs in que:\n";
        for (let i = 0; i < queue.length; i++) {
            que = que.concat(`${i + 1}. ${queue[i]}\n`);
        }
        sendMessage(getTextChannelID(msg), que);
    });
}
function remove(msg) {
    return __awaiter(this, void 0, void 0, function* () {
        let query = msg.content;
        query = query.slice(7).trim(); // Extract the part of the message after the command
        const indexToRemove = parseInt(query) - 1; // Convert the provided number to zero-indexed
        if (isNaN(indexToRemove) || indexToRemove < 0 || indexToRemove >= queue.length) {
            sendMessage(getTextChannelID(msg), "Invalid number. Please provide a valid song number to remove.");
            return;
        }
        // Remove the entry from the queue
        const removed = queue.splice(indexToRemove, 1); // Splice removes the entry and returns the removed item
        sendMessage(getTextChannelID(msg), `Removed entry: ${removed[0]}`);
    });
}
function parseQuery(msg) {
    return __awaiter(this, void 0, void 0, function* () {
        let query = msg.content;
        query = query.slice(5).trim();
        if (query.includes("youtube.com") || query.includes("youtu.be")) {
            addToQueue(msg, query);
        }
        else {
            addToQueue(msg, yield getURL(msg, query));
        }
    });
}
function getURL(msg, query) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // Search for music using the YouTube Music API
            const songs = yield ytmusic.search(query);
            if (!songs || songs.length === 0) {
                throw new Error("No results found for the query.");
            }
            // Grab the first song result
            const firstSong = songs[0];
            // Return the YouTube URL
            return `https://youtu.be/${firstSong.videoId}`;
        }
        catch (error) {
            console.error(`Error: ${error}`);
            throw error;
        }
    });
}
function addToQueue(msg, url) {
    return __awaiter(this, void 0, void 0, function* () {
        queue.push(url);
        console.log(queue);
        if (!playing) {
            startQueue(msg);
        }
    });
}
function startQueue(msg) {
    return __awaiter(this, void 0, void 0, function* () {
        if (playing) {
            sendMessage(getTextChannelID(msg), "Already playing a track. Please wait or add to the queue.");
            return;
        }
        try {
            let connection = yield connect(msg);
            if (!connection) {
                return;
            }
            deleteFile(mp3FilePath);
            playURL(msg, connection);
            connection.on('end', () => {
                console.log("Finished playing, deleting file...");
                deleteFile(mp3FilePath);
                playing = false;
                if (queue.length > 0) {
                    console.log("Playing the next song in the queue.");
                    playURL(msg, connection); // Recursively call to play the next song
                }
                else {
                    sendMessage(getTextChannelID(msg), "Queue is empty.");
                }
            });
            connection.on('error', (error) => {
                console.error("Error while playing:", error);
                playing = false; // Reset playing status if an error occurs
            });
            connection.on('disconnect', (error) => {
                console.log("Disconnected:", error);
                deleteFile(mp3FilePath);
                playing = false; // Reset playing status if an error occurs
            });
        }
        catch (e) {
            console.log(e);
        }
    });
}
function playURL(msg, connection) {
    return __awaiter(this, void 0, void 0, function* () {
        const url = queue.shift(); // Get the next URL from the queue
        if (!url) {
            sendMessage(getTextChannelID(msg), "No more songs in the queue.");
            playing = false;
            return;
        }
        try {
            playing = true;
            // Step 1: Download the audio as MP3 and overwrite if necessary
            yield youtubedl(url, {
                extractAudio: true,
                audioFormat: "mp3",
                preferFfmpeg: true,
                output: mp3FilePath,
            });
            console.log("Download completed:", mp3FilePath);
            // Step 2: Play the MP3 file in the voice channel
            const audioStream = fs.createReadStream(mp3FilePath);
            connection.play(audioStream, { type: "opus" });
            audioStream.on('error', (err) => {
                console.error('Error with audio stream:', err);
            });
            sendMessage(getTextChannelID(msg), `Now playing: ${url}`);
        }
        catch (err) {
            console.error("Error:", err);
            if (!getVoiceChannelID(msg)) {
                sendMessage(getTextChannelID(msg), "Please join a voice channel.");
            }
            else {
                sendMessage(getTextChannelID(msg), "An error occurred while trying to play the audio.");
            }
            playing = false;
        }
    });
}
function deleteFile(path) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // Check if the file exists
            yield fs_1.promises.access(path, fs_1.constants.F_OK);
            // File exists, proceed to delete
            yield fs_1.promises.unlink(path);
            console.log("File deleted successfully.");
        }
        catch (err) {
            if (err.code === 'ENOENT') {
                console.log("No file to delete/File does not exist.");
            }
            else {
                console.error("Error deleting file:", err);
            }
        }
    });
}
function connect(msg) {
    return __awaiter(this, void 0, void 0, function* () {
        // Check if the user is in a voice channel
        let textChannelID = getTextChannelID(msg);
        if (msg.member && msg.member.voiceState && msg.member.voiceState.channelID) {
            let voiceChannelID = getVoiceChannelID(msg);
            try {
                // Make the bot join the user's voice channel
                //sendMessage(textChannelID, 'Connecting to your voice channel...');
                return bot.joinVoiceChannel(voiceChannelID);
            }
            catch (error) {
                console.error('Failed to join voice channel:', error);
                sendMessage(textChannelID, 'I couldn’t connect to the voice channel.');
            }
        }
        else {
            // User is not in a voice channel
            sendMessage(textChannelID, 'You need to be in a voice channel for me to join!');
        }
        return null;
    });
}
function pause(msg) {
    return __awaiter(this, void 0, void 0, function* () {
        let connection = yield connect(msg);
        connection === null || connection === void 0 ? void 0 : connection.pause();
    });
}
function resume(msg) {
    return __awaiter(this, void 0, void 0, function* () {
        let connection = yield connect(msg);
        connection === null || connection === void 0 ? void 0 : connection.resume();
    });
}
function skip(msg) {
    return __awaiter(this, void 0, void 0, function* () {
        let connection = yield connect(msg);
        connection === null || connection === void 0 ? void 0 : connection.stopPlaying();
    });
}
function clear(msg) {
    return __awaiter(this, void 0, void 0, function* () {
        queue = [];
    });
}
function sendMessage(id, message) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            bot.createMessage(id, message);
        }
        catch (e) {
            console.log(e);
        }
    });
}
function getTextChannelID(msg) {
    return msg.channel.id;
}
function getVoiceChannelID(msg) {
    if (!msg.member) {
        return null;
    }
    return msg.member.voiceState.channelID;
}
bot.connect();
//# sourceMappingURL=index.js.map