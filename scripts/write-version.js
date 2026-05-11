import fs from 'fs';
import path from 'path';

const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
const version = String(process.env.APP_VERSION || pkg.version || '1.0.0').replace(/^v/i, '');
const repo = String(process.env.UPDATE_REPO || process.env.GITHUB_REPOSITORY || 'alter-editing/AlterEditingMobile');
const out = path.join('src', 'app-version.js');
fs.writeFileSync(out, `export const APP_VERSION = ${JSON.stringify(version)};\nexport const UPDATE_REPO = ${JSON.stringify(repo)};\n`, 'utf8');
console.log(`App version: ${version}`);
console.log(`Update repo: ${repo}`);
