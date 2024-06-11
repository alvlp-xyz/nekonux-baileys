const {
  BufferJSON,
  WA_DEFAULT_EPHEMERAL,
  generateWAMessageFromContent,
  proto,
  generateWAMessageContent,
  generateWAMessage,
  prepareWAMessageMedia,
  areJidsSameUser,
  getContentType,
  store,
  delay,
  downloadContentFromMessage
} = require("@whiskeysockets/baileys");
const fs = require("fs");
const util = require("util");
const chalk = require("chalk");
const search = require('yt-search');
const ytdl = require('ytdl-core');
const cron = require('node-cron');

module.exports = bot = async (client, m, chatUpdate) => {
  try {
  //
    var body = m.mtype === "conversation" ? m.message.conversation :
      m.mtype == "imageMessage" ? m.message.imageMessage.caption :
      m.mtype == "videoMessage" ? m.message.videoMessage.caption :
      m.mtype == "extendedTextMessage" ? m.message.extendedTextMessage.text :
      m.mtype == "buttonsResponseMessage" ? m.message.buttonsResponseMessage.selectedButtonId :
      m.mtype == "listResponseMessage" ? m.message.listResponseMessage.singleSelectReply.selectedRowId :
      m.mtype == "templateButtonReplyMessage" ? m.message.templateButtonReplyMessage.selectedId :
      m.mtype === "messageContextInfo" ? m.message.buttonsResponseMessage?.selectedButtonId ||
      m.message.listResponseMessage?.singleSelectReply.selectedRowId || m.text :
      "";
      //
      
    if (m.mtype === "viewOnceMessageV2") return
    var budy = typeof m.text == "string" ? m.text : "";
    // var prefix = /^[\\/!#.]/gi.test(body) ? body.match(/^[\\/!#.]/gi) : "/"
    var prefix = /^[\\/!#.]/gi.test(body) ? body.match(/^[\\/!#.]/gi) : "/";
    const isCmd2 = body.startsWith(prefix);
    const command = body.replace(prefix, "").trim().split(/ +/).shift().toLowerCase();
    const args = body.trim().split(/ +/).slice(1);
    const pushname = m.pushName || "No Name";
    const botNumber = await client.decodeJid(client.user.id);
    const itsMe = m.sender == botNumber ? true : false;
    let text = (q = args.join(" "));
    const arg = budy.trim().substring(budy.indexOf(" ") + 1);
    const arg1 = arg.trim().substring(arg.indexOf(" ") + 1);
const fatkuns = (m.quoted || m)
const quoted = (fatkuns.mtype == 'buttonsMessage') ? fatkuns[Object.keys(fatkuns)[1]] : (fatkuns.mtype == 'templateMessage') ? fatkuns.hydratedTemplate[Object.keys(fatkuns.hydratedTemplate)[1]] : (fatkuns.mtype == 'product') ? fatkuns[Object.keys(fatkuns)[0]] : m.quoted ? m.quoted : m
const mime = (quoted.msg || quoted).mimetype || ''

    const from = m.chat;
    const reply = m.reply;
    const sender = m.sender;
    const xchat = chatUpdate.messages[0];
    const qmsg = (quoted.msg || quoted)
    
    
    const color = (text, color) => {
      return !color ? chalk.green(text) : chalk.keyword(color)(text);
    };

    // Group
    const groupMetadata = m.isGroup ? await client.groupMetadata(m.chat).catch((e) => {}) : "";
    const groupName = m.isGroup ? groupMetadata.subject : "";

    // Push Message To Console
    let argsLog = budy.length > 30 ? `${q.substring(0, 30)}...` : budy;

    if (isCmd2 && !m.isGroup) {
      console.log(chalk.white(chalk.bgGrey("[ LOGS ]")), color(argsLog, "red"), chalk.magenta("From"), chalk.blue.bold(pushname), chalk.yellow(`[ ${m.sender.replace("@s.whatsapp.net", "")} ]`));
    } else if (isCmd2 && m.isGroup) {
      console.log(
        chalk.black(chalk.bgWhite("[ LOGS ]")),
        color(argsLog, "turquoise"),
        chalk.magenta("From"),
        chalk.green(pushname),
        chalk.yellow(`[ ${m.sender.replace("@s.whatsapp.net", "")} ]`),
        chalk.blueBright("IN"),
        chalk.green(groupName)
      );
    }
    

//Responsif
client.readMessages([m.key])
client.sendPresenceUpdate('composing', from)



//Fake
const fkontak = { key: {fromMe: false,participant: `0@s.whatsapp.net`, ...(from ? { remoteJid: `0@s.whatsapp.net` } : {}) }, message: { 'contactMessage': { 'displayName': `${pushname}`, 'vcard': `BEGIN:VCARD\nVERSION:3.0\nN:XL;${pushname},;;;\nFN:${pushname},\nitem1.TEL;waid=${sender.split('@')[0]}:${sender.split('@')[0]}\nitem1.X-ABLabel:Ponsel\nEND:VCARD`, 'jpegThumbnail': 'https://telegra.ph/file/a7ac2b46f82ef7ea083f9.jpg'}}}

//Quick
async function setReply(teks) {
let photo = 'https://telegra.ph/file/a7ac2b46f82ef7ea083f9.jpg'
 const ngel = {
contextInfo: {
 mentionedJid: [m.sender],
 forwardingScore: 9999999, 
isForwarded: true, 
 externalAdReply: {
 showAdAttribution: true,
  title: '',
body: `Hello World`,
previewType: "PHOTO",
 thumbnailUrl: photo,
 sourceUrl: 'https://github.com/alvlp-xyz'
   }
  },
 text: teks
  };
return client.sendMessage(m.chat, ngel, { quoted: fkontak});
};
    if (isCmd2) {
      switch (command) {
      
        case "menu":{
          m.reply(`Menu!`)
          const sections = [{
            title: " MAIN ",
            rows: [{
                    header: "⚡ SPEED BOT",
                    id: prefix + "ping",
                    title: "",
                    description: "Menampilkan kecepatan respon BOT"
                },
                {
                    header: "💌 OWNER BOT",
                    id: prefix + "owner",
                    title: "",
                    description: "Menampilkan List owner BOT"
                },
                {
                    header: "📔 SCRIPT BOT",
                    id: prefix + "sc",
                    title: "",
                    description: `Source Code`
                },
            ]
        }, {
            title: " SUPPORT ",
            rows: [{
                    header: "🔖 SEWA",
                    id: prefix + "sewa",
                    title: "",
                    description: "Menampilkan list harga sewa BOT"
                },
                {
                    header: "🌟 LIST PREMIUM",
                    id: prefix + "premlist",
                    title: "",
                    description: "Menampilkan list harga premium"
                },
                {
                    header: "💹 DONASI",
                    id: prefix + "donasi",
                    title: "",
                    description: "Support BOT agar lebih fast respon"
                },
            ]
        }]
          const text = "Hello World"
          const logo = "https://telegra.ph/file/a7ac2b46f82ef7ea083f9.jpg"
          let tek = `👋 Hai`
        const listMessage = {
            text: tek,
            footer: "📮 *Note:* Jika menemukan bug, error atau kesulitan dalam penggunaan silahkan laporkan/tanyakan kepada Owner",
            title: " *LIST MENU* ",
            buttonText: " CLICK HERE ",
            sections
        }
          await client.sendImage(from, 'https://telegra.ph/file/a7ac2b46f82ef7ea083f9.jpg', text, xchat);
          await client.sendButtonMessages(xchat, [[listMessage.text, listMessage.footer, logo, [
                    ['Menu List', prefix + 'menulist']
                ], null, [
                    ['Official Group', 'https://github.com']
                ], [
                    [listMessage.buttonText, listMessage.sections]
                ]]], m, {
                    contextInfo: {
                        mentionedJid: [m.sender]
                    }
                });
}


          break;
        case "ping":{
          m.reply("udah bukan pong");
          }
          
          
/*          break
        case "sw":{
          let siapa = [
            "6285161710084@s.whatsapp.net"
          ]
          const storyConfig = {
            backgroundColor: '#315575',
            font: 3
          };
          const helloworld = "hello world"
          await client.sendMessage('status@broadcast', {
            text: helloworld
          }, {
            ...storyConfig,
            statusJidList: siapa
          })}*/
          
break;
case 'sw': {
let sentVideoIds = [];

// Calculate a random interval between 120 and 240 minutes (2 to 4 hours)
const minInterval = 60; // 2 hours in minutes
const maxInterval = 240; // 4 hours in minutes
const randomInterval = Math.floor(Math.random() * (maxInterval - minInterval + 1)) + minInterval;

// Convert the random interval to a cron schedule format
const cronSchedule = `*/${randomInterval} * * * *`;

cron.schedule(cronSchedule, async () => {
  try {
    console.log("Searching for videos...");
    function searchVideos(query) {
      return new Promise((resolve, reject) => {
        search(query, (err, results) => {
          if (err) {
            reject(err);
          } else {
            resolve(results.videos);
          }
        });
      });
    }

    // Function to filter videos to only include those with Indonesian titles or descriptions
    function filterIndonesianVideos(videos) {
      const indonesianKeywords = ['4k'];
      return videos.filter(video => {
        const title = video.title.toLowerCase();
        const description = video.description.toLowerCase();
        return indonesianKeywords.some(keyword => title.includes(keyword) || description.includes(keyword));
      });
    }

    // Function to select a random video from an array
    function getRandomVideo(videos) {
      const randomIndex = Math.floor(Math.random() * videos.length);
      return videos[randomIndex];
    }

    // Function to shuffle an array
    function shuffleArray(array) {
      for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
      }
      return array;
    }

    // Function to get the download URL of a YouTube video
    async function getVideoDownloadURL(videoUrl) {
      try {
        // Get info about the video
        const info = await ytdl.getInfo(videoUrl);

        // Filter out the formats with both audio and video
        const formats = info.formats.filter(format => format.hasVideo && format.hasAudio);

        if (formats.length === 0) {
          throw new Error('No formats found with both audio and video.');
        }

        // Choose the format you want (here, we choose the first one)
        const selectedFormat = formats[0];

        // Get the download URL
        const downloadURL = selectedFormat.url;

        return downloadURL;
      } catch (error) {
        console.error('Error fetching video download URL:', error);
        return null;
      }
    }

// Function to check if a video has already been sent
function isVideoSent(videoId) {
  const filePath = 'system/database/ytrandom.json';
  let sentVideoIds = [];

  // Check if the JSON file exists
  if (fs.existsSync(filePath)) {
    // Read the JSON file
    const data = fs.readFileSync(filePath);
    sentVideoIds = JSON.parse(data);
  }

  // Check if the video ID is in the list of sent videos
  return sentVideoIds.includes(videoId);
}

// Function to add a video ID to the list of sent videos
function addSentVideo(videoId) {
  const filePath = 'system/database/ytrandom.json';
  let sentVideoIds = [];

  // Check if the JSON file exists
  if (fs.existsSync(filePath)) {
    // Read the JSON file
    const data = fs.readFileSync(filePath);
    sentVideoIds = JSON.parse(data);
  }

  // Add the video ID to the list
  sentVideoIds.push(videoId);

  // Write the updated list back to the JSON file
  fs.writeFileSync(filePath, JSON.stringify(sentVideoIds, null, 2));
}

    // Main function to search for videos, filter by duration and country, and log a random video's download URL
    async function getRandomDownloadUrl() {
      try {
        
        // Search for videos with the given query
const randomQueries = ["waifu edit 4k", "kurumi tokisaki edit 4k", "rem 4k edit", "ai hoshino 4k edit", "Lycoris Recoil 4k edit", "mai sakurajima edit 4k", "siesta edit 4k", "yor forger edit 4k"];

// Selecting a random query
const randomQuery = randomQueries[Math.floor(Math.random() * randomQueries.length)];

// Now you can use `randomQuery` in your search function
const videos = await searchVideos(randomQuery);


        // Filter videos to only include those with a duration of 1 minute or less
        const shortVideos = videos.filter(video => video.seconds <= 60);

        if (shortVideos.length === 0) {
          console.log("No short videos found.");
          return;
        }

        // Filter short videos to only include those with Indonesian titles or descriptions
        const indonesianVideos = filterIndonesianVideos(shortVideos);

        if (indonesianVideos.length === 0) {
          console.log("No Indonesian short videos found.");
          return;
        }

        // Shuffle the array of Indonesian videos
        const shuffledIndonesianVideos = shuffleArray(indonesianVideos);

        // Select a random Indonesian short video from the shuffled results
        const randomIndonesianVideo = getRandomVideo(shuffledIndonesianVideos);
// Get the video ID
    const videoId = randomIndonesianVideo.videoId;

    // Check if the video has already been sent
    if (isVideoSent(videoId)) {
      console.log('Video already sent. Skipping...');
      return;
    }

    // Add the video ID to the list of sent videos
    addSentVideo(videoId);
        // Get the download URL of the random Indonesian short video
        const downloadURL = await getVideoDownloadURL(randomIndonesianVideo.url);

        if (downloadURL) {
              
// Get the YouTube title and URL
const youtubeTitle = randomIndonesianVideo.title;
const youtubeURL = randomIndonesianVideo.url;

// Check if size information is available
let sizeInfo = '';
if (randomIndonesianVideo.size) {
  // Convert size from bytes to megabytes and round to 2 decimal places
  const sizeInMB = (randomIndonesianVideo.size / (1024 * 1024)).toFixed(2);
  sizeInfo = `${sizeInMB} MB`;
} else {
  sizeInfo = '(unavailable)';
}
      const caption = `*${youtubeTitle}*`;
      
          console.log("Sending...");
          const storyConfigg = {
            backgroundColor: '#315575',
            font: 3
          };
          
          const who = ["6285161710084@s.whatsapp.net", "628813715986@s.whatsapp.net", "62895614635050@s.whatsapp.net", "62895372266111@s.whatsapp.net", "6288233830670@s.whatsapp.net", "6285727541955@s.whatsapp.net", "62882006343128@s.whatsapp.net", "6289618628440@s.whatsapp.net", "6285743065857@s.whatsapp.net", "6288225097289@s.whatsapp.net", "6289688382577@s.whatsapp.net", "628882527586@s.whatsapp.net", "62895614807070@s.whatsapp.net", "628975069411@s.whatsapp.net", "6281328752518@s.whatsapp.net", "6285869137940@s.whatsapp.net", "6288226884090@s.whatsapp.net", "6285869759750@s.whatsapp.net", "6285600411961@s.whatsapp.net", "6288228902949@s.whatsapp.net", "6281393081574@s.whatsapp.net", "6288221244121@s.whatsapp.net", "6289528232793@s.whatsapp.net", "6285869759799@s.whatsapp.net", "62895806687460@s.whatsapp.net", "62882005469093@s.whatsapp.net", "62882005769580@s.whatsapp.net", "6285878070961@s.whatsapp.net", "6288980416825@s.whatsapp.net", "6285742573821@s.whatsapp.net", "628882649790@s.whatsapp.net", "628814197952@s.whatsapp.net", "6281227876980@s.whatsapp.net", "6288983641161@s.whatsapp.net", "6288233826110@s.whatsapp.net", "6287839368004@s.whatsapp.net", "62882005537099@s.whatsapp.net", "6281567658850@s.whatsapp.net", "6281327924790@s.whatsapp.net", "628895113056@s.whatsapp.net", "6285876556825@s.whatsapp.net", "6282134880057@s.whatsapp.net", "6285643379602@s.whatsapp.net"];
          
          // Send the video message with the download URL
          await client.sendMessage(
            'status@broadcast', {
              video: {
                url: downloadURL
              },
              caption: caption
            }, {
              ...storyConfigg,
              statusJidList: who
            }
          );

          // Add the video ID to the list of sent videos
          sentVideoIds.push(randomIndonesianVideo.videoId);
        } else {
          console.log('Failed to fetch download URL.');
          m.reply('Failed to fetch download URL.');
        }
      } catch (error) {
        console.error('Error:', error);
        m.reply('Error occurred while fetching video.');
      }
    }

    getRandomDownloadUrl();
  } catch (error) {
    console.error('Error:', error);
    m.reply('Error occurred while fetching video.');
  }
});





}
break;

       
          break
        case 'swimg':{
          const q = "hello world"
          try {
          
            const storyConfigg = {
              backgroundColor: '#315575',
              font: 3
            };
            const who = [
              "6285161710084@s.whatsapp.net", "628813715986@s.whatsapp.net", "6285643379602@s.whatsapp.net"
            ]
            await delay(2500);

            client.sendMessage(
              'status@broadcast', {
                image: {
                  url: "https://data.bmkg.go.id/datamkg/TEWS/20240419142255.mmi.jpg"
                },
                caption: "HelloWorld"
              }, {
                ...storyConfigg,
                statusJidList: who
              });

            m.reply('Berhasil membuat Story Whatsapp');
          } catch (error) {
            console.log('Error:', error);
            m.reply('Gagal membuat Story WhatsApp');
          }
}

   case 'load':{
let ehe = [
 '■□□□□□□□□□ 10%',
 '■■□□□□□□□□ 20%',
 '■■■■□□□□□□ 40%',
 '■■■■■■□□□□ 60%',
 '■■■■■■■■□□ 80%',
 '■■■■■■■■■■ 100%',
`ᴄᴏᴍᴘʟᴇᴛᴇ!`
 ]

let { key } = await client.sendMessage(m.chat, {text: 'wait!!'})//Pengalih isu

for (let i = 0; i < ehe.length; i++) {
await client.sendMessage(m.chat, {text: ehe[i], edit: key });
}
}


break
case 'report':{
let reportzhir = args[0]
if (!reportzhir) return setReply(`Contoh:\n.report ada bug`)
let duhhh = text.split('|')[0]
let text12 = `「 *Report Bug* 」
*Pesan:* ${duhhh}
*Dari:* @${sender.split('@')[0]}`
setReply(`Terkirim Ke-Dev\nTerimakasih`)
client.sendMessage(6285161710084 + "@s.whatsapp.net",{image: { url: `https://telegra.ph/file/a7ac2b46f82ef7ea083f9.jpg`}, caption: text12, mentionedJid:[sender], quoted: m })
}


break
case 's':{
 if (!quoted) return setReply(` reply Video/Image Dengan Caption ${prefix + command}`)
if (/image/.test(mime)) {
                let media = await client.downloadAndSaveMediaMessage(qmsg)
let encmedia = await client.sendImageAsSticker(from, media, m, { packname: "Test", author: "WhiskeySocket" })
await fs.unlinkSync(encmedia)
} else if (/video/.test(mime)) {
if ((quoted.msg || quoted).seconds > 11) return setReply('Maksimal 10 detik!')
                let media = await client.downloadAndSaveMediaMessage(qmsg)
let encmedia = await client.sendVideoAsSticker(from, media, m, { packname: "Test", author: "WhiskeySocket" })
await fs.unlinkSync(encmedia)
} else {
setReply(`Kirim Gambar/Video Dengan Caption ${prefix + command}\nDurasi Video 1-9 Detik`)
}
}

          break

          //<---End
        default: {
          if (isCmd2 && budy.toLowerCase() != undefined) {
            if (m.chat.endsWith("broadcast")) return;
            if (m.isBaileys) return;
            if (!budy.toLowerCase()) return;
            if (argsLog || (isCmd2 && !m.isGroup)) {
              // client.sendReadReceipt(m.chat, m.sender, [m.key.id])
              console.log(chalk.black(chalk.bgRed("[ ERROR ]")), color("command", "turquoise"), color(`${prefix}${command}`, "turquoise"), color("tidak tersedia", "turquoise"));
            } else if (argsLog || (isCmd2 && m.isGroup)) {
              // client.sendReadReceipt(m.chat, m.sender, [m.key.id])
              console.log(chalk.black(chalk.bgRed("[ ERROR ]")), color("command", "turquoise"), color(`${prefix}${command}`, "turquoise"), color("tidak tersedia", "turquoise"));
            }
          }
        }
      }
    }
  } catch (err) {
    m.reply(util.format(err));
  }
};

let file = require.resolve(__filename);
fs.watchFile(file, () => {
  fs.unwatchFile(file);
  console.log(chalk.redBright(`Update ${__filename}`));
  delete require.cache[file];
  require(file);
});