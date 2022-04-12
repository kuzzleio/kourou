import { flags } from '@oclif/command'
import { Client } from '@elastic/elasticsearch'
import cli from 'cli-ux'
import chalk from 'chalk'
import emoji from 'node-emoji'

import { Kommand } from '../../common'

export default class EsMigrate extends Kommand {
  static initSdk = false

  static description = 'Migrate all the index from one Elasticsearch server to another'

  static flags = {
    help: flags.help(),
    src: flags.string({
      description: 'Source Elasticsearch server URL',
      env: 'KUZZLE_ES_SRC',
      required: true
    }),
    dest: flags.string({
      description: 'Destination Elasticsearch server URL',
      env: 'KUZZLE_ES_DEST',
      required: true
    }),
    reset: flags.boolean({
      description: 'Reset destination Elasticsearch server',
      default: false,
    }),
    'batch-size': flags.integer({
      description: 'How many documents to move in batch per operation',
      default: 1000,
    }),
    'no-interactive': flags.boolean({
      description: 'Skip confirmation interactive prompts (perfect for scripting)',
      default: false,
    }),
    'dry-run': flags.boolean({
      description: 'Print witch collections will be migrated',
      default: false,
    }),
    'pattern': flags.string({
      description: 'Pattern to match indices to migrate'
    }),
    'scroll': flags.string({
      description: 'Scroll duration for Elasticsearch scrolling',
      default: '30s'
    }),
  }

  static examples = [
    'kourou es:migrate --src http://elasticsearch:9200 --dest http://otherElasticsearch:9200 --reset --batch-size 2000',
    'kourou es:migrate --src http://elasticsearch:9200 --dest http://otherElasticsearch:9200 --reset --batch-size 2000 --no-interactive'
  ]

  private async migrateMappings(index: string, src: Client, dest: Client) {
    const { body } = await src.indices.getMapping({ index })
    const mappings = body[index]
    await dest.indices.create({ index, body: { mappings: mappings.mappings } })
  }

  private async migrateData(index: string, batch_size: number, src: Client, dest: Client) {
    const queue = []

    const { body } = await src.search({
      index,
      scroll: this.flags.s,
      size: batch_size,
      body: {
        query: {
          match_all: {}
        }
      }
    })
    const scrollId = body._scroll_id
    const total = body.hits.total.value

    if (total === 0) {
      return 0
    }

    const progressBar = cli.progress({ format: chalk.blue(' [*] Importing |{bar}| {percentage}% || {value}/{total} documents') })
    progressBar.start(total, 0)

    let count = 0
    queue.push(body.hits)
    while (queue.length && total !== count) {
      const { hits: docs } = queue.pop()
      const bulk = []
      for (const doc of docs) {
        bulk.push({ index: { _index: index, _id: doc._id } })
        bulk.push(doc._source)
        count++
      }

      await dest.bulk({ body: bulk })

      progressBar.update(count)

      const { body: { hits } } = await src.scroll({
        scroll_id: scrollId,
        scroll: this.flags.scroll
      })
      queue.push(hits)
    }

    progressBar.stop()

    return total
  }

  async runMigrate(index: string, src: Client, dest: Client) {
    this.logInfo(`Importing ${chalk.bold(index)} to ${chalk.bold(this.flags.dest)}`)

    await this.migrateMappings(index, src, dest)
    this.logOk('Mappings successfully imported!')

    const count = await this.migrateData(index, this.flags['batch-size'], src, dest)

    if (count === 0) {
      this.logInfo('No documents to import\n')
    } else {
      this.logOk(`${chalk.bold(count)} document(s) imported!\n`)
    }

  }

  async runSafe() {
    const src = new Client({ node: this.flags.src })
    const dest = new Client({ node: this.flags.dest })

    if (this.flags.reset && !this.flags['no-interactive']) {
      this.log(chalk.red(`${emoji.get('fire')} Are you sure you want to reset ${chalk.bold(this.flags.dest)}?`))
      await cli.confirm(chalk.redBright(` ${emoji.get('fire')} You will lose all the data stored in it (Type "yes" to confirm)`))
      await dest.indices.delete({ index: '_all' })
    }

    this.logInfo(`Fetching indices list from ${chalk.bold(this.flags.src)}`)
    const srcBody = await src.cat.indices({ format: 'json' })
    const srcIndices = srcBody.body
      .map(({ index }: { index: string }) => index)
      .filter((index: string) => index.match(this.flags.pattern))
      .sort()

    this.logOk(`Found ${chalk.bold(srcIndices.length)} indices in the source Elasticsearch server\n`)

    if (this.flags['dry-run']) {
      this.log(`${chalk.bold(srcIndices)}`)
      this.logInfo(`${chalk.bold(srcIndices.length)} indices will be migrated`)
    } else {
      this.logInfo(`Starting indices migration from ${chalk.bold(this.flags.src)} to ${chalk.bold(this.flags.dest)}`)
      for (const index of srcIndices) {
        await this.runMigrate(index, src, dest);
      }
    }
  }
}
