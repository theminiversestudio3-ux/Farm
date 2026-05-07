import fs from 'fs';

const path = 'src/data/crops.ts';
let content = fs.readFileSync(path, 'utf8');

// Replace standard emojis with "Sprout"
content = content.replace(/emoji: ".*?"/g, 'iconName: "Sprout"');
content = content.replace(/emoji: string;/g, 'iconName: string;');

fs.writeFileSync(path, content);
console.log('Done mapping emojis to icons');
