const fs = require('fs');

const content = fs.readFileSync('generate_sitemap.cjs', 'utf8');

const rawTextRegex = /const rawText = `([\s\S]*?)`;/;
const match = content.match(rawTextRegex);

if (!match) {
    console.error("rawText not found");
    process.exit(1);
}

const rawText = match[1];
const lines = rawText.split('\n');

let currentSection = '';
let sectionLines = {
    'Posts': [],
    'Páginas': [],
    'Serviços': [],
    'Dúvidas de A a Z': [],
    'Glossário': [],
    'Categorias': [],
    'Autores': [],
    'Alfabeto': []
};

for (const line of lines) {
    if (Object.keys(sectionLines).includes(line.trim())) {
        currentSection = line.trim();
        continue;
    }
    if (currentSection && line.trim()) {
        sectionLines[currentSection].push(line);
    }
}

function processLineForBasketball(line) {
    return line
        .replace(/Futebol/g, 'Basquete')
        .replace(/futebol/g, 'basquete')
        .replace(/Gols e Cartões/g, 'Pontos e Faltas')
        .replace(/Gols/g, 'Pontos')
        .replace(/gols/g, 'pontos')
        .replace(/Cartões/g, 'Faltas')
        .replace(/Copa Nony 4/g, 'Liga Nony de Basquete')
        .replace(/Copa Nony/g, 'Liga Nony')
        .replace(/Várzea/g, 'Basquete Amador')
        .replace(/Artilharia/g, 'Cestinhas')
        .replace(/Escalação/g, 'Escalação')
        .replace(/Apito/g, 'Apito')
        .replace(/Beira do Campo/g, 'Beira da Quadra')
        .replace(/Placar Ao Vivo/g, 'Placar Ao Vivo')
        .replace(/Súmula de Papel/g, 'Súmula de Papel')
        .replace(/Time/g, 'Equipe')
        .replace(/Times/g, 'Equipes');
}

let resultingRawText = '';

for (const section of Object.keys(sectionLines)) {
    resultingRawText += section + '\n';
    
    // Original Lines
    for (const line of sectionLines[section]) {
        resultingRawText += line + '\n';
    }
    
    // Basketball equivalents
    if (['Posts', 'Serviços', 'Glossário', 'Categorias'].includes(section)) {
        for (const line of sectionLines[section]) {
            let basqLine = processLineForBasketball(line);
            
            let noDateLine = basqLine.replace(/\s*\(\d{2}\/\d{2}\/\d{4}\)$/, '');
            let datePart = basqLine.match(/\s*\(\d{2}\/\d{2}\/\d{4}\)$/);
            let dateStr = datePart ? datePart[0] : '';
            
            if (basqLine === line) {
                 if (!noDateLine.toLowerCase().includes('basquete')) {
                     if (section === 'Categorias') {
                         resultingRawText += noDateLine + ' de Basquete' + '\n';
                     } else if (section === 'Glossário') {
                         resultingRawText += noDateLine + ' no Basquete' + dateStr + '\n';
                     } else {
                         resultingRawText += noDateLine + ' no Basquete' + dateStr + '\n';
                     }
                 }
            } else if (!sectionLines[section].includes(basqLine)) {
                 resultingRawText += basqLine + '\n';
            }
        }
    }
    
    resultingRawText += '\n';
}

const newContent = content.replace(rawTextRegex, "const rawText = `" + resultingRawText.trim() + "`;");
fs.writeFileSync('generate_sitemap.cjs', newContent);
console.log('generate_sitemap.cjs updated for basketball duplicates.');
