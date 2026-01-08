#!/usr/bin/env node
import { Command } from 'commander'
import chalk from 'chalk'
import fs from 'fs-extra'
import inquirer from 'inquirer'
import { createLogger } from './logger.js'
import { createInitOptions, runInit, type InitFlags } from './init.js'

const program = new Command()
const log = createLogger()
const prompt = inquirer.prompt.bind(inquirer)

program
  .name('picgo-init')
  .usage('<template> [project]')
  .arguments('<template> [project]')
  .option('--offline', 'use cached template')
  .option('--debug', 'debug mode')
  .description("create picgo plugin's development templates")
  .action(async (template: string, project: string | undefined, flags: InitFlags, _cmd: Command) => {
    const options = createInitOptions(template, project, flags)

    try {
      if (options.inPlace || fs.existsSync(options.dest)) {
        const answers = await prompt<{ ok: boolean }>([
          {
            type: 'confirm',
            message: options.inPlace
              ? 'Generate project in current directory?'
              : 'Target directory exists. Continue?',
            name: 'ok'
          }
        ])
        if (answers.ok) {
          await runInit({ log, prompt }, options)
        }
      } else {
        await runInit({ log, prompt }, options)
      }
    } catch (error) {
      log.error(error instanceof Error ? error : String(error))
      if (process.argv.includes('--debug')) {
        throw error
      }
    }
  })
  .on('--help', () => {
    console.log()
    console.log('Examples:')
    console.log()
    console.log(chalk.gray('  # create a new project with an official template'))
    console.log('  $ picgo-init plugin my-project')
    console.log()
    console.log(chalk.gray('  # create a new project straight from a github template'))
    console.log('  $ picgo-init username/repo my-project')
    console.log()
  })

program.parse(process.argv)
