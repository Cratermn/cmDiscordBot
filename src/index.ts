import { Message, VoiceConnection } from "eris";
import YTMusic from "ytmusic-api";
import { promises as fsPromises, constants } from 'fs';
import * as dotenv from 'dotenv';

const Eris = require("eris");
const { Readable } = require('stream');
const fs = require('fs');
const path = require('path');
const ffmpeg = require('fluent-ffmpeg');
const ffmpegPath = require('ffmpeg-static');
const youtubedl = require("youtube-dl-exec");
const ytmusic = new YTMusic();
dotenv.config();

let queue: string[] = [];
let playing: boolean = false;
const mp3FilePath = path.join(process.cwd(), "tmp", "output.mp3");

const YDL_OPTIONS = {'noplaylist': true};

const bot = new Eris(process.env.API_KEY, {
    intents: [
        'guildMessages',  // To receive messages in servers
        'guilds',         // To detect and interact with guilds (servers)
        'messageContent',  // To read the content of the messages
        'guildVoiceStates'
    ]
});

bot.on("ready", () => {
  initializeYTMusic();
  console.log("Ready!");
});
bot.on("messageCreate", async (msg: Message) => {
    if (msg.author.bot) return;
    console.log(msg.content);

  if(msg.content === "!ping") {
    console.log(`Message received: ${msg.content}`);
    try {
        sendMessage(getTextChannelID(msg), "Pong!");
    } catch (e) {
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

if (msg.content.toLowerCase() === "!play") {
    play(msg);
}

if (msg.content.toLowerCase() === '!help') {
    sendMessage(getTextChannelID(msg), " !connect - for me to connect to the channel \n !play URL - to add a song to que \n !start - begin playing music");
}

});

async function initializeYTMusic() {
    await ytmusic.initialize(); // You can optionally provide custom cookies if needed
}

async function display(msg: Message) {
    let que: string = "Songs in que:\n";
    for (let i = 0; i < queue.length; i++) {
        que = que.concat(`${i + 1}. ${queue[i]}\n`);
    }
    
    sendMessage(getTextChannelID(msg), que);
}

async function remove(msg: Message) {
    let query = msg.content;
    query = query.slice(7).trim();  // Extract the part of the message after the command

    const indexToRemove = parseInt(query) - 1;  // Convert the provided number to zero-indexed
    
    if (isNaN(indexToRemove) || indexToRemove < 0 || indexToRemove >= queue.length) {
        sendMessage(getTextChannelID(msg), "Invalid number. Please provide a valid song number to remove.");
        return;
    }

    // Remove the entry from the queue
    const removed = queue.splice(indexToRemove, 1);  // Splice removes the entry and returns the removed item

    sendMessage(getTextChannelID(msg), `Removed entry: ${removed[0]}`);
}


async function parseQuery(msg: Message) {
    let query = msg.content;
    query = query.slice(5).trim();
    if (query.includes("youtube.com") || query.includes("youtu.be")) {
        addToQueue(msg, query);
    } else {
        addToQueue(msg, await getURL(msg, query));
    }

}


async function getURL(msg: Message, query: string): Promise<string> {
    try {
        // Search for music using the YouTube Music API
        const songs = await ytmusic.search(query);

        if (!songs || songs.length === 0) {
            throw new Error("No results found for the query.");
        }

        // Grab the first song result
        const firstSong = songs[0];

        // Return the YouTube URL
        return `https://youtu.be/${firstSong.videoId}`;
    } catch (error) {
        console.error(`Error: ${error}`);
        throw error;
    }
}


async function addToQueue(msg: Message, url: string): Promise<void> {
    queue.push(url);
    console.log(queue);
    if (!playing) {
        startQueue(msg);
    }
}

async function startQueue(msg: Message): Promise<void> {
    if (playing) {
        sendMessage(getTextChannelID(msg), "Already playing a track. Please wait or add to the queue.");
        return;
    }
    try {
        let connection = await connect(msg);
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
                playURL(msg, connection);  // Recursively call to play the next song
            } else {
                sendMessage(getTextChannelID(msg), "Queue is empty.");
            }
        });
        connection.on('error', (error) => {
            console.error("Error while playing:", error);

            playing = false;  // Reset playing status if an error occurs
        });
        connection.on('disconnect', (error) => {
            console.log("Disconnected:", error);
            deleteFile(mp3FilePath);
            playing = false;  // Reset playing status if an error occurs
        });
    } catch (e) {
        console.log(e);
    }
    
}


async function playURL(msg: Message, connection: VoiceConnection): Promise<void> {

    const url = queue.shift();  // Get the next URL from the queue
    if (!url) {
        sendMessage(getTextChannelID(msg), "No more songs in the queue.");
        playing = false;
        return;
    }
    
    try {
        playing = true;

        // Step 1: Download the audio as MP3 and overwrite if necessary
        await youtubedl(url, {
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

    } catch (err) {
        console.error("Error:", err);
        if (!getVoiceChannelID(msg)) {
            sendMessage(getTextChannelID(msg), "Please join a voice channel.");
        } else {
            sendMessage(getTextChannelID(msg), "An error occurred while trying to play the audio.");
        }
        
        playing = false;
    }
}

async function deleteFile(path: string): Promise<void> {
    try {
        // Check if the file exists
        await fsPromises.access(path, constants.F_OK);

        // File exists, proceed to delete
        await fsPromises.unlink(path);
        console.log("File deleted successfully.");
    } catch (err) {
        if (err.code === 'ENOENT') {
            console.log("No file to delete/File does not exist.");
        } else {
            console.error("Error deleting file:", err);
        }
    }
}

async function connect(msg: Message): Promise<VoiceConnection | null> {
        // Check if the user is in a voice channel
        let textChannelID = getTextChannelID(msg);
        if (msg.member && msg.member.voiceState && msg.member.voiceState.channelID) {
            let voiceChannelID = getVoiceChannelID(msg);
    
            try {
                // Make the bot join the user's voice channel
                //sendMessage(textChannelID, 'Connecting to your voice channel...');
                return bot.joinVoiceChannel(voiceChannelID);
            } catch (error) {
                console.error('Failed to join voice channel:', error);
                sendMessage(textChannelID, 'I couldn’t connect to the voice channel.');
            }
        } else {
            // User is not in a voice channel
            sendMessage(textChannelID,  'You need to be in a voice channel for me to join!');
        }
        return null;
}

async function pause(msg: Message) {
    let connection = await connect(msg);
    connection?.pause();
}

async function resume(msg: Message) {
    let connection = await connect(msg);
    connection?.resume();
}

async function skip(msg: Message) {
    let connection = await connect(msg);
    connection?.stopPlaying();
}

async function clear(msg: Message) {
    queue = [];
}

async function sendMessage(id: string, message: string): Promise<void> {
    try {
        bot.createMessage(id, message);
    } catch(e) {
        console.log(e);
    }
}

function getTextChannelID(msg: Message): string {
    return msg.channel.id;
}

function getVoiceChannelID(msg: Message): string | null {
    if (!msg.member) {
        return null;
    }
    return msg.member.voiceState.channelID;
}

bot.connect();