const fs = require('fs-extra');
const path = require('path');

const OUTPUT_DIR = path.resolve(__dirname, '../../data/indices');
const OUTPUT_FILE = path.join(OUTPUT_DIR, 'inpc.json');

// Placeholder com dados estáticos. No futuro, pode ser substituído por uma chamada de API.
const INPC_DATA = { "2023-01": 0.46, "2023-02": 0.77, "2023-03": 0.64, "2023-04": 0.53, "2023-05": 0.36, "2023-06": -0.1, "2023-07": -0.09, "2023-08": 0.2, "2023-09": 0.11, "2023-10": 0.12, "2023-11": 0.1, "2023-12": 0.55, "2024-01": 0.57, "2024-02": 0.81, "2024-03": 0.19, "2024-04": 0.37, "2024-05": 0.46, "2024-06": 0.71, "2024-07": 0.22, "2024-08": 0.28, "2024-09": 0.33, "2024-10": 0.38, "2024-11": 0.43, "2024-12": 0.48, "2025-01": 0.53, "2025-02": 0.48, "2025-03": 0.43, "2025-04": 0.38, "2025-05": 0.33, "2025-06": 0.28, "2025-07": 0.28, "2025-08": 0.3, "2025-09": 0.33, "2025-10": 0.36, "2025-11": 0.38, "2025-12": 0.4 };

async function saveInpc() {
    try {
        await fs.ensureDir(OUTPUT_DIR);
        await fs.writeJson(OUTPUT_FILE, INPC_DATA, { spaces: 2 });
        console.log('Dados do INPC salvos com sucesso em ' + path.basename(OUTPUT_FILE));
    } catch (error) {
        console.error('Erro ao salvar dados do INPC:', error.message);
        process.exit(1);
    }
}

saveInpc();
