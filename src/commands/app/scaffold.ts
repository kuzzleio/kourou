import path from 'path'
import fs from 'fs'

import { flags } from '@oclif/command'
import _ from 'lodash'
import chalk from 'chalk'
import Listr from 'listr'
import inquirer from 'inquirer'


import { Kommand } from '../../common'
import { execute } from '../../support/execute'

const templatesDir = path.join(__dirname, '..', '..', '..', 'templates')

const TEMPLATED_ENTRIES = [
  'package.json',
  'app.ts',
  'README.md'
]

const KEBAB_CASE_REGEX = /^[a-z-\d]+$/;

export default class AppScaffold extends Kommand {
  static initSdk = false

  static description = 'Scaffolds a new Kuzzle application'

  static flags = {
    help: flags.help(),
  }

  static args = [
    { name: 'name', description: 'Application name', required: true },
  ]

  checkKebabCase(name: string) {
    return KEBAB_CASE_REGEX.test(name);
  }

  convertToKebabCase(name: string) {
    return name.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
  }

  async runSafe() {
    if (!this.checkKebabCase(this.args.name)) {
      this.logKo(`The application name must be in kebab-case`);
      const kebabCasedName = this.convertToKebabCase(this.args.name);
      const response = await inquirer.prompt([
        {
          name: 'kebabCaseConversion',
          type: 'confirm',
          message: `Would you like to convert "${this.args.name}" to "${kebabCasedName}"`
        }
      ]);

      if (!response.kebabCaseConversion) {
        process.exit(0);
      }
      this.args.name = kebabCasedName;
    }

    const templatePath = path.join(templatesDir, 'app-scaffold', 'ts');

    const tasks = new Listr([
      {
        title: `Creating directory: ${chalk.gray(this.args.name + path.sep)}`,
        task: () => execute('mkdir', this.args.name)
      },
      {
        title: 'Creating and rendering application files',
        task: () => this.renderTemplates(templatePath, templatePath)
      },
      {
        title: 'Installing dependencies (this can take some time)',
        task: () =>
          execute('npm', 'run', 'install:docker', { cwd: this.args.name })
      },
    ]);

    await tasks.run();

    this.logOk(`Scaffolding complete! Use "${chalk.grey('cd ' + this.args.name + ' && npm run dev:docker')}" to run your application`);
  }

  async renderTemplates(directory: string, templatePath: string) {
    const entries = fs.readdirSync(directory);

    for (const entry of entries) {
      const entryPath = path.join(directory, entry);
      const entryDir = path.dirname(path.join(this.args.name, entryPath));
      const entryInfo = fs.statSync(entryPath);

      if (entryInfo.isDirectory()) {
        fs.mkdirSync(entryDir.replace(templatePath, ''), { recursive: true });

        await this.renderTemplates(entryPath, templatePath);
      }
      else if (entryInfo.isFile() || entryInfo.isSymbolicLink()) {
        const content = fs.readFileSync(entryPath, 'utf8');

        // Only render a whitelist a files who need it
        const rendered = TEMPLATED_ENTRIES.includes(entry)
          ? _.template(content)({ appName: this.args.name })
          : content;

        fs.mkdirSync(entryDir.replace(templatePath, ''), { recursive: true });
        fs.writeFileSync(path.join(this.args.name, entryPath.replace(templatePath, '')), rendered);
      }
      else {
        this.logInfo(`Skipped ${entryPath} because it's not a regular file`);
      }
    }
  }
}
