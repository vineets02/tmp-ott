const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'client', 'src');

const walkSync = (dir, filelist = []) => {
  fs.readdirSync(dir).forEach(file => {
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isDirectory()) {
      filelist = walkSync(filePath, filelist);
    } else {
      if (filePath.endsWith('.js')) {
        filelist.push(filePath);
      }
    }
  });
  return filelist;
};

const files = walkSync(srcDir);

files.forEach(filePath => {
  if (filePath.includes('config.js')) return;
  
  let content = fs.readFileSync(filePath, 'utf-8');
  let changed = false;

  if (content.includes('http://localhost:8080')) {
    // Replace hardcoded URLs
    content = content.replace(/http:\/\/localhost:8080/g, '${config.API_BASE_URL}');
    
    // Convert strings to template literals if they aren't already
    content = content.replace(/['"](\$\{config\.API_BASE_URL\}[^'"]*)['"]/g, '`$1`');

    // Add import if missing
    if (!content.includes('import config from')) {
      const relativePath = path.relative(path.dirname(filePath), path.join(srcDir, 'config'));
      const importPath = relativePath.startsWith('.') ? relativePath.replace(/\\/g, '/') : './' + relativePath.replace(/\\/g, '/');
      content = `import config from "${importPath}";\n` + content;
    }
    changed = true;
  }

  if (changed) {
    fs.writeFileSync(filePath, content, 'utf-8');
    console.log(`Fixed URLs in: ${filePath}`);
  }
});
