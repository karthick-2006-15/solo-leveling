const fs = require('fs');
const path = require('path');

const srcDir = path.join('c:', 'Users', 'karth', 'OneDrive', 'Desktop', 'my habit', 'client', 'src');

function revertAnyAll(dir) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      revertAnyAll(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let updated = content;
      
      // Fix all possible remains of Record<string, unknown>
      updated = updated.replace(/Record<string,\s*unknown>/g, 'any');
      // Fix catch (error: unknown)
      updated = updated.replace(/catch\s*\(\s*(\w+)\s*:\s*unknown\s*\)/g, 'catch ($1: any)');
      // Fix (error as unknown) -> (error as any)
      updated = updated.replace(/as\s*unknown/g, 'as any');
      
      if (content !== updated) {
        fs.writeFileSync(fullPath, updated, 'utf8');
        console.log(`Force reverted ${file}`);
      }
    }
  });
}

revertAnyAll(srcDir);
console.log("Done force revert");
