import { fs, path } from '@tauri-apps/api';
import { PersistStorage } from 'zustand/middleware';

async function writeJsonFile<T = any>(filePath: string, value: T) {
  const dir = await path.dirname(filePath);
  if (!(await fs.exists(dir))) {
    await fs.createDir(dir, {
      recursive: true,
    });
  }
  await fs.writeTextFile(filePath, JSON.stringify(value, undefined, 2));
}

async function getJsonFile(filePath: string): Promise<any | null> {
  if (!(await fs.exists(filePath))) {
    return null;
  }

  const text = await fs.readTextFile(filePath);
  return JSON.parse(text);
}

async function resolveFilePath(name: string): Promise<string> {
  return await path
    .appDataDir()
    .then(async (configDir) => await path.join(configDir, `${name}.json`));
}

export function createTauriFileStorage<T>(): PersistStorage<T> | undefined {
  return {
    async getItem(name) {
      const filePath = await resolveFilePath(name);
      if (!(await fs.exists(filePath))) {
        return null;
      }

      return await getJsonFile(filePath);
    },
    async removeItem(name) {
      const filePath = await resolveFilePath(name);
      if (!(await fs.exists(filePath))) {
        return;
      }

      await fs.removeFile(filePath);
    },
    async setItem(name, value) {
      const filePath = await resolveFilePath(name);
      await writeJsonFile(filePath, value);
    },
  };
}
