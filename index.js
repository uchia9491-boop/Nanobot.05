
require("dotenv").config();

const pino = require("pino");
const {
  processarComando
} = require("./commands");

const {
  eAdministrador
} = require("./admin");

const logger = pino({ level: "silent" });

async function iniciarBot() {
  console.log("================================");
  console.log("          NANO BOT");
  console.log("================================");

  try {
    const {
      default: makeWASocket,
      useMultiFileAuthState,
      DisconnectReason
    } = await import("@whiskeysockets/baileys");

    const { state, saveCreds } = await useMultiFileAuthState(
      process.env.SESSION_DIR || "auth_info"
    );

    const sock = makeWASocket({
      auth: state,
      logger,
      printQRInTerminal: false,
      browser: ["NANO BOT", "Chrome", "1.0.0"]
    });

    sock.ev.on("creds.update", saveCreds);

    if (!state.creds.registered) {
      const telefone = String(
        process.env.PHONE_NUMBER || ""
      ).replace(/\D/g, "");

      if (!telefone) {
        console.log(
          "Configura PHONE_NUMBER no servidor para pedir o codigo de emparelhamento."
        );
      } else {
        try {
          const codigo = await sock.requestPairingCode(
            telefone
          );

          console.log(
            "CODIGO DE EMPARELHAMENTO:", codigo
          );
          console.log(
            "Introduz o codigo no WhatsApp do teu telemovel."
          );
        } catch (erro) {
          console.error(
            "Nao foi possivel gerar o codigo:",
            erro.message
          );
        }
      }
    }

    sock.ev.on("connection.update", (update) => {
      const { connection, lastDisconnect } = update;

      if (connection === "open") {
        console.log("NANO BOT conectado ao WhatsApp!");
      }

      if (connection === "close") {
        const codigo =
          lastDisconnect?.error?.output?.statusCode;

        console.log("Ligacao encerrada:", codigo);

        if (codigo !== DisconnectReason.loggedOut) {
          console.log(
            "A tentar restabelecer a ligacao..."
          );

          setTimeout(() => {
            iniciarBot();
          }, 5000);
        } else {
          console.log(
            "Sessao terminada. Emparelha novamente."
          );
        }
      }
    });

    sock.ev.on("messages.upsert", async ({ messages, type }) => {
      if (type !== "notify") return;

      for (const msg of messages) {
        if (!msg.message || msg.key.fromMe) continue;

        const destinatario = msg.key.remoteJid;

        if (!destinatario ||
            destinatario === "status@broadcast") {
          continue;
        }

        // Nesta fase, processamos apenas conversas privadas.
        if (destinatario.endsWith("@g.us")) continue;

        const conteudo = msg.message;
        const texto =
          conteudo.conversation ||
          conteudo.extendedTextMessage?.text ||
          conteudo.imageMessage?.caption ||
          conteudo.videoMessage?.caption ||
          "";

        if (!texto.trim()) continue;

        const remetente =
          msg.key.participant || destinatario;

        const nome = msg.pushName || null;

        try {
          if (eAdministrador(remetente)) {
            console.log("Mensagem do administrador.");
          }

          await processarComando({
            sock,
            mensagem: texto,
            whatsappId: destinatario,
            nome
          });
        } catch (erro) {
          console.error(
            "Erro ao processar mensagem:",
            erro.message
          );
        }
      }
    });

  } catch (erro) {
    console.error(
      "Erro ao iniciar o NANO BOT:",
      erro.message
    );
    process.exitCode = 1;
  }
}

iniciarBot();
