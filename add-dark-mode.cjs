const fs = require('fs');
const path = require('path');

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf-8');
  
  // Add dark variants to common classes
  const replacements = {
    'bg-white': 'bg-white dark:bg-slate-900',
    'bg-gray-50': 'bg-gray-50 dark:bg-slate-800',
    'bg-gray-100': 'bg-gray-100 dark:bg-slate-800/50',
    'bg-gray-200': 'bg-gray-200 dark:bg-slate-700',
    'text-gray-900': 'text-gray-900 dark:text-white',
    'text-gray-800': 'text-gray-800 dark:text-gray-100',
    'text-gray-700': 'text-gray-700 dark:text-gray-200',
    'text-gray-600': 'text-gray-600 dark:text-gray-300',
    'text-gray-500': 'text-gray-500 dark:text-gray-400',
    'text-gray-400': 'text-gray-400 dark:text-gray-500',
    'border-gray-50': 'border-gray-50 dark:border-slate-800',
    'border-gray-100': 'border-gray-100 dark:border-slate-700',
    'border-gray-200': 'border-gray-200 dark:border-slate-600',
  };

  let modified = content;
  for (const [search, replace] of Object.entries(replacements)) {
    // Look for word boundary, but ensure we don't accidentally match something already having dark: variant
    // We also make sure we only replace it within classNames by assuming the code is well-formatted.
    const regex = new RegExp(`(?<!dark:)\\b${search}\\b(?!\\s+dark:)`, 'g');
    modified = modified.replace(regex, replace);
  }

  // Quick deduplication in case of overlapping replacements from previous runs
  for (const [search, replace] of Object.entries(replacements)) {
      modified = modified.replace(new RegExp(`${replace} dark:[^\\s"']+`, 'g'), replace);
  }

  if (modified !== content) {
    fs.writeFileSync(filePath, modified);
    console.log(`Updated ${filePath}`);
  }
}

function walkDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      walkDir(fullPath);
    } else if (fullPath.endsWith('.tsx')) {
      processFile(fullPath);
    }
  }
}

walkDir(path.join(__dirname, 'src'));
