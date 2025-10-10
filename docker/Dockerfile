FROM node:22

WORKDIR /app

RUN apt-get update && apt-get install -y git
RUN apt-get install -y ffmpeg

RUN git clone https://github.com/Cratermn/cmDiscordBot.git .

RUN npm install

RUN npx tsc

CMD ["sh", "-c", "node dist/index.js \"$TOKEN\""]
