// clipboard FIFO — stores clipboard data for batch processing
// Append clipboard text from each match here, then run process.js
const fs = require('fs');
const data = fs.readFileSync(0, 'utf8'); // stdin
// Just echo back to verify
console.log(data.substring(0, 200));
