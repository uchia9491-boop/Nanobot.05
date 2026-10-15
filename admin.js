
require("dotenv").config();

function normalizarIdentificador(valor) {
  return String(valor || "").trim();
}

function obterAdministrador() {
  const administrador = normalizarIdentificador(
    process.env.ADMIN_WHATSAPP_ID
  );

  if (!administrador) {
    throw new Error(
      "ADMIN_WHATSAPP_ID não está configurado."
    );
  }

  return administrador;
}

function eAdministrador(remetente) {
  const administrador = obterAdministrador();
  const identificador = normalizarIdentificador(remetente);

  if (!identificador) {
    return false;
  }

  return identificador === administrador;
}

function exigirAdministrador(remetente) {
  if (!eAdministrador(remetente)) {
    const erro = new Error(
      "Acesso negado: apenas o administrador pode executar esta ação."
    );

    erro.code = "ADMIN_ACCESS_DENIED";
    throw erro;
  }

  return true;
}

module.exports = {
  obterAdministrador,
  eAdministrador,
  exigirAdministrador
};
