const fs = require('fs');
const file = '../src/app/views/UIKitView.tsx';
let content = fs.readFileSync(file, 'utf8');

const replacements = [
  { regex: /(?<!dark:)bg-white/g, replacement: 'bg-white dark:bg-slate-800' },
  { regex: /(?<!dark:)bg-slate-50(?!\/)/g, replacement: 'bg-slate-50 dark:bg-slate-900' },
  { regex: /(?<!dark:)text-slate-900/g, replacement: 'text-slate-900 dark:text-slate-100' },
  { regex: /(?<!dark:)text-slate-800/g, replacement: 'text-slate-800 dark:text-slate-100' },
  { regex: /(?<!dark:)text-slate-700/g, replacement: 'text-slate-700 dark:text-slate-300' },
  { regex: /(?<!dark:)text-slate-600/g, replacement: 'text-slate-600 dark:text-slate-400' },
  { regex: /(?<!dark:)text-slate-500/g, replacement: 'text-slate-500 dark:text-slate-400' },
  { regex: /(?<!dark:)text-slate-400/g, replacement: 'text-slate-400 dark:text-slate-500' },
  { regex: /(?<!dark:)border-slate-200/g, replacement: 'border-slate-200 dark:border-slate-700' },
  { regex: /(?<!dark:)border-slate-100/g, replacement: 'border-slate-100 dark:border-slate-700/50' },
  { regex: /(?<!dark:)bg-slate-100/g, replacement: 'bg-slate-100 dark:bg-slate-700' },
];

replacements.forEach(({ regex, replacement }) => {
  content = content.replace(regex, replacement);
});

fs.writeFileSync(file, content, 'utf8');
