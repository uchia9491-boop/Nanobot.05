
# NANO BOT

Bot de WhatsApp desenvolvido em Node.js com base de dados SQLite
e suporte para leitura de comprovativos por OCR.

## Funcionalidades planeadas

- Ligacao ao WhatsApp.
- Comandos de utilizador.
- Registo de utilizadores.
- Base de dados SQLite.
- Leitura de texto em imagens de comprovativos.
- Registo de pagamentos pendentes.
- Revisao de pagamentos pelo administrador.
- Preparacao para alojamento online.

## Estrutura

- `index.js` - ponto de entrada do bot.
- `commands.js` - comandos do WhatsApp.
- `database.js` - base de dados SQLite.
- `ocr.js` - leitura de texto em imagens.
- `payments.js` - registo e revisao de pagamentos.
- `package.json` - dependencias e scripts.
- `.env.example` - modelo de configuracao.

## Requisitos

- Node.js 20 ou superior.
- npm.
- Dependencias do projeto instaladas.
- Armazenamento persistente para a base de dados e a sessao.

## Instalacao

Depois de clonar o repositorio:

```bash
npm install
```

## Execucao

```bash
npm start
```

## Configuracao

1. Configurar as variaveis de ambiente.
2. Configurar o identificador do administrador.
3. Emparelhar a conta WhatsApp.
4. Testar os comandos.
5. Verificar a persistencia da base de dados.

## Seguranca

- Nunca publicar credenciais ou dados de sessao.
- Restringir os comandos administrativos.
- Verificar pagamentos antes de aprovar comprovativos.
- Fazer copias de seguranca da base de dados.

## Estado do projeto

Em desenvolvimento. A integracao dos modulos, os testes,
a autenticacao administrativa e o alojamento ainda precisam
de ser concluidos.
