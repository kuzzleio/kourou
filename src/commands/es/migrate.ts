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
            description: 'Source Elasticsearch server URL (ej: http://localhost:9200)',
            env: 'KUZZLE_ES_SRC',
            required: true
        }),
        dest: flags.string({
            description: 'Destination Elasticsearch server URL (ej: http://localhost:9200)',
            env: 'KUZZLE_ES_DEST',
            required: true
        }),
        reset: flags.boolean({
            description: 'Reset destination Elasticsearch server',
            default: false,
        }),
        limit: flags.integer({
            description: 'Document transfer limit',
            default: 1000,
        }),
        force: flags.boolean({
            description: 'Force migration and skip confirmation interactive prompts',
            default: false,
        }),
    }

    static args = []

    private src: any

    private dest: any

    private async migrateMappings(index: string) {
        const { body } = await this.src.indices.getMapping({ index, format: 'json' })
        const mappings = body[index]
        await this.dest.indices.create({ index, body: mappings })
    }

    private async migrateData(index: string, limit: number) {
        const queue = []
        // Quick scroll duration estimation based on number of documents per hit
        const scrollDuration = 5 * (limit % 1000) > 0 ? `${5 * (limit % 1000)}s` : '5s'
        const { body } = await this.src.search({
            index,
            scroll: scrollDuration,
            size: limit,
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

            await this.dest.bulk({ body: bulk })

            progressBar.update(count)

            const { body: { hits } } = await this.src.scroll({
                scrollId: scrollId,
                scroll: scrollDuration
            })
            queue.push(hits)
        }
        progressBar.stop()

        return total
    }

    async runSafe() {
        this.src = new Client({ node: this.flags.src })
        this.dest = new Client({ node: this.flags.dest })

        if (this.flags.reset && !this.flags.force) {
            this.log(chalk.red(`${emoji.get('fire')} Are you sure you want to reset ${chalk.bold(this.flags.dest)}?`))
            await cli.confirm(chalk.redBright(` ${emoji.get('fire')} You will lose all the data stored in it (Type "yes" to confirm)`))
            await this.dest.indices.delete({ index: '_all' })
        }

        this.logInfo(`Fetching indices list from ${chalk.bold(this.flags.src)}`)
        const { body } = await this.src.cat.indices({ format: 'json' })
        const indices = body
            .map(({ index }: { index: string }) => index)
            .sort()
        this.logOk(`Found ${chalk.bold(indices.length)} indices in the source Elasticsearch server\n`)

        this.logInfo(`Starting indices migration from ${chalk.bold(this.flags.src)} to ${chalk.bold(this.flags.dest)}`)
        for (const index of indices) {
            this.logInfo(`Importing ${chalk.bold(index)} to ${chalk.bold(this.flags.dest)}`)

            await this.migrateMappings(index)
            this.logOk('Mappings successfully imported!')

            const count = await this.migrateData(index, this.flags.limit)
            if (count === 0) {
                this.logInfo('No documents to import\n')
            } else {
                this.logOk(`${chalk.bold(count)} document(s) imported!\n`)
            }
        }
    }
}
