const fs = require('fs-extra');
const path = require('path');
const axios = require('axios');

const SELIC_API_URL = 'https://api.bcb.gov.br/dados/serie/bcdata.sgs.11/dados';
const OUTPUT_DIR = path.resolve(__dirname, '../../data/indices');
const OUTPUT_FILE = path.join(OUTPUT_DIR, 'selic-diaria.json');

async function fetchWithRetry(url, retries = 3, delay = 1000) {
    for (let i = 0; i < retries; i++) {
        try {
            return await axios.get(url);
        } catch (error) {
            if (i < retries - 1) {
                await new Promise(res => setTimeout(res, delay));
            } else {
                throw error;
            }
        }
    }
}

async function fetchAndSaveSelicDiaria() {
    try {
        let selicData = {};

        // Carregar dados existentes se houver
        if (await fs.exists(OUTPUT_FILE)) {
            selicData = await fs.readJson(OUTPUT_FILE);
        }

        const startDate = new Date('1986-06-04');
        const endDate = new Date();
        let currentDate = new Date(startDate);

        while (currentDate <= endDate) {
            const nextDate = new Date(currentDate);
            nextDate.setFullYear(nextDate.getFullYear() + 10);
            const finalDate = nextDate > endDate ? endDate : nextDate;

            const dataInicial = `${currentDate.getDate().toString().padStart(2, '0')}/${(currentDate.getMonth() + 1).toString().padStart(2, '0')}/${currentDate.getFullYear()}`;
            const dataFinal = `${finalDate.getDate().toString().padStart(2, '0')}/${(finalDate.getMonth() + 1).toString().padStart(2, '0')}/${finalDate.getFullYear()}`;

            const url = `${SELIC_API_URL}?formato=json&dataInicial=${dataInicial}&dataFinal=${dataFinal}`;
            console.log(`Buscando dados da SELIC diária de ${dataInicial} a ${dataFinal}`);
            const response = await fetchWithRetry(url);
            const data = response.data;

            if (Array.isArray(data)) {
                data.forEach(item => {
                    const [day, month, year] = item.data.split('/');
                    const key = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
                    const value = parseFloat(item.valor);
                    if (!isNaN(value)) {
                        selicData[key] = value;
                    }
                });
            }

            currentDate = new Date(finalDate);
            currentDate.setDate(currentDate.getDate() + 1);
        }

        // Buscar os últimos 20 para garantir a integridade
        console.log('Buscando os últimos 20 dados da SELIC diária para garantir a integridade');
        const last20Url = `${SELIC_API_URL}/ultimos/20?formato=json`;
        const last20Response = await fetchWithRetry(last20Url);
        const last20Data = last20Response.data;

        if (Array.isArray(last20Data)) {
            last20Data.forEach(item => {
                const [day, month, year] = item.data.split('/');
                const key = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
                const value = parseFloat(item.valor);
                if (!isNaN(value)) {
                    selicData[key] = value;
                }
            });
        }

        await fs.ensureDir(OUTPUT_DIR);
        await fs.writeJson(OUTPUT_FILE, selicData, { spaces: 2 });

        console.log('Dados da SELIC diária salvos com sucesso em ' + path.basename(OUTPUT_FILE));
    } catch (error) {
        console.error('Erro ao buscar ou salvar dados da SELIC diária:', error.message);
        process.exit(1);
    }
}

fetchAndSaveSelicDiaria();
