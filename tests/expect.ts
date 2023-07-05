import fs from "fs";

/**
 * A collection of expect functions
 */

export function expectFilesExists(paths: string[]) {
  for (const path of paths) {
    expect(fs.existsSync(path)).toBeTruthy();
  }
}
