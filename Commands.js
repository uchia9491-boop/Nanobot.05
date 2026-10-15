
const {
  registarUtilizador,
  procurarUtilizador,
  listarPagamentosPendentes
} = require("./database");

const PREFIXO = "!";

const COMANDOS_PUBLICOS = {
  "!nano": "Mostrar informações do NANO BOT",
  "!menu": "Mostrar os comandos disponíveis",
  "!perfil": "Mostrar o teu perfil",
  "!pagamento": "Consultar o estado dos pagamentos"
};

function normalizarTexto(texto) {
  return String(texto || "").trim();
}

function obterMenu() {
  return [
    "🤖 *NANO BOT — MENU*",
    "",
    "!nano - Informações do bot",
    "!menu - Mostrar este menu",
    "!perfil - Consultar o teu perfil",
    "!pagamento - Consultar os teus pagamentos",
    "",
    "Escreve um comando para continuar."
  ].join("\n");
}

async function processarComando({
  sock,
  mensagem,
  whatsappId,
  nome
}) {
  const texto = normalizarTexto(mensagem);
  if (!texto.startsWith(PREFIXO)) return false;

  const partes = texto.split(/\s+/);
  const comando = partes[0].toLowerCase();

  registarUtilizador(whatsappId, nome);

  switch (comando) {
    case "!nano":
      await sock.sendMessage(whatsappId, {
        text: "🤖 NANO BOT\n\nO sistema está preparado para os próximos módulos."
      });
      return true;

    case "!menu":
      await sock.sendMessage(whatsappId, {
        text: obterMenu()
      });
      return true;

    case "!perfil": {
      const utilizador = procurarUtilizador(whatsappId);

      await sock.sendMessage(whatsappId, {
        text: [
          "👤 *O TEU PERFIL*",
          "",
          `Nome: ${utilizador?.name || nome || "Não informado"}`,
          `WhatsApp: ${whatsappId}`,
          `Registado: ${utilizador?.created_at || "A confirmar"}`
        ].join("\n")
      });
      return true;
    }

    case "!pagamento":
      await sock.sendMessage(whatsappId, {
        text: "💳 Para consultar um pagamento, envia o comprovativo ao administrador. A integração de pagamentos será configurada num próximo módulo."
      });
      return true;

    default:
      await sock.sendMessage(whatsappId, {
        text: "❓ Comando desconhecido. Escreve !menu para veres os comandos disponíveis."
      });
      return true;
  }
}

function obterComandosPublicos() {
  return { ...COMANDOS_PUBLICOS };
}

function obterPagamentosPendentes() {
  return listarPagamentosPendentes();
}

module.exports = {
  processarComando,
  obterMenu,
  obterComandosPublicos,
  obterPagamentosPendentes
};
