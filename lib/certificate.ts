import fs from 'fs';
import path from 'path';
import { Agent } from 'https';

export function getHttpsConfig() {
  const certPath = path.join(process.cwd(), 'certificates');
  
  try {
    return {
      key: fs.readFileSync(path.join(certPath, 'localhost-key.pem')),
      cert: fs.readFileSync(path.join(certPath, 'localhost.pem')),
    };
  } catch (error) {
    console.warn('SSL certificates not found. Using default configuration.');
    return null;
  }
}

export function getHttpsAgent() {
  const certConfig = getHttpsConfig();
  
  if (!certConfig) return null;
  
  return new Agent({
    rejectUnauthorized: process.env.NODE_ENV === 'production',
    key: certConfig.key,
    cert: certConfig.cert,
  });
}
