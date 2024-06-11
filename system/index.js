const {
	default: connectServer,
	useMultiFileAuthState,
	DisconnectReason,
	fetchLatestBaileysVersion,
	makeInMemoryStore,
	makeCacheableSignalKeyStore,
	jidDecode,
	proto,
	delay,
	getContentType,
	Browsers,
	fetchLatestWaWebVersion,
	PHONENUMBER_MCC
} = require("@whiskeysockets/baileys");
const pino = require("pino");
const {
	Boom
} = require("@hapi/boom");
const fs = require("fs");
const axios = require("axios");
const chalk = require("chalk");
const figlet = require("figlet");
const _ = require("lodash");
const PhoneNumber = require("awesome-phonenumber");
const NodeCache = require("node-cache");
const readline = require("readline");
/** Change it to true if needed */
const useStore = true;

const color = (text, color) => {
	return !color ? chalk.green(text) : chalk.keyword(color)(text);
};

function smsg(conn, m, store) {
	if (!m) return m;
	let M = proto.WebMessageInfo;
	if (m.key) {
		m.id = m.key.id;
		m.isBaileys = m.id.startsWith("BAE5") && m.id.length === 16;
		m.chat = m.key.remoteJid;
		m.fromMe = m.key.fromMe;
		m.isGroup = m.chat.endsWith("@g.us");
		m.sender = conn.decodeJid((m.fromMe && conn.user.id) || m.participant || m.key.participant || m.chat || "");
		if (m.isGroup) m.participant = conn.decodeJid(m.key.participant) || "";
	}
	if (m.message) {
		m.mtype = getContentType(m.message);
		m.msg = m.mtype == "viewOnceMessage" ? m.message[m.mtype].message[getContentType(m.message[m.mtype].message)] : m.message[m.mtype];
		m.body =
			m.message.conversation ||
			m.msg.caption ||
			m.msg.text ||
			(m.mtype == "viewOnceMessage" && m.msg.caption) ||
			m.text;
		let quoted = (m.quoted = m.msg.contextInfo ? m.msg.contextInfo.quotedMessage : null);
		m.mentionedJid = m.msg.contextInfo ? m.msg.contextInfo.mentionedJid : [];
		if (m.quoted) {
			let type = getContentType(quoted);
			m.quoted = m.quoted[type];
			if (["productMessage"].includes(type)) {
				type = getContentType(m.quoted);
				m.quoted = m.quoted[type];
			}
			if (typeof m.quoted === "string")
				m.quoted = {
					text: m.quoted,
				};
			m.quoted.mtype = type;
			m.quoted.id = m.msg.contextInfo.stanzaId;
			m.quoted.chat = m.msg.contextInfo.remoteJid || m.chat;
			m.quoted.isBaileys = m.quoted.id ? m.quoted.id.startsWith("BAE5") && m.quoted.id.length === 16 : false;
			m.quoted.sender = conn.decodeJid(m.msg.contextInfo.participant);
			m.quoted.fromMe = m.quoted.sender === conn.decodeJid(conn.user.id);
			m.quoted.text = m.quoted.text || m.quoted.caption || m.quoted.conversation || m.quoted.contentText || m.quoted.selectedDisplayText || m.quoted.title || "";
			m.quoted.mentionedJid = m.msg.contextInfo ? m.msg.contextInfo.mentionedJid : [];
			m.getQuotedObj = m.getQuotedMessage = async () => {
				if (!m.quoted.id) return false;
				let q = await store.loadMessage(m.chat, m.quoted.id, conn);
				return exports.smsg(conn, q, store);
			};
			let vM = (m.quoted.fakeObj = M.fromObject({
				key: {
					remoteJid: m.quoted.chat,
					fromMe: m.quoted.fromMe,
					id: m.quoted.id,
				},
				message: quoted,
				...(m.isGroup ? {
					participant: m.quoted.sender
				} : {}),
			}));

			/**
			 *
			 * @returns
			 */
			m.quoted.delete = () => conn.sendMessage(m.quoted.chat, {
				delete: vM.key
			});

			/**
			 *
			 * @param {*} jid
			 * @param {*} forceForward
			 * @param {*} options
			 * @returns
			 */
			m.quoted.copyNForward = (jid, forceForward = false, options = {}) => conn.copyNForward(jid, vM, forceForward, options);

			/**
			 *
			 * @returns
			 */
			m.quoted.download = () => conn.downloadMediaMessage(m.quoted);
		}
	}
	if (m.msg.url) m.download = () => conn.downloadMediaMessage(m.msg);
	m.text = m.msg.text || m.msg.caption || m.message.conversation || m.msg.contentText || m.msg.selectedDisplayText || m.msg.title || "";
	/**
	 * Reply to this message
	 * @param {String|Object} text
	 * @param {String|false} chatId
	 * @param {Object} options
	 */
	m.reply = (text, chatId = m.chat, options = {}) => (Buffer.isBuffer(text) ? conn.sendMedia(chatId, text, "file", "", m, {
		...options
	}) : conn.sendText(chatId, text, m, {
		...options
	}));
	/**
	 * Copy this message
	 */
	m.copy = () => exports.smsg(conn, M.fromObject(M.toObject(m)));

	return m;
}




const MAIN_LOGGER = pino({
	timestamp: () => `,"time":"${new Date().toJSON()}"`,
});

const logger = MAIN_LOGGER.child({});
logger.level = "trace";

const store = useStore ? makeInMemoryStore({ logger }) : undefined;
store?.readFromFile(`system/database/store.json`);

setInterval(() => {
	store?.writeToFile("system/database/store.json");
}, 60000 * 60);

const msgRetryCounterCache = new NodeCache();

const rl = readline.createInterface({
	input: process.stdin,
	output: process.stdout,
});
const question = text => new Promise(resolve => rl.question(text, resolve));

const P = require("pino")({
	level: "silent",
});

async function start() {
	const {
		state,
		saveCreds
	} = await useMultiFileAuthState(`./system/auth`);
	const {
		version,
		isLatest
	} = await fetchLatestWaWebVersion().catch(() => fetchLatestBaileysVersion());
	console.log(`using WA v${version.join(".")}, isLatest: ${isLatest}`);
	console.log(
		color(
			figlet.textSync("hello-world", {
				font: "Standard",
				horizontalLayout: "default",
				vertivalLayout: "default",
				whitespaceBreak: false,
			}),
			"white"
		)
	);

const client = connectServer({
        logger: pino({ level: 'silent' }),
        printQRInTerminal: false, // popping up QR in terminal log
      browser: [ 'Mac OS', 'Safari', '10.15.7' ], // for this issues https://github.com/WhiskeySockets/Baileys/issues/328
      patchMessageBeforeSending: (message) => {
            const requiresPatch = !!(
                message.buttonsMessage ||
                message.templateMessage ||
                message.listMessage
            );
            if (requiresPatch) {
                message = {
                    viewOnceMessage: {
                        message: {
                            messageContextInfo: {
                                deviceListMetadataVersion: 2,
                                deviceListMetadata: {},
                            },
                            ...message,
                        },
                    },
                };
            }
            return message;
        },
     auth: {
         creds: state.creds,
         keys: makeCacheableSignalKeyStore(state.keys, pino({ level: "fatal" }).child({ level: "fatal" })),
      },
      markOnlineOnConnect: true, // set false for offline
      generateHighQualityLinkPreview: true, // make high preview link
      getMessage: async (key) => {
            if (store) {
                const msg = await store.loadMessage(key.remoteJid, key.id)
                return msg.message || undefined
            }
            return {
                conversation: "Nex Here!"
            }
        },
      msgRetryCounterCache, // Resolve waiting messages
      defaultQueryTimeoutMs: undefined, // for this issues https://github.com/WhiskeySockets/Baileys/issues/276
   })
   
   /*
const client = connectServer({
		version,
		logger: P,
		printQRInTerminal: false,
		browser: Browsers.ubuntu("Chrome"),
		auth: {
			creds: state.creds,
			keys: makeCacheableSignalKeyStore(state.keys, P),
		},
		msgRetryCounterCache,
	});
	*/
store?.bind(client.ev);



	client.ev.on("messages.upsert", async (chatUpdate) => {
		//console.log(JSON.stringify(chatUpdate, undefined, 2))
		try {
			xchat = chatUpdate.messages[0];
			if (!xchat.message) return;
			xchat.message = Object.keys(xchat.message)[0] === "ephemeralMessage" ? xchat.message.ephemeralMessage.message : xchat.message;
			if (xchat.key && xchat.key.remoteJid === "status@broadcast") return;
			if (!client.public && !xchat.key.fromMe && chatUpdate.type === "notify") return;
			if (xchat.key.id.startsWith("BAE5") && xchat.key.id.length === 16) return;
			m = smsg(client, xchat, store);
			require("./bot")(client, m, chatUpdate, store);
		} catch (err) {
			console.log(err);
		}
	});

	client.ev.on("messages.upsert", async (chatUpdate) => {
		try {
			let xchat = chatUpdate.messages[0];
			if (!xchat.message) return;
			xchat.message = Object.keys(xchat.message)[0] === "ephemeralMessage" ? xchat.message.ephemeralMessage.message : xchat.message;

			if (xchat.key.remoteJid.endsWith('@s.whatsapp.net')) {
				if (xchat.message?.protocolMessage) return;
				client.sendPresenceUpdate('available');

				return;
			}

			if (xchat.key.remoteJid.endsWith('@s.whatsapp.net')) {
				if (xchat.message?.protocolMessage) return;
				client.sendPresenceUpdate('available');

				return;
			}

			if (xchat.key && xchat.key.remoteJid === "status@broadcast") {
				if (xchat.message?.protocolMessage) return;
				console.log(`Success ${xchat.pushName} ${xchat.key.participant.split('@')[0]}\n`);
				client.readMessages([xchat.key]);


				return;
			}
			if (xchat.key.id.startsWith("BAE5") && xchat.key.id.length === 16) return;
			m = smsg(client, xchat, store);
			require("./bot")(client, m, chatUpdate, store);
		} catch (err) {
			console.log(err);
		}
	});

	// Handle error
	const unhandledRejections = new Map();
	process.on("unhandledRejection", (reason, promise) => {
		unhandledRejections.set(promise, reason);
		console.log("Unhandled Rejection at:", promise, "reason:", reason);
	});
	process.on("rejectionHandled", (promise) => {
		unhandledRejections.delete(promise);
	});
	process.on("Something went wrong", function(err) {
		console.log("Caught exception: ", err);
	});

	// Setting
	client.decodeJid = (jid) => {
		if (!jid) return jid;
		if (/:\d+@/gi.test(jid)) {
			let decode = jidDecode(jid) || {};
			return (decode.user && decode.server && decode.user + "@" + decode.server) || jid;
		} else return jid;
	};

	client.ev.on("contacts.update", (update) => {
		for (let contact of update) {
			let id = client.decodeJid(contact.id);
			if (store && store.contacts) store.contacts[id] = {
				id,
				name: contact.notify
			};
		}
	});

	client.getName = (jid, withoutContact = false) => {
		id = client.decodeJid(jid);
		withoutContact = client.withoutContact || withoutContact;
		let v;
		if (id.endsWith("@g.us"))
			return new Promise(async (resolve) => {
				v = store.contacts[id] || {};
				if (!(v.name || v.subject)) v = client.groupMetadata(id) || {};
				resolve(v.name || v.subject || PhoneNumber("+" + id.replace("@s.whatsapp.net", "")).getNumber("international"));
			});
		else
			v =
			id === "0@s.whatsapp.net" ?
			{
				id,
				name: "WhatsApp",
			} :
			id === client.decodeJid(client.user.id) ?
			client.user :
			store.contacts[id] || {};
		return (withoutContact ? "" : v.name) || v.subject || v.verifiedName || PhoneNumber("+" + jid.replace("@s.whatsapp.net", "")).getNumber("international");
	};

	client.public = true;

	client.serializeM = (m) => smsg(client, m, store);
	client.ev.on("connection.update", async (update) => {
		const {
			connection,
			lastDisconnect
		} = update;
		if (connection === "close") {
			let reason = new Boom(lastDisconnect?.error)?.output.statusCode;
			if (reason === DisconnectReason.badSession) {
				console.log(`Bad Session File, Please Delete Session and Scan Again`);
				process.exit();
			} else if (reason === DisconnectReason.connectionClosed) {
				console.log("Connection closed, reconnecting....");
				start();
			} else if (reason === DisconnectReason.connectionLost) {
				console.log("Connection Lost from Server, reconnecting...");
				start();
			} else if (reason === DisconnectReason.connectionReplaced) {
				console.log("Connection Replaced, Another New Session Opened, Please Restart Bot");
				process.exit();
			} else if (reason === DisconnectReason.loggedOut) {
				console.log(`Device Logged Out, Please Delete Folder Session yusril and Scan Again.`);
				process.exit();
			} else if (reason === DisconnectReason.restartRequired) {
				console.log("Restart Required, Restarting...");
				start();
			} else if (reason === DisconnectReason.timedOut) {
				console.log("Connection TimedOut, Reconnecting...");
				start();
			} else {
				console.log(`Unknown DisconnectReason: ${reason}|${connection}`);
				start();
			}
		} else if (connection === "open") {
console.log("Bot Connected")
function saveToLocalFile(data) {
  try {
    fs.writeFileSync('system/database/earthquake.json', JSON.stringify(data));
    console.log('Earthquake data saved to local file.');
  } catch (error) {
    console.error('Error saving earthquake data to local file:', error);
  }
}
function loadFromLocalFile() {
  try {
    const data = fs.readFileSync('system/database/earthquake.json');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error loading earthquake data from local file:', error);
    return null;
  }
}
async function fetchEarthquakeData() {
  try {
    const response = await axios.get('https://data.bmkg.go.id/DataMKG/TEWS/autogempa.json');
    return response.data.Infogempa.gempa;
  } catch (error) {
    console.error('Error fetching earthquake data:', error);
    return null;
  }
}

function compareEarthquakeData(newData, oldData) {
  return JSON.stringify(newData) !== JSON.stringify(oldData);
}
async function runCodeOnDataChange() {
  let previousData = loadFromLocalFile();
  setInterval(async () => {
    const newData = await fetchEarthquakeData();
    if (newData && compareEarthquakeData(newData, previousData)) {
      const caption = `Tanggal: *${newData.Tanggal}*\nJam: *${newData.Jam}*\nCoordinates: *${newData.Coordinates}*\n\nMagnitude: *${newData.Magnitude}*\nKedalaman: *${newData.Kedalaman}*\nLintang: *${newData.Lintang}*\nBujur: *${newData.Bujur}*\nWilayah: *${newData.Wilayah}*\nPotensi: *${newData.Potensi}*\nDirasakan: *${newData.Dirasakan}*\n\nSource: *https://data.bmkg.go.id*`;

      console.log('Earthquake data has changed. Running code...');
      console.log('New Data:', newData);
      saveToLocalFile(newData);
      const storyConfigg = {
        backgroundColor: '#315575',
        font: 3
      };
      
      const who = fs.readFileSync(`system/database/number1.json`);
      client.sendMessage(
        'status@broadcast', {
          image: {
            url: `https://data.bmkg.go.id/datamkg/TEWS/${newData.Shakemap}`
          },
          caption: caption
        }, {
          ...storyConfigg,
          statusJidList: who
        }
      );

      previousData = newData;
    } else {
    }
  }, 5000);
}

runCodeOnDataChange();
		}
		// console.log('Connected...', update)
	});

	client.ev.on("creds.update", saveCreds);
	/*
		if (!client.authState.creds.registered) {
		const phoneNumber = await question("Enter your active whatsapp number: ");
		const code = await client.requestPairingCode(phoneNumber);
		console.log(`pairing with this code: ${code}`);
	}
	*/
	if (!client.authState.creds.registered) {
      let phoneNumber
      if (!!phoneNumber) {
         phoneNumber = phoneNumber.replace(/[^0-9]/g, '')

         if (!Object.keys(PHONENUMBER_MCC).some(v => phoneNumber.startsWith(v))) {
            console.log(chalk.bgBlack(chalk.redBright("Number: ")))
            process.exit(0)
         }
      } else {
         phoneNumber = await question(chalk.bgBlack(chalk.greenBright(`Please type your WhatsApp number:`)))
         phoneNumber = phoneNumber.replace(/[^0-9]/g, '')

         // Ask again when entering the wrong number
         if (!Object.keys(PHONENUMBER_MCC).some(v => phoneNumber.startsWith(v))) {
            console.log(chalk.bgBlack(chalk.redBright("Start with country code of your WhatsApp Number: ")))

            phoneNumber = await question(chalk.bgBlack(chalk.greenBright(`Please type your WhatsApp number 😍\nFor example: +916909137213 : `)))
            phoneNumber = phoneNumber.replace(/[^0-9]/g, '')
            rl.close()
         }
      }

      setTimeout(async () => {
         let code = await client.requestPairingCode(phoneNumber)
         code = code?.match(/.{1,4}/g)?.join("-") || code
         console.log(chalk.black(chalk.bgGreen(`Your Pairing Code : `)), chalk.black(chalk.white(code)))
      }, 3000)
   }
	
	/*Detect Composing
client.ev.on("presence.update", ({jid, presences}) => {
  console.log("presence update", presences);

  // Extract the sender's JID
  const senderJid = Object.keys(presences)[0];

  // Check if the sender's presence is 'composing'
  if (presences[senderJid].lastKnownPresence === 'composing') {
    // Send a message to the sender
    client.sendMessage(senderJid, { text: 'ngetik apa? :)' });
  }
});
*/

	const getBuffer = async (url, options) => {
		try {
			options ? options : {};
			const res = await axios({
				method: "get",
				url,
				headers: {
					DNT: 1,
					"Upgrade-Insecure-Request": 1,
				},
				...options,
				responseType: "arraybuffer",
			});
			return res.data;
		} catch (err) {
			return err;
		}
	};

	client.sendImage = async (jid, path, caption = "", quoted = "", options) => {
		let buffer = Buffer.isBuffer(path) ?
			path :
			/^data:.*?\/.*?;base64,/i.test(path) ?
			Buffer.from(path.split`,` [1], "base64") :
			/^https?:\/\//.test(path) ?
			await await getBuffer(path) :
			fs.existsSync(path) ?
			fs.readFileSync(path) :
			Buffer.alloc(0);
		return await client.sendMessage(jid, {
			image: buffer,
			caption: caption,
			...options
		}, {
			quoted
		});
	};

	client.sendText = (jid, text, quoted = "", options) => client.sendMessage(jid, {
		text: text,
		...options
	}, {
		quoted
	});

	client.cMod = (jid, copy, text = "", sender = client.user.id, options = {}) => {
		//let copy = message.toJSON()
		let mtype = Object.keys(copy.message)[0];
		let isEphemeral = mtype === "ephemeralMessage";
		if (isEphemeral) {
			mtype = Object.keys(copy.message.ephemeralMessage.message)[0];
		}
		let msg = isEphemeral ? copy.message.ephemeralMessage.message : copy.message;
		let content = msg[mtype];
		if (typeof content === "string") msg[mtype] = text || content;
		else if (content.caption) content.caption = text || content.caption;
		else if (content.text) content.text = text || content.text;
		if (typeof content !== "string")
			msg[mtype] = {
				...content,
				...options,
			};
		if (copy.key.participant) sender = copy.key.participant = sender || copy.key.participant;
		else if (copy.key.participant) sender = copy.key.participant = sender || copy.key.participant;
		if (copy.key.remoteJid.includes("@s.whatsapp.net")) sender = sender || copy.key.remoteJid;
		else if (copy.key.remoteJid.includes("@broadcast")) sender = sender || copy.key.remoteJid;
		copy.key.remoteJid = jid;
		copy.key.fromMe = sender === client.user.id;

		return proto.WebMessageInfo.fromObject(copy);
	};

	return client;
}



start();

let file = require.resolve(__filename);
fs.watchFile(file, () => {
	fs.unwatchFile(file);
	console.log(chalk.redBright(`Update ${__filename}`));
	delete require.cache[file];
	require(file);
});