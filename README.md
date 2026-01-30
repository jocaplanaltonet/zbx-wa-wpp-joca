cat << 'EOF' > README.md
# 🚀 Zabbix WhatsApp Integration - Planalto Net CGR

Este guia descreve como configurar o envio de alertas do Zabbix para o WhatsApp com gráficos e menções em grupo.

---

## 1. INSTALACAO DO WPPCONNECT SERVER
O WPPConnect transforma seu WhatsApp em uma API robusta.

Passos para instalar:
1. Clone o repositorio: git clone [https://github.com/wppconnect-team/wppconnect-server.git](https://github.com/wppconnect-team/wppconnect-server.git)
2. Entre na pasta: cd wppconnect-server
3. Instale dependencias do sistema: sudo apt-get install -y libxshmfence-dev libgbm-dev wget unzip fontconfig locales gconf-service libasound2 libatk1.0-0 libc6 libcairo2 libcups2 libdbus-1-3 libexpat1 libfontconfig1 libgcc1 libgconf-2-4 libgdk-pixbuf2.0-0 libglib2.0-0 libgtk-3-0 libnspr4 libpango-1.0-0 libpangocairo-1-0-0 libstdc++6 libx11-6 libx11-xcb1 libxcb1 libxcomposite1 libxcursor1 libxdamage1 libxext6 libxfixes3 libxi6 libxrandr2 libxrender1 libxss1 libxtst6 ca-certificates fonts-liberation libappindicator1 libnss3 lsb-release xdg-utils libvips-dev
4. Instale o NPM e BUILD:
   npm install
   yarn build

---

## 2. RODANDO EM PRODUCAO COM PM2
Para manter o servidor sempre online:
sudo npm install -g pm2
pm2 start dist/server.js --name "wpp-server"
pm2 startup
pm2 save

---

## 3. INTEGRACAO COM ZABBIX 7.4
- Importe o arquivo YAML deste repositorio em Alerts -> Media Types.
- Coloque o script jocawpp.py em: /usr/lib/zabbix/alertscripts/
- Comando de permissao:
  chown zabbix:zabbix /usr/lib/zabbix/alertscripts/jocawpp.py
  chmod +x /usr/lib/zabbix/alertscripts/jocawpp.py

---

## 4. DIFERENCIAIS DO SCRIPT JOCA
- Regex: Captura IDs no formato Item ID:{ITEM.ID}.
- Data: Converte automaticamente para DD/MM/YYYY.
- Mencao: Marca o tecnico 558181581814 nos grupos.

---

## 5. MONITORAMENTO DE LOGS
- Log do Script: tail -f /tmp/zabbix_wpp_debug.log
- Log do WPPConnect: pm2 logs wpp-server

---
Desenvolvido por Joca - Planalto Net CGR 🚀
EOF
