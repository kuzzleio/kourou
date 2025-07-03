import { Client } from "sdk-es8";
import { Provider } from ".";
import { ElasticsearchProviderOptions } from "./elasticsearchTypes";



export class Elasticsearch8 implements Provider {
  private readonly client: Client;
  private readonly options: ElasticsearchProviderOptions;

  constructor(url: string, options: ElasticsearchProviderOptions) {
    const { auth, url: cleanedUrl } = this.extractCredentials(url);

    this.client = new Client({
      node: cleanedUrl,
      auth,
    });
    this.options = options;
  }

  private extractCredentials(url: string) {
    let auth = undefined;
    if (url.includes("@")) {
      const urlCleaned = url.replace(/https?:\/\//, "");
      const [credentials] = urlCleaned.split("@");
      const [username, password] = credentials.split(":");

      if (!username || !password) {
        throw new Error(
          "Invalid credentials format. Expected format: username:password@url"
        );
      }

      if (username === "nologin" && password) {
        auth = {
          apiKey: password,
        };
      } else if (username && password) {
        auth = {
          username,
          password,
        };
      }

      if (url.startsWith("http://")) {
        url = url.replace(/https?:\/\/[^@]+@/, "http://");
      } else if (url.startsWith("https://")) {
        url = url.replace(/https?:\/\/[^@]+@/, "https://");
      }
    }
    return { auth, url };
  }

  async listIndices(pattern?: string): Promise<string[]> {
    const body = await this.client.cat.indices({ format: "json" });

    return body
      .map((record: { index?: string }) => record.index as string)
      .filter((index: string) => index.match(pattern as string))
      .filter((index: string) => !index.startsWith(".")) // ignore system indices
      .sort();
  }

  async getIndex(index: string): Promise<any> {
    const resp = await this.client.indices.get({ index });

    // Remove unsupported settings properties
    const specifications = resp[index as keyof typeof resp];
    delete specifications?.settings?.index?.creation_date;
    delete specifications?.settings?.index?.provided_name;
    delete specifications?.settings?.index?.uuid;
    delete specifications?.settings?.index?.version;
    delete specifications?.settings?.index?.routing;
    delete specifications?.settings?.index?.history;

    return specifications;
  }

  async createIndex(index: string, specifications: any): Promise<void> {
    specifications.settings.write = {
      wait_for_active_shards: 1, // Wait for at least one shard to be active before returning
    };
    await this.client.indices.create({ index, body: specifications });
  }

  async readData(index: string, args: any): Promise<any> {
    if (!args || !args.scrollId) {
      const body = await this.client.search({
        index,
        scroll: this.options.scrollDuration,
        body: {
          query: {
            match_all: {},
          },
        },
        size: this.options.batchSize,
      });

      return {
        documents: body.hits.hits,
        total: body?.hits?.total,
        scrollId: body._scroll_id,
      };
    } else {
      const {
        hits,
      } = await this.client.scroll({
        scroll_id: args.scrollId,
        scroll: this.options.scrollDuration,
      });

      return hits.hits;
    }
  }

  async writeData(index: string, docs: any): Promise<number> {
    const bulk = [];

    for (const doc of docs) {
      bulk.push({ index: { _index: index, _id: doc._id } });
      bulk.push(doc._source);
    }

    await this.client.bulk({ body: bulk });
    return bulk.length / 2;
  }

  async clear(): Promise<void> {
    const indices = await this.listIndices();
    if (indices.length === 0) {
      return;
    }
    // Delete all indices
    await this.client.indices.delete({ index: indices.join(",") });
  }
}
