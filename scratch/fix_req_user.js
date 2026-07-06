const fs = require('fs');
const path = require('path');

const srcDir = path.join('c:', 'Users', 'karth', 'OneDrive', 'Desktop', 'my habit', 'server', 'src');

function fixNonNullAsserts(dir) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      fixNonNullAsserts(fullPath);
    } else if (fullPath.endsWith('.ts')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      
      let updated = content.replace(/req\.user\?\.id!/g, 'req.user!.id');
      
      if (content !== updated) {
        fs.writeFileSync(fullPath, updated, 'utf8');
        console.log(`Fixed optional chain assertions in ${file}`);
      }
    }
  });
}

fixNonNullAsserts(srcDir);
console.log("Done");
