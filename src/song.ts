import { Source } from "./interfaces";

export default class Song {

	private title: string;
	private url: string;
	private requester: string;
	private artist?: string;
	private source: Source;

    constructor(title: string, url: string, requester: string, source: Source, artist?: string, ) {
        this.title = title;
        this.url = url;
        this.requester = requester;
        this.source = source;
        if (artist) {
            this.artist = artist;
        } else {
            this.artist = "Unknown";
        }
    }

    public getSource(): Source {
        return this.source;
    }

    public getURL(): string {
        return this.url;
    }

    public getTitle(): string {
        return this.title;
    }


    public toString(): string {
        if (this.title === "Unknown") {
            return this.nowPlaying();
        }
        return `${this.title} by ${this.artist} | Requested by ${this.requester}`;
    }

    public nowPlaying(): string {
        return `${this.url} | Requested by ${this.requester}`;
    }

}