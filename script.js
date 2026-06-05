const fs = require('fs');
const path = require('path');

const directoryPath = path.join(__dirname, '../src/app/views');
const componentsPath = path.join(__dirname, '../src/app/components');

function replaceInFile(filePath) {
  if (!fs.existsSync(filePath)) return;
  let content = fs.readFileSync(filePath, 'utf8');
  
  // A mapping of tailwind utility classes to their dark counterparts
  const replacements = [
    { regex: /(?<!dark:)bg-white/g, replacement: 'bg-white dark:bg-slate-800' },
    { regex: /(?<!dark:)bg-slate-50/g, replacement: 'bg-slate-50 dark:bg-slate-900' },
    { regex: /(?<!dark:)text-slate-900/g, replacement: 'text-slate-900 dark:text-slate-100' },
    { regex: /(?<!dark:)text-slate-800/g, replacement: 'text-slate-800 dark:text-slate-100' },
    { regex: /(?<!dark:)text-slate-700/g, replacement: 'text-slate-700 dark:text-slate-300' },
    { regex: /(?<!dark:)text-slate-600/g, replacement: 'text-slate-600 dark:text-slate-400' },
    { regex: /(?<!dark:)text-slate-500/g, replacement: 'text-slate-500 dark:text-slate-400' },
    { regex: /(?<!dark:)text-slate-400/g, replacement: 'text-slate-400 dark:text-slate-500' },
    { regex: /(?<!dark:)border-slate-200/g, replacement: 'border-slate-200 dark:border-slate-700' },
    { regex: /(?<!dark:)border-slate-100/g, replacement: 'border-slate-100 dark:border-slate-700/50' },
    { regex: /(?<!dark:)border-slate-50/g, replacement: 'border-slate-50 dark:border-slate-800' },
    { regex: /(?<!dark:)bg-slate-100/g, replacement: 'bg-slate-100 dark:bg-slate-800' },
    { regex: /(?<!dark:)bg-slate-200/g, replacement: 'bg-slate-200 dark:bg-slate-700' },
  ];

  let original = content;
  replacements.forEach(({ regex, replacement }) => {
    content = content.replace(regex, replacement);
  });

  if (original !== content) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated ${filePath}`);
  }
}

function walkDir(dir) {
  if (!fs.existsSync(dir)) return;
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      walkDir(fullPath);
    } else if (fullPath.endsWith('.tsx')) {
      replaceInFile(fullPath);
    }
  }
}

walkDir(directoryPath);
walkDir(componentsPath);
