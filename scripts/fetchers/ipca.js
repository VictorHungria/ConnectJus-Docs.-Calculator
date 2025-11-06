const fs = require('fs-extra');
const path = require('path');
const axios = require('axios');

const IPCA_API_URL = 'https://api.bcb.gov.br/dados/serie/bcdata.sgs.10844/dados?formato=json';
const OUTPUT_DIR = path.resolve(__dirname, '../../data/indices');
const OUTPUT_FILE = path.join(OUTPUT_DIR, 'ipca.json');

async function fetchAndSaveIpca() {
    try {
        const response = await axios.get(IPCA_API_URL);
        const data = response.data;

        if (!Array.isArray(data)) {
            throw new Error('A resposta da API do IPCA não é um array.');
        }

        const ipcaData = data.reduce((acc, item) => {
            const [day, month, year] = item.data.split('/');
            const key = `${year}-${month.padStart(2, '0')}`;
            const value = parseFloat(item.valor);
            if (!isNaN(value)) {
                acc[key] = value;
            }
            return acc;
        }, {});

        await fs.ensureDir(OUTPUT_DIR);
        await fs.writeJson(OUTPUT_FILE, ipcaData, { spaces: 2 });
        
        console.log('Dados do IPCA salvos com sucesso em ' + path.basename(OUTPUT_FILE));
    } catch (error) {
        console.error('Erro ao buscar ou salvar dados do IPCA:', error.message);
        process.exit(1);
    }
}

fetchAndSaveIpca();
