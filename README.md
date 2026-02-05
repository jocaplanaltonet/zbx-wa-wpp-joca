# Zabbix WhatsApp Integration - zbx-wa-wpp-joca

<p align="left">
  <img src="https://camo.githubusercontent.com/db193e65958c02b2ea3376aded7769fe269dd57f4544aefa9f5d322b5153977d/68747470733a2f2f696d672e736869656c64732e696f2f62616467652f5a61626269782d372e342d626c75653f7374796c653d666f722d7468652d6261646765266c6f676f3d7a6162626978" alt="Zabbix 7.4">
  <img src="https://camo.githubusercontent.com/b982c853c8b58177c36e2cfb1959ac36129ed04c140c3c77586aa8077a33004f/68747470733a2f2f696d672e736869656c64732e696f2f62616467652f507974686f6e2d332e782d79656c6c6f773f7374796c653d666f722d7468652d6261646765266c6f676f3d707974686f6e" alt="Python 3.x">
</p>

Este guia descreve como configurar o envio de alertas do Zabbix para o WhatsApp com graficos e mencoes em grupo.

---

## 1. Requisitos do Sistema

### A. WPPConnect-Server
O bot depende de uma instancia ativa do WPPConnect-Server.
* Creditos: Projeto baseado na API do [WPPConnect Team](https://github.com/wppconnect-team).
* Documentacao PM2: [wppconnect.io/docs/pm2](https://wppconnect.io/pt-BR/docs/projects/wppserver/pm2).
```bash
pm2 save
pm2 log wppconnect-server
```

### B. Ambiente Python 3
O script requer Python 3 e a biblioteca requests ja deve os ter instalados.

```bash
sudo apt update
sudo apt install python3 python3-pip -y
pip3 install requests
```

---

## 2. Configuracao do Script (jocawpp.py)

Copie o arquivo jocawpp.py.exemple para /usr/lib/zabbix/alertscripts/jocawpp.py e edite as configuracoes iniciais.

```bash
cp jocawpp.py.exemple /usr/lib/zabbix/alertscripts/jocawpp.py
```
nano /usr/lib/zabbix/alertscripts/jocawpp.py

```python
CONFIG = {
    "WPP_URL": '[http://127.0.0.1:21465/api/SESSAO_ZABBIX](http://127.0.0.1:21465/api/SESSAO_ZABBIX)',
    "WPP_TOKEN": '$2b$10$sMn3zJy1NFPgQMmOSIoSGealQBi8MOxaEy_xojujhmoeXdOyl5qlm', 
    "ZABBIX_URL": '[http://127.0.0.1/zabbix](http://127.0.0.1/zabbix)',
    "ZABBIX_USER": 'Admin',
    "ZABBIX_PASS": 'zabbix',
    "LOG_FILE": '/tmp/zabbix_wpp_debug.log',
    "MENSAO": "558112345678" 
}
```

---

## 3. Permissoes de Sistema

```bash
chown zabbix:zabbix /usr/lib/zabbix/alertscripts/jocawpp.py
chmod +x /usr/lib/zabbix/alertscripts/jocawpp.py

touch /tmp/zabbix_wpp_debug.log
chown zabbix:zabbix /tmp/zabbix_wpp_debug.log
chmod 664 /tmp/zabbix_wpp_debug.log
```

---

## 4. Testes de Validacao

### A. Teste via Python
```bash
python3 /usr/lib/zabbix/alertscripts/jocawpp.py "Teste de Alerta" "Zabbix" "ID_DO_GRUPO@g.us"
```

### B. Teste via cURL (Individual)
```bash
curl -X POST '[http://127.0.0.1:21465/api/SESSAO_ZABBIX/send-message](http://127.0.0.1:21465/api/SESSAO_ZABBIX/send-message)' \
-H 'Authorization: Bearer $TOKEN' \
-H 'Content-Type: application/json' \
-d '{"phone": "558188887777", "message": "Teste Individual"}'
```

---

## 5. Identificando Grupos (JID)

1. Identifique o ID que termina com @g.us usando seu script get_groups.py.
2. Utilize este ID no campo Enviar para dentro do Zabbix.

---

## 6. Configuracao no Painel Zabbix

### A. Importacao do Template
1. Va em Alertas -> Tipos de Midia -> Importar.

### B. Parametros do Script
1. {ALERT.MESSAGE}
2. {ALERT.SUBJECT}
3. {ALERT.SENDTO}

---

## 7. Monitoramento e Logs

```bash
tail -f /tmp/zabbix_wpp_debug.log
```
