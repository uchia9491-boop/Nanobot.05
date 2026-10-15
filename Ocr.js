
const Tesseract = require("tesseract.js");
const fs = require("fs");
const path = require("path");

async function extrairTexto(imagem) {
  if (!imagem || typeof imagem !== "string") {
    throw new Error("Indica o caminho da imagem.");
  }

  const caminho = path.resolve(imagem);

  if (!fs.existsSync(caminho)) {
    throw new Error("A imagem do comprovativo não foi encontrada.");
  }

  const resultado = await Tesseract.recognize(
    caminho,
    "por+eng",
    {
      logger: (info) => {
        if (info.status === "recognizing text") {
          console.log(
            `OCR: ${Math.round((info.progress || 0) * 100)}%`
          );
        }
      }
    }
  );

  const texto = resultado.data.text || "";

  return {
    texto,
    dados: extrairDados(texto),
    confianca: resultado.data.confidence ?? null
  };
}

function extrairDados(texto) {
  const linhas = String(texto || "")
    .split(/\r?\n/)
    .map((linha) => linha.trim())
    .filter(Boolean);

  const textoCompleto = linhas.join("\n");

  const valorEncontrado = textoCompleto.match(
    /(?:MZN|MT|MZN\.?|USD|ZAR)?\s*([0-9][0-9., ]*)\s*(?:MZN|MT|USD|ZAR)\b/i
  );

  const referenciaEncontrada = textoCompleto.match(
    /(?:refer[eê]ncia|reference|transa[cç][aã]o|transaction|id)\s*[:#\-]?\s*([A-Z0-9\-\/]{4,})/i
  );

  const dataEncontrada = textoCompleto.match(
    /\b(\d{1,2}[\/.-]\d{1,2}[\/.-]\d{2,4}|\d{4}[\/.-]\d{1,2}[\/.-]\d{1,2})\b/
  );

  return {
    valorTexto: valorEncontrado
      ? valorEncontrado[0].trim()
      : null,
    referencia: referenciaEncontrada
      ? referenciaEncontrada[1].trim()
      : null,
    data: dataEncontrada
      ? dataEncontrada[1]
      : null,
    linhas
  };
}

module.exports = {
  extrairTexto,
  extrairDados
};
