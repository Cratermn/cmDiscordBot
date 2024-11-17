import { Message } from "eris";
import { promises as fsPromises } from 'fs';



export interface Song {
	title: string;
	url: string;
	requester: string;
	source: Source;
}

// Used by to determine which downloader to use
export enum Source {
	YOUTUBE
}

export abstract class Searcher {
	constructor() {

	}
	// Should be implemented for each different search engine used
	public abstract search(msg: Message): Promise<Song>;

	protected removeCommand(str: string): string | null {
		const index = str.indexOf(" ");
		if (index === -1) {
			// If there's no space, return the original string
			return null;
		}
		// Return the substring after the first space
		return str.substring(index + 1);
	}
}


export abstract class Downloader {
	private static path = require('path');
	protected static dir: string = "tmp";
	protected static currentPath = process.cwd();
    protected static dirPath = this.path.join(this.currentPath, this.dir);
    public static mp3FilePath = this.path.join(this.currentPath, this.dir, "output.mp3");

	constructor() {
	}
	public abstract download(sng: Song): Promise<void>;

	public static async deleteAllFilesInDirectory(): Promise<void> {
        try {
            // Read the contents of the directory
            const files = await fsPromises.readdir(Downloader.dirPath);
    
            // Iterate through each file in the directory
            for (const file of files) {
                const filePath = Downloader.path.join(Downloader.dirPath, file);
    
                // Check if the item is a file (not a subdirectory)
                const stat = await fsPromises.lstat(filePath);
                if (stat.isFile()) {
                    // File exists, proceed to delete
                    await fsPromises.unlink(filePath);
                    console.log(`Deleted file: ${filePath}`);
                }
            }
            console.log("All files deleted successfully.");
        } catch (err) {
            console.error("Error deleting files:", err);
        }
    }

}