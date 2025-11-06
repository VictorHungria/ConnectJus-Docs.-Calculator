const fs = require('fs-extra');
const path = require('path');
const { exec } = require('child_process');
const util = require('util');

const execPromise = util.promisify(exec);

const fetchersDir = path.resolve(__dirname, 'fetchers');
const dataDir = path.resolve(__dirname, '../data');
const indicesDir = path.join(dataDir, 'indices');

async function runFetcher(scriptPath) {
    try {
        console.log(`Executando fetcher: ${path.basename(scriptPath)}...`);
        const { stdout, stderr } = await execPromise(`node "${scriptPath}"`);
        if (stderr) {
            console.error(`Erro no fetcher ${path.basename(scriptPath)}:\n`, stderr);
            return false;
        }
        console.log(stdout.trim());
        return true;
    } catch (error) {
        console.error(`Falha ao executar o fetcher ${path.basename(scriptPath)}:`, error);
        return false;
    }
}

async function createManifest() {
    console.log('Criando manifest.json...');
    const manifest = {
        indices: [],
    };

    if (await fs.pathExists(indicesDir)) {
        const indexFiles = await fs.readdir(indicesDir);
        manifest.indices = indexFiles.filter(f => f.endsWith('.json'));
    }

    await fs.writeJson(path.join(dataDir, 'manifest.json'), manifest, { spaces: 2 });
    console.log('manifest.json criado com sucesso.');
}

async function updateMetadata() {
    console.log('Atualizando metadata.json...');
    const metadata = { lastUpdatedAt: new Date().toISOString() };
    await fs.writeJson(path.join(dataDir, 'metadata.json'), metadata, { spaces: 2 });
    console.log('metadata.json atualizado com sucesso.');
}

async function main() {
    console.log('Iniciando orquestração da atualização de dados...');

    // Garante que os diretórios de dados existam
    await fs.ensureDir(indicesDir);

    const excludedFetchers = new Set(['feriados-nacionais.js', 'inpc.js']);
    const fetcherFiles = await fs.readdir(fetchersDir);
    const fetcherPromises = fetcherFiles
        .filter(file => file.endsWith('.js') && !excludedFetchers.has(file))
        .map(file => runFetcher(path.join(fetchersDir, file)));

    const results = await Promise.all(fetcherPromises);

    if (results.some(res => !res)) {
        console.warn('Um ou mais fetchers falharam. O manifest será gerado com os dados que foram obtidos com sucesso.');
    } else {
        console.log('Todos os fetchers foram executados com sucesso.');
    }

    await createManifest();
    await updateMetadata();

    console.log('Processo de atualização de dados concluído.');
}

main().catch(error => {
    console.error('Ocorreu um erro crítico no orquestrador:', error);
    process.exit(1);
});