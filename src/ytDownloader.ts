import { Downloader } from "./interfaces";
import Song from "./song";


export default class YTDownloader extends Downloader {
    private youtubedl = require("youtube-dl-exec");
    constructor() {
        super();
    }

    public download(sng: Song): Promise<void> {
        return this.youtubedl(sng.getURL(), {
            extractAudio: true,
            audioFormat: "mp3",
            preferFfmpeg: true,
            output: Downloader.mp3FilePath,
        });
    }
}