const fs = require('node:fs/promises');
const path = require('node:path');
const { storageDir } = require('../config/upload');

function getFilePath(storageName) {
  return path.join(storageDir, storageName);
}

async function remove(storageName) {
  try {
    await fs.unlink(getFilePath(storageName));
  } catch (error) {
    if (error.code !== 'ENOENT') {
      throw error;
    }
  }
}

module.exports = { getFilePath, remove };