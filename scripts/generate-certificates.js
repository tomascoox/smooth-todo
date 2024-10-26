import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const certPath = path.join(__dirname, '..', 'certificates');

function generateCertificates() {
  // Create certificates directory if it doesn't exist
  if (!fs.existsSync(certPath)) {
    fs.mkdirSync(certPath);
  }

  try {
    // Generate certificates using mkcert
    execSync('mkcert -install');
    execSync(`mkcert -key-file ${path.join(certPath, 'localhost-key.pem')} -cert-file ${path.join(certPath, 'localhost.pem')} localhost 127.0.0.1`);
    
    console.log('SSL certificates generated successfully');
  } catch (error) {
    console.error('Error generating certificates:', error);
    console.log('Please install mkcert first: https://github.com/FiloSottile/mkcert#installation');
    process.exit(1);
  }
}

generateCertificates();
