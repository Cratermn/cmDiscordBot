import { Message } from "eris";
import { Searcher, Source } from "./interfaces";
import Song from "./song";


export default class YTSearcher extends Searcher {
    private maxDuration = 1200000;
    private api = require("youtube-sr").default;
    constructor() {
        super();
    }

    public async search(msg: Message): Promise<Song> {
        let query: string | null = this.removeCommand(msg.content);

        if (!query || query.trim() === "") {
            throw new Error("Invalid search");
        }
        try {
            if (query.includes("youtube.com") || query.includes("youtu.be")) {
                return this.createSongFromUrl(msg, query);
            }
    
            return this.createSong(msg, this.chooseSong(await this.getResults(query)));
        } catch (e) {
            throw e;
        }
    }

    private async getResults(query: string) {
        return this.api.search(query + ' "topic"');
    }

    private chooseSong(results: any) {
        console.log(results);
        for (let i = results.length - 1; i >= 0; i--) {
            if (results[i].duration > this.maxDuration) {
                results.splice(i)
            }
        }
        if (results.length < 1) {
            throw new Error("no results found");
        } else if (results.length === 1) {
            return results[0];
        }
        const topResults = results.slice(0, 2);

        if (topResults[0].title === topResults[1].title && topResults[0].channel.id === topResults[1].channel.id && topResults[0].views < topResults[1].views) {
            return topResults[1];
        } else {
            return topResults[0];
        }
    }

    private createSong(msg: Message, chosenSong: any): Song {
        console.log(chosenSong)
        let requester: string;
        if (msg.author.globalName) {
            requester = msg.author.globalName;
        } else {
            requester = msg.author.username;
        }
        return new Song(chosenSong.title, chosenSong.url, requester, Source.YOUTUBE, chosenSong.channel);
    }

    private createSongFromUrl(msg: Message, url: string): Song {
        let requester: string;
        if (msg.author.globalName) {
            requester = msg.author.globalName;
        } else {
            requester = msg.author.username;
        }
        return new Song("Unknown", url, requester, Source.YOUTUBE);
    }
}