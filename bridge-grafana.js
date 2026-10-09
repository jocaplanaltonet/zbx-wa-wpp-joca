/**
 * ==========================================================
 * Desenvolvedor: Joca
 * Projeto: Bridge Grafana Alerting -> WhatsApp (WPPConnect)
 * ==========================================================
 */

import 'dotenv/config';
import express from 'express';
import axios from 'axios';

const app = express();

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(express.text({ type: '*/*', limit: '10mb' }));

const PORT = process.env.PORT_BRIDGE || 3005;
const WPP_BASE_URL = (process.env.WPP_BASE_URL || 'http://localhost:21465/api/plnt').replace(/\/+$/, '');
const WPP_TOKEN = (process.env.WPP_TOKEN || '$2b$10$sMn3zJy1NFPgQMmOSIoSGealQBi8MOxaEy_xojujhmoeXdOyl5qlm').replace(/['"\\]/g, '').trim();
const DESTINO_DEFAULT = process.env.GRAFANA_DESTINO || '120363428338282497@g.us';

function extrairDadosClassicCondition(valorStr) {
    const dados = {};
    if (!valorStr || typeof valorStr !== 'string') return dados;

    const matchHost = valorStr.match(/host=([^\s,}]+)/);
    if (matchHost) dados.host = matchHost[1];

    const matchItem = valorStr.match(/item=([^,}]+)/);
    if (matchItem) dados.item = matchItem[1].trim();

    const matchItemKey = valorStr.match(/item_key=([^,}]+)/);
    if (matchItemKey) dados.itemKey = matchItemKey[1].trim();

    const matchVal = valorStr.match(/value=([0-9.]+)/);
    if (matchVal) dados.valorNum = matchVal[1];

    return dados;
}

function formatarValorMetrica(itemKey, valorRaw, itemDesc) {
    if (!valorRaw) return '';
    const str = String(valorRaw);
    const parsed = extrairDadosClassicCondition(str);
    const valorEfetivo = parsed.valorNum || str;

    const chave = (itemKey || parsed.itemKey || itemDesc || '').toLowerCase();

    if (chave.includes('ifoperstatus') || chave.includes('operational status')) {
        if (valorEfetivo === '2' || str.includes('value=2')) {
            return `🔴 *DOWN (Inoperante)* [Código: 2]`;
        }
        if (valorEfetivo === '1' || str.includes('value=1')) {
            return `🟢 *UP (Operacional)* [Código: 1]`;
        }
    }

    if (chave.includes('cpu') || chave.includes('mem') || chave.includes('memory')) {
        return `⚠️ *${valorEfetivo}%* de uso`;
    }

    if (chave.includes('traffic') || chave.includes('octets') || chave.includes('bps')) {
        const valNum = parseFloat(valorEfetivo);
        if (!isNaN(valNum)) {
            if (valNum >= 1000000000) return `📊 *${(valNum / 1000000000).toFixed(2)} Gbps*`;
            if (valNum >= 1000000) return `📊 *${(valNum / 1000000).toFixed(2)} Mbps*`;
            if (valNum >= 1000) return `📊 *${(valNum / 1000).toFixed(2)} Kbps*`;
        }
        return `📊 \`${valorEfetivo}\``;
    }

    return parsed.valorNum ? `\`${parsed.valorNum}\`` : `\`${str}\``;
}

function gerarMensagensIndividuais(data) {
    if (typeof data === 'string') {
        try {
            data = JSON.parse(data);
        } catch {
            return [`🚨 *[ALERTA - GRAFANA]*\n\n${data}`];
        }
    }

    const alerts = Array.isArray(data.alerts) && data.alerts.length > 0 ? data.alerts : [data];
    const mensagens = [];

    // Nome global da regra e pasta do payload
    const pastaGlobal = data.commonLabels?.grafana_folder || data.groupLabels?.grafana_folder || '';
    let nomeGlobal = data.commonLabels?.alertname 
        || data.groupLabels?.alertname 
        || data.ruleName 
        || data.title 
        || '';

    nomeGlobal = String(nomeGlobal).replace(/\[.*?\]\s*/g, '').trim();

    for (const alert of alerts) {
        const statusIndividual = (alert.status || data.status || data.state || 'firing').toLowerCase();
        const isFiring = statusIndividual === 'firing' || statusIndividual === 'alerting';
        const iconeStatus = isFiring ? '🚨 *[ALERTA - GRAFANA]*' : '✅ *[RESOLVIDO - GRAFANA]*';

        const rawVal = alert.valueString || (alert.values ? JSON.stringify(alert.values) : '');
        const parsedClassic = extrairDadosClassicCondition(rawVal);

        const host = alert.labels?.host 
            || alert.labels?.instance 
            || alert.labels?.device 
            || parsedClassic.host;

        const item = alert.labels?.item 
            || alert.labels?.description 
            || parsedClassic.item 
            || '';

        // Ignora avaliações sem host nem métrica útil (evita mensagens vazias de nós fantasmas)
        if (!host && !item && !rawVal) {
            continue;
        }

        const pasta = alert.labels?.grafana_folder || pastaGlobal;
        let nomeRegra = alert.labels?.alertname || nomeGlobal || 'Alerta de Rede';
        nomeRegra = String(nomeRegra).replace(/\[.*?\]\s*/g, '').trim();
        const titulo = pasta ? `${nomeRegra} (${pasta})` : nomeRegra;

        let corpo = `${iconeStatus}\n\n`;
        corpo += `📌 *Regra:* ${titulo}\n`;

        const descricao = alert.annotations?.description 
            || alert.annotations?.summary 
            || data.commonAnnotations?.description 
            || data.commonAnnotations?.summary;

        if (descricao && !descricao.includes('Labels:') && !descricao.includes('Annotations:')) {
            corpo += `💬 *Descrição:* ${descricao.trim()}\n`;
        }

        corpo += `\n📋 *Item Afetado:*\n`;
        corpo += `🖥️ *Host:* \`${host || 'Desconhecido'}\`\n`;
        if (item) {
            corpo += `🔹 *Item:* ${item}\n`;
        }

        const itemKey = alert.labels?.item_key || parsedClassic.itemKey || '';
        const valorFormatado = formatarValorMetrica(itemKey, rawVal, item);
        if (valorFormatado) {
            corpo += `📊 *Valor:* ${valorFormatado}\n`;
        }

        const dashUrl = alert.dashboardURL || data.dashboardURL;
        const panelUrl = alert.panelURL || data.panelURL;

        if (dashUrl || panelUrl) {
            corpo += `\n🔗 *Acessos Rápidos:*\n`;
            if (dashUrl) {
                corpo += `📊 *Dashboard:* ${dashUrl}\n`;
            }
            if (panelUrl) {
                corpo += `📈 *Painel:* ${panelUrl}\n`;
            }
        }

        mensagens.push(corpo.trim());
    }

    // Se nenhum item continha dados válidos, descarta sem enviar lixo para o WhatsApp
    return mensagens;
}

async function enviarWpp(to, text) {
    try {
        const eGrupo = to.includes('@g.us');
        const baseUrlLimpa = WPP_BASE_URL.replace(/\/send-message$/, '').replace(/\/send-mentioned$/, '');

        let urlEndpoint;
        let payload;

        if (eGrupo) {
            let grupoId = to.split(':')[0].trim();
            if (!grupoId.endsWith('@g.us')) {
                grupoId = `${grupoId}@g.us`;
            }

            urlEndpoint = `${baseUrlLimpa}/send-mentioned`;
            payload = {
                phone: grupoId,
                message: text,
                isGroup: true,
                mentioned: []
            };
        } else {
            urlEndpoint = `${baseUrlLimpa}/send-message`;
            payload = {
                phone: to.split('@')[0].split(':')[0].trim(),
                message: text
            };
        }

        await axios.post(urlEndpoint, payload, {
            headers: {
                'Authorization': `Bearer ${WPP_TOKEN}`,
                'Content-Type': 'application/json'
            },
            timeout: 10000
        });

        console.log(`[WPP-BRIDGE] ✅ Notificação enviada para: ${to}`);
    } catch (err) {
        const status = err.response?.status || 'N/A';
        const erroMsg = err.response?.data?.message || err.message;
        console.error(`[WPP-BRIDGE] ❌ Falha no envio para ${to} | Status: ${status} | Erro: ${erroMsg}`);
    }
}

app.all(['/webhook-grafana', '/webhook', '/grafana', '/'], async (req, res) => {
    try {
        let payloadRecebido = req.body;

        if (typeof payloadRecebido === 'string' && payloadRecebido.trim().startsWith('{')) {
            try {
                payloadRecebido = JSON.parse(payloadRecebido);
            } catch {}
        }

        const destino = req.query.destino || DESTINO_DEFAULT;
        const listaMensagens = gerarMensagensIndividuais(payloadRecebido);

        res.status(200).json({ status: 'success', total: listaMensagens.length, message: 'Processado' });

        for (const msg of listaMensagens) {
            await enviarWpp(destino, msg);
            await new Promise(r => setTimeout(r, 600));
        }
    } catch (error) {
        console.error(`[GRAFANA-BRIDGE] ❌ Erro ao processar webhook:`, error.message);
        res.status(500).json({ status: 'error', message: error.message });
    }
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Bridge Grafana -> WPPConnect rodando na porta ${PORT}`);
});
