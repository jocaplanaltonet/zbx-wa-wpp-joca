🚀 Zabbix WhatsApp WPP Integration
Este guia descreve como configurar o envio de alertas do Zabbix para o WhatsApp com gráficos e menções em grupo, utilizando o motor WPPConnect.

1. Instalação do WPPConnect Server
O WPPConnect transforma seu WhatsApp em uma API robusta.

Bash
# Clone o repositório oficial
git clone [https://github.com/wppconnect-team/wppconnect-server.git](https://github.com/wppconnect-team/wppconnect-server.git)
cd wppconnect-server

# Instalação de dependências do Puppeteer (Chrome para Linux)
sudo apt-get install -y libxshmfence-dev libgbm-dev wget unzip fontconfig locales gconf-service libasound2 libatk1.0-0 libc6 libcairo2 libcups2 libdbus-1-3 libexpat1 libfontconfig1 libgcc1 libgconf-2-4 libgdk-pixbuf2.0-0 libglib2.0-0 libgtk-3-0 libnspr4 libpango-1.0-0 libpangocairo-1-0-0 libstdc++6 libx11-6 libx11-xcb1 libxcb1 libxcomposite1 libxcursor1 libxdamage1 libxext6 libxfixes3 libxi6 libxrandr2 libxrender1 libxss1 libxtst6 ca-certificates fonts-liberation libappindicator1 libnss3 lsb-release xdg-utils libvips-dev

# Instale as dependências e gere a build
npm install
yarn build
2. Rodando em Produção com PM2
Bash
sudo npm install -g pm2
pm2 start dist/server.js --name "wpp-server"
pm2 startup
pm2 save
3. Criação da Sessão via CURL
Passo A: Gerar Token

Bash
curl -X POST '[http://127.0.0.1:21465/api/session/secret-key-token](http://127.0.0.1:21465/api/session/secret-key-token)' \
-H 'Content-Type: application/json' \
-d '{ "secretKey": "SUA_SECRET_KEY_AQUI" }'
Passo B: Iniciar Sessão e QR Code

Bash
curl -X POST '[http://127.0.0.1:21465/api/session/start-session](http://127.0.0.1:21465/api/session/start-session)' \
-H 'Authorization: Bearer SEU_TOKEN_AQUI' \
-H 'Content-Type: application/json'
4. Integração com Zabbix
Importação do Media Type
Este repositório contém o arquivo: Whatsapp - Wpp - Png - Joca.yaml.

No Zabbix, acesse Alerts -> Media Types.

Clique no botão Import no canto superior direito.

Selecione o arquivo .yaml e confirme.

Isso criará o Media Type com os parâmetros: {ALERT.MESSAGE}, {ALERT.SUBJECT} e {ALERT.SENDTO}.

Instalação do Script de Alerta
Bash
pip3 install requests
chown zabbix:zabbix /usr/lib/zabbix/alertscripts/jocawpp.py
chmod +x /usr/lib/zabbix/alertscripts/jocawpp.py
5. O Script Estável (jocawpp.py)
O script realiza a extração inteligente do Item ID, inverte a data para o padrão brasileiro (DD/MM/YYYY) e realiza menções automáticas.

Regex: Captura IDs no formato Item ID:{ITEM.ID}.

Data: Converte YYYY.MM.DD para DD/MM/YYYY.

Menção: Notifica automaticamente o usuário 558181581814.

6. Monitoramento e Logs
Bash
tail -f /tmp/zabbix_wpp_debug.log # Log do script Python
pm2 logs wpp-server             # Log do servidor WhatsApp
Desenvolvido por Joca - Planalto Net CGR 🚀
