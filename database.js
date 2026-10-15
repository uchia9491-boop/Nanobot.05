
const Database = require("better-sqlite3");
const path = require("path");
const fs = require("fs");

const dataDir = path.join(__dirname, "data");

if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, "nano-bot.sqlite");
const db = new Database(dbPath);

db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    whatsapp_id TEXT NOT NULL UNIQUE,
    name TEXT,
    is_admin INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS payments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    whatsapp_id TEXT NOT NULL,
    amount REAL,
    reference TEXT,
    payment_date TEXT,
    receipt_path TEXT,
    ocr_text TEXT,
    status TEXT NOT NULL DEFAULT 'pending'
      CHECK (status IN ('pending', 'approved', 'rejected')),
    reviewed_by TEXT,
    reviewed_at TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );

  CREATE INDEX IF NOT EXISTS idx_payments_status
  ON payments(status);

  CREATE INDEX IF NOT EXISTS idx_payments_whatsapp
  ON payments(whatsapp_id);
`);

function registarUtilizador(whatsappId, nome = null) {
  const stmt = db.prepare(`
    INSERT INTO users (whatsapp_id, name)
    VALUES (?, ?)
    ON CONFLICT(whatsapp_id)
    DO UPDATE SET name = COALESCE(excluded.name, users.name)
  `);

  return stmt.run(whatsappId, nome);
}

function procurarUtilizador(whatsappId) {
  return db.prepare(`
    SELECT * FROM users WHERE whatsapp_id = ?
  `).get(whatsappId);
}

function criarPagamento({
  whatsappId,
  amount = null,
  reference = null,
  paymentDate = null,
  receiptPath = null,
  ocrText = null
}) {
  const stmt = db.prepare(`
    INSERT INTO payments (
      whatsapp_id,
      amount,
      reference,
      payment_date,
      receipt_path,
      ocr_text
    )
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  return stmt.run(
    whatsappId,
    amount,
    reference,
    paymentDate,
    receiptPath,
    ocrText
  );
}

function listarPagamentosPendentes() {
  return db.prepare(`
    SELECT * FROM payments
    WHERE status = 'pending'
    ORDER BY created_at ASC
  `).all();
}

function reverPagamento(id, decisao, administrador) {
  if (!["approved", "rejected"].includes(decisao)) {
    throw new Error("Decisão inválida.");
  }

  return db.prepare(`
    UPDATE payments
    SET status = ?,
        reviewed_by = ?,
        reviewed_at = CURRENT_TIMESTAMP
    WHERE id = ? AND status = 'pending'
  `).run(decisao, administrador, id);
}

function fecharBaseDados() {
  if (db.open) {
    db.close();
  }
}

module.exports = {
  db,
  registarUtilizador,
  procurarUtilizador,
  criarPagamento,
  listarPagamentosPendentes,
  reverPagamento,
  fecharBaseDados
};
