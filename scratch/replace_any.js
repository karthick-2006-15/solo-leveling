const fs = require('fs');
const path = require('path');

const srcDir = path.join('c:', 'Users', 'karth', 'OneDrive', 'Desktop', 'my habit', 'client', 'src');

function replaceAny(dir) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      replaceAny(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      
      let updated = content.replace(/<any>/g, '<Record<string, unknown>>');
      updated = updated.replace(/\(any\)/g, '(Record<string, unknown>)');
      updated = updated.replace(/any\[\]/g, 'Record<string, unknown>[]');
      updated = updated.replace(/:\s*any(?=[,\)\s;=])/g, ': Record<string, unknown>');
      
      // Fix unused 'err' variables by changing to catch (_) or removing
      updated = updated.replace(/catch \(err\)/g, 'catch');
      updated = updated.replace(/catch \(e\)/g, 'catch');
      
      if (content !== updated) {
        fs.writeFileSync(fullPath, updated, 'utf8');
        console.log(`Updated ${file}`);
      }
    }
  });
}

replaceAny(srcDir);
console.log("Done");
