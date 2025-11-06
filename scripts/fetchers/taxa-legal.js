const fs = require('fs-extra');
const path = require('path');
const axios = require('axios');

const TAXA_LEGAL_API_URL = 'https://api.bcb.gov.br/dados/serie/bcdata.sgs.29543/dados?formato=json';
const OUTPUT_DIR = path.resolve(__dirname, '../../data/indices');
const OUTPUT_FILE = path.join(OUTPUT_DIR, 'taxa-legal.json');

async function fetchAndSaveTaxaLegal() {
    try {
        const response = await axios.get(TAXA_LEGAL_API_URL);
        const data = response.data;

        if (!Array.isArray(data)) {
            throw new Error('A resposta da API da Taxa Legal não é um array.');
        }

        const taxaLegalData = data.reduce((acc, item) => {
            const [day, month, year] = item.data.split('/');
            const key = `${year}-${month.padStart(2, '0')}`;
            const value = parseFloat(item.valor);
            if (!isNaN(value)) {
                acc[key] = value;
            }
            return acc;
        }, {});

        await fs.ensureDir(OUTPUT_DIR);
        await fs.writeJson(OUTPUT_FILE, taxaLegalData, { spaces: 2 });
        
        console.log('Dados da Taxa Legal salvos com sucesso em ' + path.basename(OUTPUT_FILE));
    } catch (error) {
        console.error('Erro ao buscar ou salvar dados da Taxa Legal:', error.message);
        process.exit(1);
    }
}

fetchAndSaveTaxaLegal();
