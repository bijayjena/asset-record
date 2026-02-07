
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distDir = path.join(__dirname, 'dist');
const redirectsFile = path.join(distDir, '_redirects');

const redirectsContent = '/* /index.html 200';

if (fs.existsSync(distDir)) {
    fs.writeFileSync(redirectsFile, redirectsContent);
    console.log('_redirects file generated successfully in dist folder.');
} else {
    console.error('dist directory not found. Make sure the build script has run before generating redirects.');
    process.exit(1);
}
