import {Song} from "./interfaces"

export default class Queue {

    private songs: Song[];

    public constructor() {
        this.songs = [];
    }


    public clear() {
        this.songs = [];
    }

    public remove(indexToRemove: number) {
        // Remove the entry from the queue
        return this.songs.splice(indexToRemove, 1);  // Splice removes the entry and returns the removed item
    }

    public display() {
        let que: string = "Songs in que:\n";
        for (let i = 0; i < this.songs.length; i++) {
            if (this.songs[i].title === "Unknown") {
                que = que.concat(`${i + 1}. ${this.songs[i].url} | Requested by: ${this.songs[i].requester}\n`);
            } else {
                que = que.concat(`${i + 1}. ${this.songs[i].title} | Requested by: ${this.songs[i].requester}\n`);
            }
        }
        return que;
    }

    public add(song: Song) {
        this.songs.push(song);
    }

    public getNext() {
        return this.songs.shift();
    }

    public length() {
        return this.songs.length;
    }

}