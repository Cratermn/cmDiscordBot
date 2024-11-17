import Song from "./song"

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
            que = que.concat(`${i + 1}. ${this.songs[i].toString()}\n`);
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