const fs = require('fs');

// Read the CSV file
const csvText = fs.readFileSync('public/sample-market-lists.csv', 'utf8');
const lines = csvText.trim().split('\n');

console.log('CSV Lines:');
lines.forEach((line, i) => console.log(`${i}: ${line}`));

// Simple CSV parser that handles quoted fields
const parseCSVLine = (line) => {
  const result = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        // Escaped quote
        current += '"';
        i++; // Skip next quote
      } else {
        // Toggle quote state
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      // Field separator
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }

  // Add the last field
  result.push(current.trim());
  return result;
};

console.log('\nParsed headers:');
const headers = parseCSVLine(lines[0]);
console.log(headers);

console.log('\nParsed first data row:');
const firstRow = parseCSVLine(lines[1]);
console.log(firstRow);

console.log('\nTesting JSON parse on filters field:');
try {
  const filters = JSON.parse(firstRow[3]);
  console.log('Parsed filters:', filters);
} catch (e) {
  console.log('JSON parse error:', e.message);
}
