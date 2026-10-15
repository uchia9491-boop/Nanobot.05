
require("dotenv").config();

const pino = require("pino");

async function iniciarBot() {
  console.log("================================");
  console.log("       NANO BOT");
  console.log("================================");
  console.log("A iniciar o sistema...");

  try {
    const { default: makeWASocket } = await import(
      "@whiskeysockets/baileys"
    );

    const {
      useMultiFileAuthState,
      DisconnectReason
    } = await import("@whiskeysockets/baileys");

    const { state, saveCreds } = await useMultiFileAuthState(
      process.env.SESSION_DIR || "auth_info"
    );

    const sock = makeWASocket({
      auth: state,
      logger: pino({ level: "silent" }),
      printQRInTerminal: false,
      browser: ["NANO BOT", "Chrome", "1.0.0"]
    });

    sock.ev.on("creds.update", saveCreds);

    sock.ev.on("connection.update", async (update) => {
      const { connection, lastDisconnect } = update;

      if (connection === "open") {
        console.log("NANO BOT conectado ao WhatsApp!");
      }

      if (connection === "close") {
        const code = lastDisconnect?.error?.output?.statusCode;

        console.log("Ligação encerrada. Código:", code);

        if (code !== DisconnectReason.loggedOut) {
          console.log("A tentar reconectar...");
          setTimeout(() => iniciarBot(), 3000);
        } else {
          console.log(
            "Sessão terminada. Será necessário emparelhar novamente."
          );
        }
      }
    });

    sock.ev.on("messages.upsert", async ({ messages, type }) => {
      if (type !== "notify") return;

      for (const msg of messages) {
        if (!msg.message || msg.key.fromMe) continue;

        const remetente = msg.key.remoteJid;
        const texto =
          msg.message.conversation ||
          msg.message.extendedTextMessage?.text ||
          "";

        if (!texto.trim()) continue;

        console.log(`Mensagem recebida de ${remetente}: ${texto}`);

        if (texto.trim().toLowerCase() === "!nano") {
          await sock.sendMessage(remetente, {
            text: "Olá! 👋 O NANO BOT está online."
          });
        }
      }
    });
  } catch (erro) {
    console.error("Erro ao iniciar o NANO BOT:", erro.message);
    process.exitCode = 1;
  }
}

iniciarBot();
          
