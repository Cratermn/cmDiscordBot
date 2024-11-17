import { Message } from "eris";
import { Searcher, Song, Source } from "./interfaces";
const api = require("youtube-sr").default;
const source = Source.YOUTUBE;

export default class YTSearcher extends Searcher {
    private ytIDlength = 11;
    
    constructor() {
        super();
    }

    public async search(msg: Message): Promise<Song> {
        let query: string | null = this.removeCommand(msg.content);

        if (!query || query.trim() === "") {
            throw new Error("Invalid search");
        }

        if (query.includes("youtube.com") || query.includes("youtu.be")) {
            return this.createSongFromUrl(msg, query);
        }

        return this.createSong(msg, this.chooseSong(await this.getResults(query)));
    }

    private async getResults(query: string) {
        return api.search(query + ' "topic"');
    }

    private chooseSong(results: any) {
        console.log(results);
        for (let i = results.length - 1; i >= 0; i--) {
            if (results[i].duration > 1200000) {
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
        const title: string = chosenSong.title;
        const url: string = chosenSong.url;
        let requester: string;
        if (msg.author.globalName) {
            requester = msg.author.globalName;
        } else {
            requester = msg.author.username;
        }
        return {title, url, requester, source};
    }

    private createSongFromUrl(msg: Message, url: string): Song {
        let title: string = "Unknown";
        let requester = msg.author.username;
        return {title, url, requester, source}
    }
}