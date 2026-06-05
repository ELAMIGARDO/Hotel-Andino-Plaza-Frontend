const fs = require('fs');
const path = require('path');

const dir = '../src/app/views';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.tsx'));

for (const file of files) {
  const filePath = path.join(dir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  content = content.replace(/import \{ Sidebar \} from "\.\.\/components\/Sidebar";\n/g, '');
  fs.writeFileSync(filePath, content);
}
