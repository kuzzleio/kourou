import path from "path";
import fs from "node:fs/promises";

import ndjson from "ndjson";
import { flags } from "@oclif/command";

import { PaasKommand } from "../../../support/PaasKommand";

/**
  * Results of the document dump action.
  */
type DocumentDump = {
  pit_id: string;
  hits: DocumentDumpHits;
};

type DocumentDumpHits = {
  total: DocumentDumpHitsTotal;
  hits: DocumentDumpHit[];
};

type DocumentDumpHitsTotal = {
  value: number;
};

type DocumentDumpHit = {
  sort: string[];
};

class PaasEsDump extends PaasKommand {
  public static description = "Dump data from the Elasticsearch of a PaaS application";

  public static flags = {
    help: flags.help(),
    project: flags.string({
      description: "Current PaaS project",
    }),
    "batch-size": flags.integer({
      description: "Maximum batch size",
      default: 2000,
    }),
  };

  static args = [
    {
      name: "environment",
      description: "Project environment name",
      required: true,
    },
    {
      name: "applicationId",
      description: "Application Identifier",
      required: true,
    },
    {
      name: "dumpDirectory",
      description: "Directory where to store dump files",
      required: true,
    }
  ];

  async runSafe() {
    // Check that the batch size is positive
    if (this.flags["batch-size"] <= 0) {
      this.logKo(`The batch size must be greater than zero. (Specified batch size: ${this.flags["batch-size"]})`);
      process.exit(1);
    }

    // Log in to the PaaS
    const apiKey = await this.getCredentials();

    await this.initPaasClient({ apiKey });

    const user = await this.paas.auth.getCurrentUser();
    this.logInfo(
      `Logged as "${user._id}" for project "${this.flags.project || this.getProject()
      }"`
    );

    // Create the dump directory
    await fs.mkdir(this.args.dumpDirectory, { recursive: true });

    // Dump the indexes
    this.logInfo("Dumping Elasticsearch indexes...");

    const indexesResult = await this.getAllIndexes();
    await fs.writeFile(path.join(this.args.dumpDirectory, "indexes.json"), JSON.stringify(indexesResult));

    this.logOk("Elasticsearch indexes dumped!");

    // Dump all the documents
    this.logInfo("Dumping Elasticsearch documents...");
    await this.dumpAllDocuments();

    this.logOk("Elasticsearch documents dumped!");
    this.logOk(`The dumped files are available under "${path.resolve(this.args.dumpDirectory)}"`)
  }

  /**
    * @description Get all indexes from the Elasticsearch of the PaaS application.
    * @returns The indexes.
    */
  private async getAllIndexes() {
    const { result }: any = await this.paas.query({
      controller: "application/storage",
      action: "getIndexes",
      environmentId: this.args.environment,
      projectId: this.flags.project || this.getProject(),
      applicationId: this.args.applicationId,
      body: {},
    });

    return result;
  }

  /**
    * @description Dump documents from the Elasticsearch of the PaaS application.
    * @param pitId ID of the PIT opened on Elasticsearch.
    * @param searchAfter Cursor for dumping documents after a certain one.
    * @returns The dumped documents.
    */
  private async dumpDocuments(pitId: string, searchAfter: string[]): Promise<DocumentDump> {
    const { result }: any = await this.paas.query({
      controller: "application/storage",
      action: "dumpDocuments",
      environmentId: this.args.environment,
      projectId: this.flags.project || this.getProject(),
      applicationId: this.args.applicationId,
      body: {
        pitId,
        searchAfter: JSON.stringify(searchAfter),
        size: this.flags["batch-size"],
      },
    });

    return result;
  }

  private async dumpAllDocuments() {
    // Prepare dumping all documents
    let pitId = "";
    let searchAfter: string[] = [];

    let dumpedDocuments = 0;
    let totalDocuments = 0;

    const fd = await fs.open(path.join(this.args.dumpDirectory, "documents.jsonl"), "w");
    const writeStream = fd.createWriteStream();
    const ndjsonStream = ndjson.stringify();

    writeStream.on("error", (error) => {
      throw error;
    });

    ndjsonStream.on("data", (line: string) => {
      writeStream.write(line);
    });

    const teardown = async () => {
      // Finish the dump session if a PIT ID is set
      if (pitId.length > 0) {
        await this.finishDump(pitId);
      }

      // Close the open streams/file
      writeStream.close();
      await fd.close();
    };

    try {
      // Dump the first batch
      let result = await this.dumpDocuments(pitId, searchAfter);
      let hits = result.hits.hits;

      while (hits.length > 0) {
        // Update the PIT ID and the cursor for the next dump
        pitId = result.pit_id;
        searchAfter = hits[hits.length - 1].sort;

        // Save the documents
        for (let i = 0; i < hits.length; ++i) {
          ndjsonStream.write(hits[i]);
        }

        dumpedDocuments += hits.length;
        totalDocuments = result.hits.total.value;
        this.logInfo(`Dumping Elasticsearch documents: ${Math.floor(dumpedDocuments / totalDocuments * 100)}% (${dumpedDocuments}/${totalDocuments})`);

        // Dump the next batch
        result = await this.dumpDocuments(pitId, searchAfter);
        hits = result.hits.hits;
      }
    } catch (error: any) {
      teardown();

      this.logKo(`Error while dumping the documents: ${error}`);
      process.exit(1);
    }

    // Finish the dump
    teardown();
  }

  /**
    * @description Finish the document dumping session.
    * @param pitId ID of the PIT opened on Elasticsearch.
    */
  private async finishDump(pitId: string) {
    try {
      await this.paas.query({
        controller: "application/storage",
        action: "finishDumpDocuments",
        environmentId: this.args.environment,
        projectId: this.flags.project || this.getProject(),
        applicationId: this.args.applicationId,
        body: {
          pitId,
        },
      });
    } catch (error: any) {
      this.logInfo(`Unable to cleanly finish the dump session: ${error}`);
    }
  }
}

export default PaasEsDump;
