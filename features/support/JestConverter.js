const { createWriteStream } = require("fs");
const { Inflector } = require("kuzzle");

class JestConverter {
  constructor () {
    this.currentFile = null;
    this.currentScenario = null;
  }

  hookBefore(cucumberFile, scenario, tags = []) {

    if (this.currentFile && this.currentScenario !== scenario) {
      this.writeScenarioEnd();
      this.currentScenario = scenario;
      if (this.currentFile === cucumberFile) {
        this.writeScenarioBeginning(tags);
      }
    }

    if (this.currentFile !== cucumberFile) {
      if (this.currentFile) {
        this.writeFileEnd();
        this.close();
      }

      this.currentScenario = scenario;
      this.currentFile = cucumberFile;
      this.file = createWriteStream(`tests/scenarios/migrated/${this.getFileName()}.test.ts`, { encoding: 'utf-8'});
      this.writeFileBeginning();
      this.writeScenarioBeginning(tags);
    }
  }

  write (content) {
    this.file.write(content)
  }

  getFileName () {
    return Inflector.kebabCase(this.getModuleName());
  }

  getModuleName () {
    return this.currentFile.replace('features/', '').replace('.feature', '').replace(/\//g, '-');
  }

  writeFileBeginning () {
    this.file.write(`import { useSdk } from "../../helpers/sdk";
    import { beforeEachTruncateCollections } from "../../hooks/collections";
    import { resetSecurityDefault} from "../../hooks/securities";

    import {Client} from "@elastic/elasticsearch";
    import {execute} from "../../../lib/support/execute";
    import fs from "fs";
    import {exec} from "child_process";

    jest.setTimeout(20000);

    function kourou(...command: any[]) {
      const kourouRuntime = process.env.KOUROU_RUNTIME || "./bin/run";
      return execute(kourouRuntime, ...command);
    }

    describe("${this.getModuleName()}", () => {
      let sdk = useSdk();
      let shouldResetSecurity = false;
      let shouldLogout = false;
      let esClient = new Client({ node: process.env.ELASTICSEARCH_URL || "http://localhost:9200" });

      beforeAll(async () => {
        await sdk.connect();
      });

      beforeEach(async () => {
            await beforeEachTruncateCollections(sdk);
      });

      afterEach(async () => {
        if (shouldResetSecurity) {
          await resetSecurityDefault(sdk);
          shouldResetSecurity = false;
        }

        if (shouldLogout) {
          sdk.jwt = null;
        }
      });

      afterAll(async () => {
        sdk.disconnect();
      });`);
  }

  writeFileEnd () {
    if (this.file) {
      this.file.write(`});
      `)
    }
  }

  close () {
    if (this.file) {
      this.file.close();
    }
  }

  writeScenarioBeginning(tags) {
    if (this.file) {
      const shouldResetSecurity = tags.includes('@security');

      this.file.write(`
      it('${this.currentScenario}', async () => {
        shouldResetSecurity = ${shouldResetSecurity};

        let index;
        let collection;
        let document;
        let response;
        `);
    }
  }

  writeScenarioEnd() {
    if (this.file) {
      this.file.write(`});
      `)
    }
  }
}

module.exports = { JestConverter };
