import { Source } from "./interfaces";

export default class Song {

	private title: string;
	private url: string;
	private requester: string;
	private artist?: string;
	private source: Source;
    private duration: number;

    constructor(title: string, url: string, requester: string, source: Source, duration: number, artist: string) {
        this.title = title;
        this.url = url;
        this.requester = requester;
        this.source = source;
        this.duration = duration;
        this.artist = artist;
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

    public getSeconds(): number {
        return this.duration;
    }

    public static getDurationFormatted(seconds: number): string {
        let hours = Math.trunc(seconds / 3600);
        let minutes = Math.trunc((seconds % 3600) / 60)
        let sec = (seconds % 60)
        let secString;
        if (sec < 10) {
            secString = `0${sec}`;
        } else {
            secString = `${sec}`;
        }

        if (hours == 0) {
            return `${minutes}:${secString}`;
        } else if (minutes < 10) {
            return `${hours}:0${minutes}:${secString}`;
        } else {
            return `${hours}:${minutes}:${secString}`;
        }
    }


    public toString(): string {
        return `${this.title} by ${this.artist} **|** Requested by ${this.requester} **|** *${Song.getDurationFormatted(this.duration)}*`;
    }

    public nowPlaying(): string {
        return `${this.url} | Requested by ${this.requester}`;
    }

}