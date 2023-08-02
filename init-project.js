const fs = require('fs');
const path = require('path');

const projectFolderPath = path.basename(__dirname);
const moduleId = 'module-id';
const replacement = projectFolderPath;

function replaceInFile(filePath) {
  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
      console.error(`Error reading file: ${filePath}`);
      return;
    }

    const updatedContent = data.replace(new RegExp(moduleId, 'g'), replacement);

    fs.writeFile(filePath, updatedContent, 'utf8', (err) => {
      if (err) {
        console.error(`Error writing to file: ${filePath}`);
        return;
      }

      console.log(`Replaced "${moduleId}" with "${replacement}" in ${filePath}`);
    });
  });
}

const filesToReplaceIn = [
  'languages/en.json',
  'scripts/main.js',
  'module.json',
  // Add more file paths as needed
];

filesToReplaceIn.forEach((filePath) => {
  const fullPath = path.join(__dirname, filePath);
  replaceInFile(fullPath);
});
