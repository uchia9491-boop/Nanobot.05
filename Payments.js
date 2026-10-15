
const path = require("path");
const fs = require("fs");

const {
  criarPagamento,
  listarPagamentosPendentes,
  reverPagamento
} = require("./database");

const { extrairTexto } = require("./ocr");

const RECEIPTS_DIR = path.join(__dirname, "data", "receipts");

function prepararPastaComprovativos() {
  fs.mkdirSync(RECEIPTS_DIR, { recursive: true });
}

async function registarComprovativo({
  whatsappId,
  caminhoImagem
}) {
  if (!whatsappId) {
    throw new Error("O WhatsApp do utilizador é obrigatório.");
  }

  prepararPastaComprovativos();

  const resultadoOCR = await extrairTexto(caminhoImagem);
  const dados = resultadoOCR.dados;

  const pagamento = criarPagamento({
    whatsappId,
    amount: null,
    reference: dados.referencia,
    paymentDate: dados.data,
    receiptPath: path.resolve(caminhoImagem),
    ocrText: resultadoOCR.texto
  });

  return {
    id: pagamento.lastInsertRowid,
    estado: "pending",
    textoExtraido: resultadoOCR.texto,
    dadosExtraidos: dados,
    confiancaOCR: resultadoOCR.confianca,
    mensagem:
      "Comprovativo registado. Aguarda a revisão do administrador."
  };
}

function obterPendentes() {
  return listarPagamentosPendentes();
}

function aprovarPagamento(id, administrador) {
  if (!administrador) {
    throw new Error("É necessário identificar o administrador.");
  }

  const resultado = reverPagamento(
    Number(id),
    "approved",
    administrador
  );

  if (resultado.changes === 0) {
    throw new Error(
      "Pagamento inexistente ou já analisado."
    );
  }

  return {
    id: Number(id),
    estado: "approved",
    administrador
  };
}

function rejeitarPagamento(id, administrador) {
  if (!administrador) {
    throw new Error("É necessário identificar o administrador.");
  }

  const resultado = reverPagamento(
    Number(id),
    "rejected",
    administrador
  );

  if (resultado.changes === 0) {
    throw new Error(
      "Pagamento inexistente ou já analisado."
    );
  }

  return {
    id: Number(id),
    estado: "rejected",
    administrador
  };
}

module.exports = {
  registarComprovativo,
  obterPendentes,
  aprovarPagamento,
  rejeitarPagamento
};
