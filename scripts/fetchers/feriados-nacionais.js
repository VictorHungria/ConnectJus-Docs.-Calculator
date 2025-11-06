const fs = require('fs-extra');
const path = require('path');

const OUTPUT_DIR = path.resolve(__dirname, '../../data/holidays');
const OUTPUT_FILE = path.join(OUTPUT_DIR, 'feriados-nacionais.json');

// Fonte: https://www.gov.br/pt-br/noticias/financas-impostos-e-gestao-publica/2023/12/governo-divulga-feriados-nacionais-e-pontos-facultativos-de-2024
// Feriados Nacionais fixos + datas móveis para 2024 e 2025
// Chave: YYYY-MM-DD, Valor: Nome do feriado
const NATIONAL_HOLIDAYS = {
  // Datas Fixas (usando '*' para o ano)
  "*-01-01": "Confraternização Universal",
  "*-04-21": "Tiradentes",
  "*-05-01": "Dia do Trabalho",
  "*-09-07": "Independência do Brasil",
  "*-10-12": "Nossa Senhora Aparecida",
  "*-11-02": "Finados",
  "*-11-15": "Proclamação da República",
  "*-11-20": "Dia Nacional de Zumbi e da Consciência Negra",
  "*-12-25": "Natal",

  // 2024 (Datas móveis)
  "2024-03-29": "Paixão de Cristo",
  
  // 2025 (Datas móveis)
  "2025-04-18": "Paixão de Cristo",

  // 2026 (Datas móveis)
  "2026-04-03": "Paixão de Cristo",
};

/**
 * Expande os feriados com padrão de ano ('*') para um intervalo de anos.
 * @param {number} startYear O ano inicial.
 * @param {number} endYear O ano final.
 * @returns {Record<string, string>} Objeto com datas expandidas.
 */
function expandHolidays(startYear, endYear) {
    const expanded = {};
    for (let year = startYear; year <= endYear; year++) {
        for (const [datePattern, name] of Object.entries(NATIONAL_HOLIDAYS)) {
            if (datePattern.startsWith('*')) {
                const date = `${year}${datePattern.substring(1)}`;
                expanded[date] = name;
            } else {
                 if (datePattern.startsWith(String(year))) {
                    expanded[datePattern] = name;
                }
            }
        }
    }
    return expanded;
}

async function saveHolidays() {
    try {
        const currentYear = new Date().getFullYear();
        // Gera para um intervalo de anos (2 anos para trás, 3 para frente)
        const holidayData = expandHolidays(currentYear - 2, currentYear + 3); 
        
        await fs.ensureDir(OUTPUT_DIR);
        await fs.writeJson(OUTPUT_FILE, holidayData, { spaces: 2 });
        
        console.log('Dados de feriados nacionais salvos com sucesso em ' + path.basename(OUTPUT_FILE));
    } catch (error) {
        console.error('Erro ao salvar dados de feriados:', error.message);
        process.exit(1);
    }
}

saveHolidays();
