import { Downloader } from "./interfaces";
import Song from "./song";
import { YtDlp } from "ytdlp-nodejs";

export default class YTDownloader extends Downloader {
    private ytdlp: YtDlp;

    constructor() {
        super();
        this.ytdlp = new YtDlp();
    }

    public async download(sng: Song): Promise<void> {
        try {
            await this.ytdlp.downloadAsync(sng.getURL(), {
                format: {
                    filter: "audioonly",
                    quality: 1,
                    type: "mp3"
                },
                output: Downloader.mp3FilePath,
                onProgress: (progress) => {
                    console.log(
                        "Downloading..."
                    );
                }
            });
            console.log("Download completed successfully!");
        } catch (error) {
            console.error("YTDownloader error:", error);
            throw error;
        }
    }
}