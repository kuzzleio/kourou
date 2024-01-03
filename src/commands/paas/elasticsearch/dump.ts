import path from "path";
import fs from "node:fs/promises";

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
    await fs.mkdir(path.join(this.args.dumpDirectory, "documents/"), { recursive: true });

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
      },
    });

    return result;
  }

  private async dumpAllDocuments() {
    // Prepare dumping all documents
    let pitId = "";
    let searchAfter: string[] = [];

    let currentDocumentChunk = 0;
    let dumpedDocuments = 0;
    let totalDocuments = 0;

    // Dump the first batch
    let result = await this.dumpDocuments(pitId, searchAfter);
    let hits = result.hits.hits;

    while (hits.length > 0) {
      // Update the PIT ID and the cursor for the next dump
      pitId = result.pit_id;
      searchAfter = hits[hits.length - 1].sort;

      // Save the document
      await fs.writeFile(path.join(this.args.dumpDirectory, "documents/", `${currentDocumentChunk++}.json`), JSON.stringify(hits));

      dumpedDocuments += hits.length;
      totalDocuments = result.hits.total.value;
      this.logInfo(`Dumping Elasticsearch documents: ${Math.floor(dumpedDocuments / totalDocuments * 100)}% (${dumpedDocuments}/${totalDocuments})`);

      // Dump the next batch
      result = await this.dumpDocuments(pitId, searchAfter);
      hits = result.hits.hits;
    }

    // Finish the dump
    try {
      await this.finishDump(pitId);
    } catch (error: any) {
      this.logInfo("Unable to cleanly finish the dump session:");
      console.warn(error)
    }
  }

  /**
    * @description Finish the document dumping session.
    * @param pitId ID of the PIT opened on Elasticsearch.
    */
  private async finishDump(pitId: string) {
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
  }
}

export default PaasEsDump;
