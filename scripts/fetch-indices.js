const fs = require('fs-extra');
const path = require('path');
const axios = require('axios');

// API do Banco Central do Brasil para a taxa SELIC acumulada no mês
const SELIC_API_URL = 'https://api.bcb.gov.br/dados/serie/bcdata.sgs.4390/dados?formato=json';

// --- Placeholders para outros índices (serão substituídos por suas próprias APIs no futuro) ---
const IPCA = { "2023-01": 0.53, "2023-02": 0.84, "2023-03": 0.71, "2023-04": 0.61, "2023-05": 0.23, "2023-06": -0.08, "2023-07": 0.12, "2023-08": 0.23, "2023-09": 0.26, "2023-10": 0.24, "2023-11": 0.28, "2023-12": 0.56, "2024-01": 0.42, "2024-02": 0.83, "2024-03": 0.16, "2024-04": 0.38, "2024-05": 0.46, "2024-06": 0.67, "2024-07": 0.25, "2024-08": 0.3, "2024-09": 0.35, "2024-10": 0.4, "2024-11": 0.45, "2024-12": 0.5, "2025-01": 0.55, "2025-02": 0.5, "2025-03": 0.45, "2025-04": 0.4, "2025-05": 0.35, "2025-06": 0.3, "2025-07": 0.3, "2025-08": 0.32, "2025-09": 0.35, "2025-10": 0.38, "2025-11": 0.4, "2025-12": 0.42 };
const INPC = { "2023-01": 0.46, "2023-02": 0.77, "2023-03": 0.64, "2023-04": 0.53, "2023-05": 0.36, "2023-06": -0.1, "2023-07": -0.09, "2023-08": 0.2, "2023-09": 0.11, "2023-10": 0.12, "2023-11": 0.1, "2023-12": 0.55, "2024-01": 0.57, "2024-02": 0.81, "2024-03": 0.19, "2024-04": 0.37, "2024-05": 0.46, "2024-06": 0.71, "2024-07": 0.22, "2024-08": 0.28, "2024-09": 0.33, "2024-10": 0.38, "2024-11": 0.43, "2024-12": 0.48, "2025-01": 0.53, "2025-02": 0.48, "2025-03": 0.43, "2025-04": 0.38, "2025-05": 0.33, "2025-06": 0.28, "2025-07": 0.28, "2025-08": 0.3, "2025-09": 0.33, "2025-10": 0.36, "2025-11": 0.38, "2025-12": 0.4 };


/**
 * Busca e transforma os dados da SELIC da API do BCB.
 * @returns {Promise<Record<string, number>>} Um objeto com chaves "YYYY-MM" e valores numéricos.
 */
async function fetchSelic() {
    console.log(`Buscando dados da SELIC de: ${SELIC_API_URL}`);
    try {
        const response = await axios.get(SELIC_API_URL);
        const data = response.data;

        if (!Array.isArray(data)) {
            throw new Error('A resposta da API não é um array.');
        }

        return data.reduce((acc, item) => {
            const [day, month, year] = item.data.split('/');
            const key = `${year}-${month.padStart(2, '0')}`;
            const value = parseFloat(item.valor);
            if (!isNaN(value)) {
                acc[key] = value;
            }
            return acc;
        }, {});
    } catch (error) {
        console.error('Erro ao buscar dados da SELIC:', error.message);
        throw error;
    }
}


async function main() {
    console.log('Iniciando atualização dos índices econômicos...');
    
    try {
        const selicData = await fetchSelic();
        
        // Mantemos os outros índices como placeholders, mas usamos os dados da SELIC buscados da API.
        const consolidatedIndices = { 
            SELIC: selicData, 
            IPCA, 
            INPC 
        };
        
        const metadata = { lastUpdatedAt: new Date().toISOString() };

        const dataDir = path.resolve(__dirname, '../data');
        await fs.ensureDir(dataDir);

        await fs.writeJson(path.join(dataDir, 'indices.json'), consolidatedIndices, { spaces: 2 });
        await fs.writeJson(path.join(dataDir, 'metadata.json'), metadata, { spaces: 2 });
        
        console.log('Índices e metadados atualizados com sucesso.');

    } catch (error) {
        console.error('Falha no processo de atualização de índices. O processo será encerrado com erro.');
        process.exit(1);
    }
}

main();
