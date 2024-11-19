import {Downloader, Source} from "./interfaces"
import { Message, VoiceConnection } from "eris";
import Queue from "./queue";
import Song from "./song";
import YTSearcher from "./ytSearcher";
import YTDownloader from "./ytDownloader";


export default class MusicBot {
    private fs = require('fs');
    private bot: any;
    private queue: Queue;
    private playing: boolean;
    private ytSearcher: YTSearcher;
    private ytDownloader: YTDownloader;

    public constructor(bot: any) {
        this.bot = bot;
        this.queue = new Queue();
        this.playing = false;
        this.ytSearcher = new YTSearcher();
        this.ytDownloader = new YTDownloader();
    }

    public async parseMessage(msg: Message) {
        if (msg.content === "!ping") {
            console.log(`Message received: ${msg.content}`);
            try {
                this.sendMessage(this.getTextChannelID(msg), "Pong!");
            } catch (e) {
                console.log(e);
            }
    
        }
    
        // Check for the !connect command
        if (msg.content.toLowerCase() === '!connect') {
            this.connect(msg);
        }
    
    
        if (msg.content.startsWith("!play ") || msg.content.startsWith("!p ")) {
            this.parseQuery(msg);
        }
    
        if (msg.content.toLowerCase() === '!start') {
            this.startQueue(msg);
        }
    
        if (msg.content.toLowerCase() === '!pause') {
            this.pause(msg);
        }
    
        if (msg.content.toLowerCase() === '!resume') {
            this.resume(msg);
        }
    
        if (msg.content.toLowerCase() === '!skip') {
            this.skip(msg);
        }
    
        if (msg.content.toLowerCase() === '!clear') {
            this.clear(msg);
        }
    
        if (msg.content.toLowerCase() === '!q') {
            this.display(msg);
        }
    
        if (msg.content.toLowerCase().startsWith('!remove')) {
            this.remove(msg);
        }
    
        if (msg.content.toLowerCase() === '!help') {
            this.sendMessage(this.getTextChannelID(msg), " !connect - for me to connect to the channel \n !play URL - to add a song to que \n !start - begin playing music");
        }
    }

    private async display(msg: Message) {
        this.sendMessage(this.getTextChannelID(msg), this.queue.display());
    }
    
    private async remove(msg: Message) {
        let query = msg.content;
        query = query.slice(7).trim();  // Extract the part of the message after the command
    
        const indexToRemove = parseInt(query) - 1;  // Convert the provided number to zero-indexed
    
        if (isNaN(indexToRemove) || indexToRemove < 0 || indexToRemove >= this.queue.length()) {
            this.sendMessage(this.getTextChannelID(msg), "Invalid number. Please provide a valid song number to remove.");
            return;
        }
    
        // Remove the entry from the queue
        const removed = this.queue.remove(indexToRemove);  // Splice removes the entry and returns the removed item
    
        this.sendMessage(this.getTextChannelID(msg), `Removed entry: ${removed[0].getTitle()}`);
    }

    private async parseQuery(msg: Message) {
        let query = msg.content;
        try {
            this.addToQueue(msg, await this.getSong(msg, query));
        } catch (e) {
            console.log(e);
            this.sendMessage(this.getTextChannelID(msg), "No results found");
        }
    }

    private async getSong(msg: Message, query: string): Promise<Song> {
        try {
            let sng: Song;
            let command = msg.content.split(" ")[0];
            try {
                switch(command) {
                    case "!play":
                        sng = await this.ytSearcher.search(msg);
                        break;
                    default:
                    throw new Error("Invalid command");
                }
            } catch (e) {
                throw e;
            }


            this.sendMessage(this.getTextChannelID(msg), "Queued:\n" + sng.toString());
            console.log("Created song: " + sng.toString());
            return sng;
        } catch (error: any) {
            console.error(`Error: ${error}`);
            throw error;
        }
    }
    
    private async addToQueue(msg: Message, song: Song): Promise<void> {
        this.queue.add(song);
        console.log(this.queue);
        if (!this.playing) {
            this.startQueue(msg);
        }
    }
    
    private async startQueue(msg: Message): Promise<void> {
        if (this.playing) {
            this.sendMessage(this.getTextChannelID(msg), "Already playing a track. Please wait or add to the queue.");
            return;
        }
        this.playing = true;
        try {
            let connection = await this.connect(msg);
            if (!connection) {
                this.playing = false;
                return;
            }
            Downloader.deleteAllFilesInDirectory();
            this.playURL(msg, connection);

        } catch (e) {
            console.log(e);
        }
    
    }
    
    
    private async playURL(msg: Message, connection: VoiceConnection): Promise<void> {
    
        const song = this.queue.getNext();  // Get the next URL from the queue
        if (!song) {
            this.sendMessage(this.getTextChannelID(msg), "No more songs in the queue.");
            this.playing = false;
            return;
        }
    
        try {
            // Step 1: Download the audio as MP3 and overwrite if necessary
            await Downloader.deleteAllFilesInDirectory();
            switch(song.getSource()) {
                case Source.YOUTUBE:
                    await this.ytDownloader.download(song);
                    break;
                default:
                    throw new Error("Invalid source");
            }
            console.log("Download completed:", Downloader.mp3FilePath);
    
            // Step 2: Play the MP3 file in the voice channel
            const audioStream = this.fs.createReadStream(Downloader.mp3FilePath);
            connection.play(audioStream);
    
            audioStream.on('error', (err: Error) => {
                console.error('Error with audio stream:', err);
            });
    
            this.sendMessage(this.getTextChannelID(msg), `Now playing: ${song.nowPlaying()}`);
    
        } catch (err) {
            console.error("Error:", err);
            if (!this.getVoiceChannelID(msg)) {
                this.sendMessage(this.getTextChannelID(msg), "Please join a voice channel.");
            } else {
                this.sendMessage(this.getTextChannelID(msg), "An error occurred while trying to play the audio.");
            }
        }
    }
    
    private async connect(msg: Message): Promise<VoiceConnection | null> {
        const textChannelID = this.getTextChannelID(msg);
    
        // Check if the user is in a voice channel
        if (msg.member?.voiceState?.channelID) {
            const voiceChannelID = this.getVoiceChannelID(msg);
            const existingConnection = this.bot.voiceConnections.get(msg.guildID);
    
            // Check if bot is already connected to the voice channel
            if (existingConnection) {
                if (existingConnection.channelID === voiceChannelID) {
                    console.log("Bot is already connected to this voice channel.");
                    return existingConnection;
                } else {
                    console.log("Bot is connected to a different voice channel. Switching...");
                    await this.bot.leaveVoiceChannel(existingConnection.channelID);
                }
            }
    
            // Join the user's voice channel
            try {
                console.log('Connecting to voice channel...');
                let connection = await this.bot.joinVoiceChannel(voiceChannelID);
                
                connection.on('end', () => {
                    console.log("Finished playing");
        
                    if (this.queue.length() > 0 && this.playing) {
                        console.log("Playing the next song in the queue.");
                        this.playURL(msg, connection);
                    } else {
                        console.log(msg.content);
                        this.sendMessage(this.getTextChannelID(msg), "Queue is empty.");
                        this.playing = false;
                    }
                });
                connection.on('error', (error: Error) => {
                    console.error("Error while playing:", error);
                    this.playing = false;  // Reset playing status if an error occurs
                });
                connection.on('disconnect', (error: Error) => {
                    console.log("Disconnected:", error);
                    this.playing = false;  // Reset playing status if an error occurs
                });
                return connection;
            } catch (error) {
                console.error('Failed to join voice channel:', error);
                this.sendMessage(textChannelID, 'I couldn’t connect to the voice channel.');
            }
        } else {
            // User is not in a voice channel
            this.sendMessage(textChannelID, 'You need to be in a voice channel for me to join!');
        }
    
        return null;
    }
    
    private async pause(msg: Message) {
        let connection = await this.connect(msg);
        connection?.pause();
    }
    
    private async resume(msg: Message) {
        let connection = await this.connect(msg);
        connection?.resume();
    }
    
    private async skip(msg: Message) {
        let connection = await this.connect(msg);
        connection?.stopPlaying();
    }
    
    private async clear(msg: Message) {
        this.queue.clear();
    }
    
    private async sendMessage(id: string, message: string): Promise<void> {
        const MAX_LENGTH = 2000; // Discord's message character limit
    
        try {
            // Split the message if it exceeds the limit
            if (message.length > MAX_LENGTH) {
                const chunks = this.splitMessageByLine(message, MAX_LENGTH);
                for (const chunk of chunks) {
                    await this.bot.createMessage(id, chunk);
                }
            } else {
                await this.bot.createMessage(id, message);
            }
        } catch (e) {
            console.error("Failed to send message:", e);
        }
    }

    private splitMessageByLine(message: string, maxLength: number): string[] {
        const lines = message.split('\n');
        const chunks: string[] = [];
        let currentChunk = '';
    
        for (const line of lines) {
            // Check if adding the next line would exceed the limit
            if ((currentChunk + line).length > maxLength) {
                chunks.push(currentChunk.trim());
                currentChunk = '';
            }
            currentChunk += line + '\n';
        }
    
        // Add the last chunk if there is any remaining content
        if (currentChunk.trim().length > 0) {
            chunks.push(currentChunk.trim());
        }
    
        return chunks;
    }
    
    
    private getTextChannelID(msg: Message): string {
        return msg.channel.id;
    }
    
    private getVoiceChannelID(msg: Message): string | null {
        if (!msg.member) {
            return null;
        }
        return msg.member.voiceState.channelID;
    }
}