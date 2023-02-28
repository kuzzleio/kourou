import { Client } from "@elastic/elasticsearch";
import { Provider } from ".";

export type ElasticsearchProviderOptions = {
  scrollDuration: string;
  batchSize: number;
};

export class Elasticsearch implements Provider {
  private readonly client: Client;
  private readonly options: ElasticsearchProviderOptions;

  constructor(url: string, options: ElasticsearchProviderOptions) {
    this.client = new Client({ node: url });
    this.options = options;
  }

  async listIndices(pattern?: string): Promise<string[]> {
    const { body } = await this.client.cat.indices({ format: "json" });

    return body
      .map(({ index }: { index: string }) => index)
      .filter((index: string) => index.match(pattern as string))
      .filter((index: string) => !index.startsWith(".")) // ignore system indices
      .sort();
  }

  async getIndex(index: string): Promise<any> {
    const resp = await this.client.indices.get({ index });

    // Remove unsupported settings properties
    const specifications = resp.body[index as keyof typeof resp];
    delete specifications.settings.index.creation_date;
    delete specifications.settings.index.provided_name;
    delete specifications.settings.index.uuid;
    delete specifications.settings.index.version;
    delete specifications.settings.index.routing;
    delete specifications.settings.index.history;

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
      const { body } = await this.client.search({
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
        total: body.hits.total.value,
        scrollId: body._scroll_id
      };
    } else {
      const {
        body: { hits },
      } = await this.client.scroll({
        scroll_id: args.scrollId,
        scroll: this.options.scrollDuration
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
    await this.client.indices.delete({ index: "_all" });
  }
}
