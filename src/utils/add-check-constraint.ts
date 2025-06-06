import * as fs from 'fs';
import * as path from 'path';

// Path to the constraints file (relative to the root of the project, inside /prisma)
const CONSTRAINTS_FILE_PATH = path.join(
  __dirname,
  '../../..',
  'prisma',
  'check-constraint.sql',
);

// Get the latest migration file
export function getLatestMigrationFile(): string | null {
  const migrationsDir = path.join(
    __dirname,
    '../../..',
    'prisma',
    'migrations',
  );

  if (!fs.existsSync(migrationsDir)) {
    console.error('Migrations directory not found.');
    return null;
  }

  const migrationFolders = fs
    .readdirSync(migrationsDir)
    .filter((folder) =>
      fs.statSync(path.join(migrationsDir, folder)).isDirectory(),
    );

  const latestMigrationFolder = migrationFolders
    .map((folder) => ({
      name: folder,
      time: fs.statSync(path.join(migrationsDir, folder)).mtime.getTime(),
    }))
    .sort((a, b) => b.time - a.time)[0];

  return latestMigrationFolder
    ? path.join(migrationsDir, latestMigrationFolder.name, 'migration.sql')
    : null;
}

// Load constraints from the constraints file
export function loadConstraints(): string[] {
  if (!fs.existsSync(CONSTRAINTS_FILE_PATH)) {
    console.error('Constraints file not found.');
    return [];
  }

  return fs
    .readFileSync(CONSTRAINTS_FILE_PATH, 'utf8')
    .split('-- @@@')
    .map((line) => line.trim())
    .filter((line) => line.length > 0);
}

// Add each CHECK constraint to the latest migration file
function addCheckConstraints(): void {
  const migrationFile = getLatestMigrationFile();
  if (!migrationFile) {
    console.log('No migration file found.');
    return;
  }

  const migrationSQL = fs.readFileSync(migrationFile, 'utf8');
  const constraints = loadConstraints();

  if (constraints.length === 0) {
    console.log('No constraints to add.');
    return;
  }

  let updatedSQL = migrationSQL;

  constraints.forEach((constraint) => {
    if (!migrationSQL.includes(constraint)) {
      updatedSQL += '\n-- AddCustomScript' + `\n${constraint}\n`;
      console.log(`CHECK constraint added: ${constraint}`);
    } else {
      console.log(`CHECK constraint already exists: \n${constraint}`);
    }
  });

  fs.writeFileSync(migrationFile, updatedSQL, 'utf8');
}

addCheckConstraints();
