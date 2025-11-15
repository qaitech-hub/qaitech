const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Определяем путь к prisma CLI
const prismaPath = path.join(__dirname, '../node_modules/.bin/prisma');
const prismaCmd = process.platform === 'win32' ? `${prismaPath}.cmd` : prismaPath;

const migrationsDir = path.join(__dirname, '../prisma/migrations');
const hasMigrations = fs.existsSync(migrationsDir) && fs.readdirSync(migrationsDir).length > 0;

// Проверяем, доступен ли локальный prisma, иначе используем npx
const useLocalPrisma = fs.existsSync(prismaCmd);

if (hasMigrations) {
  console.log('Applying migrations...');
  if (useLocalPrisma) {
    execSync(`${prismaCmd} migrate deploy`, { stdio: 'inherit', cwd: path.join(__dirname, '..') });
  } else {
    execSync('npx prisma migrate deploy', { stdio: 'inherit', cwd: path.join(__dirname, '..') });
  }
} else {
  console.log('No migrations found, pushing schema...');
  if (useLocalPrisma) {
    execSync(`${prismaCmd} db push`, { stdio: 'inherit', cwd: path.join(__dirname, '..') });
  } else {
    execSync('npx prisma db push', { stdio: 'inherit', cwd: path.join(__dirname, '..') });
  }
}

console.log('Starting server...');
execSync('node server.js', { stdio: 'inherit', cwd: path.join(__dirname, '..') }); 