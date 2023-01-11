import { Provider } from ".";
import { promises as fsAsync, constants as fsConstants } from "fs";
import fs from "fs";
import { IndexSpecification } from "../types";

export class File implements Provider {
  private readonly path: string;

  constructor(path: string) {
    this.path = path;
  }

  private getIndexSpecFile(index: string): string {
    return `${this.path}/${index}.specs.json`;
  }

  private getIndexDataFile(index: string): string {
    return `${this.path}/${index}.json`;
  }

  async listIndices(pattern?: string): Promise<string[]> {
    const data = await fsAsync.readdir(this.path);
    return data
      .filter((file: string) => file.match(/\.specs\.json$/) && file.match(pattern as string))
      .map((file: string) => file.replace(/\.specs\.json$/, ""));
  }

  async getIndex(index: string): Promise<IndexSpecification> {
    const data = await fsAsync.readFile(this.getIndexSpecFile(index));
    return JSON.parse(data.toString());
  }

  async createIndex(
    index: string,
    specification: IndexSpecification
  ): Promise<void> {
    await fsAsync.writeFile(this.getIndexSpecFile(index), JSON.stringify(specification));
    await fsAsync.writeFile(this.getIndexDataFile(index), ""); // Create empty file for data
  }

  async readData(index: string): Promise<any> {
    if (!fileExists(this.getIndexDataFile(index))) {
      return [];
    }

    const content = await fsAsync.readFile(this.getIndexDataFile(index));

    const data = content
      .toString()
      .replace(/\r\n/g, '\n') // Normalize line endings Windows -> Unix
      .split('\n')
      .map((line: string) =>
        line
          .trim()) // Remove trailing spaces
      .filter((line: string) => line.length > 0) // Remove empty lines
      .map((line: string) => JSON.parse(line));

    return {
      documents: data,
      total: data.length,
    }
  }

  async writeData(index: string, data: any): Promise<number> {
    let count = 0;

    for (const line of data) {
      await fsAsync.appendFile(this.getIndexDataFile(index), `${JSON.stringify(line)}\n`);
      count++;
    }

    return count;
  }

  async clear(): Promise<void> {
    const files = await fsAsync.readdir(this.path);

    for (const file of files) {
      await fsAsync.unlink(`${this.path}/${file}`);
    }
  }
}

export function fileExists(filePath: string): boolean {
  try {
    fs.accessSync(filePath, fsConstants.F_OK,);
    return true;
  } catch (error) {
    return false;
  }
}
