"use strict";
/*
async function play(msg: Message): Promise<void> {

    try {
        const connection = await connect(msg);
        if (!connection) {
            console.log('connect failed');
            return;
        }
        
        const audioStream = fs.createReadStream("sound_effect.mp3");

    // Use ffmpeg to convert audio to Opus format
    const ffmpegStream = ffmpeg(audioStream)
    .setFfmpegPath(ffmpegPath) // Set the path to ffmpeg
    .audioCodec('libopus')
    .format('opus')
    .pipe();

    // Play the converted stream
    connection.play(ffmpegStream, {
        type: 'opus'
    });

        // Step 2: Play the MP3 file in the voice channel
        
        //connection.play(audioStream);

        audioStream.on('open', () => {
            console.log('Audio stream opened');
        });
        audioStream.on('error', (err) => {
            console.error('Error with audio stream:', err);
        });
         // Read and display the file data on console
         audioStream.on('data', function (chunk) {
            console.log(chunk);
        });
            // Read and display the file data on console
        audioStream.on('close', () => {
            console.log('Audio stream closed');
        });
        connection.on('debug', (message) => {
            console.log(message);
        });
        connection.on('end', () => {
            console.log("playing stopped");
        });
        connection.on('error', (err) => {
            console.log('error: ');
            console.log(err);
        });
        connection.on('speakingStart', (id) => {
            console.log('user started speaking: ');
            console.log(id);
        });
        connection.on('speakingStop', (id) => {
            console.log('user stopped speaking: ');
            console.log(id);
        });
        connection.on('start', () => {
            console.log('stream started: ');
        });
        connection.on('ready', () => {
            console.log('conn ready: ');
        });
        connection.on('warn', (message) => {
            console.log("warning: ");
            console.log(message);
        });

        sendMessage(getTextChannelID(msg), `Now playing: `);

    } catch (err) {
        console.error("Error:", err);
        if (!getVoiceChannelID(msg)) {
            sendMessage(getTextChannelID(msg), "Please join a voice channel.");
        } else {
            sendMessage(getTextChannelID(msg), "An error occurred while trying to play the audio.");
        }
        
        playing = false;
    }
}
*/
//# sourceMappingURL=test.js.map