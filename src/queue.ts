import Song from "./song"

export default class Queue {

    private songs: Song[];
    private duration: number;

    public constructor() {
        this.songs = [];
        this.duration = 0;
    }


    public clear() {
        this.songs = [];
    }

    public remove(indexToRemove: number) {
        // Remove the entry from the queue
        this.editDuration(this.songs[indexToRemove], false);
        return this.songs.splice(indexToRemove, 1);  // Splice removes the entry and returns the removed item
    }

    public display() {
        let que: string = `**Songs in que** | **Est. Duration** - *${Song.getDurationFormatted(this.duration)}*\n`;
        for (let i = 0; i < this.songs.length; i++) {
            que = que.concat(`**${i + 1}.** ${this.songs[i].toString()}\n`);
        }
        return que;
    }

    private editDuration(song: Song, isAdd: boolean) {
        if (isAdd) {
            this.duration += song.getSeconds();
        } else {
            this.duration -= song.getSeconds();
        }
    }

    public add(song: Song) {
        this.editDuration(song, true);
        this.songs.push(song);
    }

    public getNext() {
        this.editDuration(this.songs[0], false);
        return this.songs.shift();
    }

    public length() {
        return this.songs.length;
    }

}