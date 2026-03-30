const fs = require('fs');

const sql = fs.readFileSync('players_all.sql', 'utf8');
const lines = sql.split('\n');
const insertHeader = lines[0];
const playerLines = lines.slice(1, -1); // remove header and empty/semicolon line

const BATCH_SIZE = 184; // 8 teams * 23 players

for (let i = 0; i < 6; i++) {
  const start = i * BATCH_SIZE;
  const end = (i + 1) * BATCH_SIZE;
  const batchPlayers = playerLines.slice(start, end);
  
  if (batchPlayers.length === 0) break;
  
  // Clean up commas and add semicolon to the last one
  let batchSql = insertHeader + '\n';
  batchPlayers.forEach((line, index) => {
    let cleanedLine = line.trim();
    if (index === batchPlayers.length - 1) {
      cleanedLine = cleanedLine.replace(/,$/, ';');
    }
    batchSql += cleanedLine + '\n';
  });
  
  fs.writeFileSync(`players_batch_${i + 1}.sql`, batchSql);
}
console.log('Split into 6 batches!');
