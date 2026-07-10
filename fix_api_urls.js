const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, 'client/src/api');
const targetString = "const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';";
const replacementString = "import { API_BASE_URL } from './config';\nconst API_URL = API_BASE_URL;";

const files = fs.readdirSync(dir);
for (const file of files) {
  if (file.endsWith('.ts') && file !== 'config.ts' && file !== 'fetchHelper.ts') {
    const filePath = path.join(dir, file);
    let content = fs.readFileSync(filePath, 'utf8');
    if (content.includes(targetString)) {
      content = content.replace(targetString, replacementString);
      fs.writeFileSync(filePath, content);
      console.log(`Updated ${file}`);
    }
  }
}
console.log('Done.');
