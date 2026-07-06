const fs = require('fs');
const path = require('path');

const srcDir = path.join('c:', 'Users', 'karth', 'OneDrive', 'Desktop', 'my habit', 'client', 'src');

function revertAny(dir) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      revertAny(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      
      let updated = content.replace(/<Record<string, unknown>>/g, '<any>');
      updated = updated.replace(/\(Record<string, unknown>\)/g, '(any)');
      updated = updated.replace(/Record<string, unknown>\[\]/g, 'any[]');
      updated = updated.replace(/:\s*Record<string, unknown>/g, ': any');
      updated = updated.replace(/:\s*unknown/g, ': any');
      
      if (content !== updated) {
        fs.writeFileSync(fullPath, updated, 'utf8');
        console.log(`Reverted ${file}`);
      }
    }
  });
}

revertAny(srcDir);
console.log("Done");
