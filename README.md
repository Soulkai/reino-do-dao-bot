# Reino do Dao Bot

Bot de WhatsApp para um RPG textual Wuxia/Xianxia com persistência global, cultivo, exploração, profissões, economia e seitas criadas por jogadores.

## Stack atual

- Node.js 18+
- `whatsapp-web.js`
- `qrcode-terminal`
- SQLite com `better-sqlite3`
- sessão local persistida no disco

## Estado do projeto

Este repositório já possui uma base inicial jogável do MVP:

- conexão por QR Code
- sessão persistente do WhatsApp
- migrations automáticas do SQLite
- seed inicial de conteúdo
- registro de personagem
- perfil e status
- inventário
- cultivo das trilhas `corpo`, `espirito` e `alma`
- exploração inicial
- loja do bot
- compra de itens básicos
- log estruturado em `game_logs`

## Comandos implementados agora

- `/ajuda`
- `/registrar Nome Sexo`
- `/perfil`
- `/status`
- `/inventario`
- `/cultivar corpo|espirito|alma`
- `/explorar`
- `/loja`
- `/comprar CODIGO [quantidade]`

## Estrutura atual

```text
src/
  index.js
  config/
    index.js
  application/
    commandParser.js
    commandRegistry.js
    handlers.js
    services.js
  transport/
    whatsapp/
      client.js
      messageRouter.js
  infra/
    db/
      connection.js
      runMigrations.js
      migrations/
```

## Como rodar localmente

1. Copie o arquivo de ambiente:

```bash
cp .env.example .env
```

2. Instale as dependências:

```bash
npm install
```

3. Inicie o bot:

```bash
npm start
```

4. Escaneie o QR Code no terminal usando o WhatsApp.

## Banco de dados

As migrations rodam automaticamente ao subir o bot. O banco SQLite será criado em:

```text
./data/game.sqlite
```

## Próximos passos do roadmap

- `/romper`
- mercado global
- encontros entre jogadores
- `/conversar`
- `/trocar`
- profissões de alquimia e forja
- seitas
- combate PvE/PvP expandido
- leilão global

## Observação importante

Este projeto usa `whatsapp-web.js`, que é uma biblioteca não oficial baseada no WhatsApp Web. Para um bot local com QR Code isso atende bem ao MVP, mas esse caminho não é o oficial da Meta.
