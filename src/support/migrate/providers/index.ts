import { IndexSpecification } from "../types";

export * from "./elasticsearch";
export * from "./file";

export interface Provider {
  listIndices(pattern?: string): Promise<string[]>;
  getIndex(index: string): Promise<IndexSpecification>;
  createIndex(index: string, specification: IndexSpecification): Promise<void>;
  readData(index: string, ...args: any): Promise<any>;
  writeData(index: string, docs: any): Promise<number>;
  clear(): Promise<void>;
}

export function isURL(str: string): boolean {
  try {
    new URL(str);
    return true;
  } catch (error) {
    return false;
  }
}
