import { Downloader, Song } from "./interfaces";


export default class YTDownloader extends Downloader {
    private youtubedl = require("youtube-dl-exec");
    constructor() {
        super();
    }

    public download(sng: Song): Promise<void> {
        return this.youtubedl(sng.url, {
            extractAudio: true,
            audioFormat: "mp3",
            preferFfmpeg: true,
            output: Downloader.mp3FilePath,
        });
    }
}