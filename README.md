# 🚀 Zabbix WhatsApp Integration - Planalto Net CGR

![Zabbix](https://img.shields.io/badge/Zabbix-7.4-blue?style=for-the-badge&logo=zabbix)
![Python](https://img.shields.io/badge/Python-3.x-yellow?style=for-the-badge&logo=python)

Este guia descreve como configurar o envio de alertas do Zabbix para o WhatsApp com gráficos e menções em grupo.

---

## 1. Instalação do WPPConnect Server
O WPPConnect transforma seu WhatsApp em uma API robusta.

\`\`\`bash
# Clone o repositório oficial
git clone [https://github.com/wppconnect-team/wppconnect-server.git](https://github.com/wppconnect-team/wppconnect-server.git)
cd wppconnect-server

# Instalação de dependências do sistema
sudo apt-get install -y libxshmfence-dev libgbm-dev wget unzip fontconfig locales gconf-service libasound2 libatk1.0-0 libc6 libcairo2 libcups2 libdbus-1-3 libexpat1 libfontconfig1 libgcc1 libgconf-2-4 libgdk-pixbuf2.0-0 libglib2.0-0 libgtk-3-0 libnspr4 libpango-1.0-0 libpangocairo-1-0-0 libstdc++6 libx11-6 libx11-xcb1 libxcb1 libxcomposite1 libxcursor1 libxdamage1 libxext6 libxfixes3 libxi6 libxrandr2 libxrender1 libxss1 libxtst6 ca-certificates fonts-liberation libappindicator1 libnss3 lsb-release xdg-utils libvips-dev

# Instale as dependências e gere a build
npm install
yarn build
\`\`\`

---

## 2. Rodando em Produção com PM2
\`\`\`bash
sudo npm install -g pm2
pm2 start dist/server.js --name \"wpp-server\"
pm2 startup
pm2 save
\`\`\`

---

## 3. Integração com Zabbix
### Importação do Media Type
Este repositório contém o arquivo: \`Whatsapp - Wpp - Png - Joca.yaml\`.
1. No Zabbix, acesse **Alerts -> Media Types**.
2. Clique no botão **Import** e selecione o arquivo.

### Instalação do Script de Alerta
\`\`\`bash
pip3 install requests
chown zabbix:zabbix /usr/lib/zabbix/alertscripts/jocawpp.py
chmod +x /usr/lib/zabbix/alertscripts/jocawpp.py
\`\`\`

---

## 4. Diferenciais do Script
* **Regex:** Captura IDs no formato \`Item ID:{ITEM.ID}\`.
* **Data:** Converte automaticamente para **DD/MM/YYYY**.
* **Menção:** Notifica automaticamente o usuário **558181581814**.

---

## 5. Monitoramento e Logs
\`\`\`bash
tail -f /tmp/zabbix_wpp_debug.log # Log do script Python
pm2 logs wpp-server             # Log do servidor WhatsApp
\`\`\`

---
**Desenvolvido por Joca - Planalto Net CGR** 🚀'''
