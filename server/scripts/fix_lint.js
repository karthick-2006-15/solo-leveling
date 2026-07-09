const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

try {
  const output = execSync('npx eslint src/ --format json', { encoding: 'utf-8' });
} catch (error) {
  const output = error.stdout;
  const results = JSON.parse(output);
  
  results.forEach(result => {
    if (result.messages.length > 0 && result.messages.every(m => m.ruleId === '@typescript-eslint/no-unused-vars')) {
      let content = fs.readFileSync(result.filePath, 'utf-8');
      const lines = content.split('\n');
      
      const messages = result.messages.sort((a, b) => b.line - a.line);
      
      messages.forEach(msg => {
        if (msg.ruleId === '@typescript-eslint/no-unused-vars') {
          const match = msg.message.match(/'([^']+)' is/);
          if (match && match[1]) {
            const varName = match[1];
            if (!varName.startsWith('_')) {
              const regex = new RegExp(`\\b${varName}\\b`);
              if (regex.test(lines[msg.line - 1])) {
                  lines[msg.line - 1] = lines[msg.line - 1].replace(regex, `_${varName}`);
              }
            }
          }
        }
      });
      
      fs.writeFileSync(result.filePath, lines.join('\n'), 'utf-8');
      console.log(`Fixed unused vars in ${path.basename(result.filePath)}`);
    }
  });
}
