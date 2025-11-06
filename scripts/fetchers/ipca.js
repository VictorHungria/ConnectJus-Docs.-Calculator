const fs = require('fs-extra');
const path = require('path');

const OUTPUT_DIR = path.resolve(__dirname, '../../data/indices');
const OUTPUT_FILE = path.join(OUTPUT_DIR, 'ipca.json');

// Placeholder com dados estáticos. No futuro, pode ser substituído por uma chamada de API.
const IPCA_DATA = { "2023-01": 0.53, "2023-02": 0.84, "2023-03": 0.71, "2023-04": 0.61, "2023-05": 0.23, "2023-06": -0.08, "2023-07": 0.12, "2023-08": 0.23, "2023-09": 0.26, "2023-10": 0.24, "2023-11": 0.28, "2023-12": 0.56, "2024-01": 0.42, "2024-02": 0.83, "2024-03": 0.16, "2024-04": 0.38, "2024-05": 0.46, "2024-06": 0.67, "2024-07": 0.25, "2024-08": 0.3, "2024-09": 0.35, "2024-10": 0.4, "2024-11": 0.45, "2024-12": 0.5, "2025-01": 0.55, "2025-02": 0.5, "2025-03": 0.45, "2025-04": 0.4, "2025-05": 0.35, "2025-06": 0.3, "2025-07": 0.3, "2025-08": 0.32, "2025-09": 0.35, "2025-10": 0.38, "2025-11": 0.4, "2025-12": 0.42 };

async function saveIpca() {
    try {
        await fs.ensureDir(OUTPUT_DIR);
        await fs.writeJson(OUTPUT_FILE, IPCA_DATA, { spaces: 2 });
        console.log('Dados do IPCA salvos com sucesso em ' + path.basename(OUTPUT_FILE));
    } catch (error) {
        console.error('Erro ao salvar dados do IPCA:', error.message);
        process.exit(1);
    }
}

saveIpca();
