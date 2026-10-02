import { execSync } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

const __dirname = dirname(fileURLToPath(import.meta.url));

try {
  console.log('Building project...');
  
  console.log('Step 0: Installing frontend dependencies...');
  execSync('npm ci --legacy-peer-deps', { 
    cwd: join(__dirname, 'frontend'), 
    stdio: 'inherit' 
  });
  
  console.log('Step 1: Generating Prisma Client...');
  execSync('npm run prisma:generate', { 
    cwd: join(__dirname, 'backend'), 
    stdio: 'inherit' 
  });

  console.log('Step 2: Building frontend with Vite...');
  execSync('npm run build', { 
    cwd: join(__dirname, 'frontend'), 
    stdio: 'inherit' 
  });

  // Check if index.html was created
  const indexPath = join(__dirname, 'frontend/dist/index.html');
  if (fs.existsSync(indexPath)) {
    console.log('SUCCESS: index.html found at:', indexPath);
    const distFiles = fs.readdirSync(join(__dirname, 'frontend/dist'));
    console.log('Files in dist:', distFiles);
  } else {
    console.error('ERROR: index.html was NOT created at:', indexPath);
    process.exit(1);
  }

  console.log('Build complete!');
  process.exit(0);
} catch (error) {
  console.error('Build failed:', error.message);
  process.exit(1);
}
