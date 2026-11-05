const fs = require('fs');
const path = require('path');
let sharp;
try {
  sharp = require('sharp');
} catch (e) {
  console.error('Module "sharp" is required. Run: npm install sharp');
  process.exit(1);
}

const imagesDir = path.join(__dirname, '..', 'public', 'images');

async function convertAndRename() {
  if (!fs.existsSync(imagesDir)) {
    console.error('No existe el directorio:', imagesDir);
    process.exit(1);
  }

  const files = fs.readdirSync(imagesDir);
  for (const file of files) {
    const fullPath = path.join(imagesDir, file);
    const stat = fs.statSync(fullPath);
    if (!stat.isFile()) continue;

    // Rename files with spaces to use hyphens
    if (file.includes(' ')) {
      const newName = file.replace(/\s+/g, '-');
      const newPath = path.join(imagesDir, newName);
      try {
        fs.renameSync(fullPath, newPath);
        console.log(`Renombrado: "${file}" -> "${newName}"`);
      } catch (err) {
        console.error('Error renombrando', file, err);
      }
    }
  }

  // Refresh file list after renames
  const updatedFiles = fs.readdirSync(imagesDir);
  for (const file of updatedFiles) {
    const ext = path.extname(file).toLowerCase();
    const base = path.basename(file, ext);
    const fullPath = path.join(imagesDir, file);

    if (ext === '.heic' || ext === '.heif') {
      const outFile = path.join(imagesDir, `${base}.jpg`);
      try {
        await sharp(fullPath)
          .jpeg({ quality: 90 })
          .toFile(outFile);
        console.log(`Convertido: ${file} -> ${base}.jpg`);
        // borrar el original HEIC
        fs.unlinkSync(fullPath);
      } catch (err) {
        console.error('Error convirtiendo', file, err.message || err);
      }
    }
  }

  console.log('Procesamiento de imágenes completado.');
}

convertAndRename().catch(err => {
  console.error('Error inesperado:', err);
  process.exit(1);
});
