import { createRequire } from 'node:module'
import path from 'node:path'
import ejs from 'ejs'
import fs from 'fs-extra'
import globby from 'globby'
import match from 'minimatch'
import type { Answers, FileTree, InitContext, InitOptions, TemplateOptions } from './types.js'

const require = createRequire(import.meta.url)

const getTemplateOptions = (templatePath: string): TemplateOptions => {
  const optionsPath = path.join(templatePath, 'index.js')
  if (!fs.existsSync(optionsPath)) {
    return {}
  }
  const loaded = require(optionsPath) as TemplateOptions | { default?: TemplateOptions }
  const normalized = loaded && typeof loaded === 'object' && 'default' in loaded
    ? loaded.default ?? {}
    : loaded
  return normalized as TemplateOptions
}

const filters = (ctx: InitContext, exp: string, data: Answers): boolean => {
  // eslint-disable-next-line no-new-func
  const fn = new Function('data', `with (data) { return ${exp} }`) as (input: Answers) => boolean
  try {
    return fn(data)
  } catch {
    ctx.log.error(`Error when evaluating filter condition: ${JSON.stringify(exp)}`)
    return false
  }
}

const render = (files: string[], source: string, options: Answers): FileTree => {
  const fileTree: FileTree = {}
  files.forEach((filePath: string) => {
    const file = fs.readFileSync(path.join(source, filePath), 'utf8')
    const content = ejs.render(file, options)
    if (Buffer.isBuffer(content) || /[^\s]/.test(content)) {
      fileTree[filePath] = content
    }
  })
  return fileTree
}

const writeFileTree = (dir: string, files: FileTree): void => {
  Object.keys(files).forEach((name: string) => {
    const filePath = path.join(dir, name)
    fs.ensureDirSync(path.dirname(filePath))
    fs.writeFileSync(filePath, files[name])
  })
}

const generate = async (ctx: InitContext, options: InitOptions): Promise<void> => {
  try {
    const opts = getTemplateOptions(options.tmp)
    const source = path.join(options.tmp, 'template')
    let answers: Answers = {}

    if (opts.prompts) {
      answers = await ctx.prompt(opts.prompts)
    }

    let files = await globby(['**/*'], { cwd: source, dot: true })
    const filterKeys = Object.keys(opts.filters || {})
    if (filterKeys.length > 0) {
      files = files.filter((item: string) => {
        let matched = ''
        for (const key of filterKeys) {
          if (match(item, key, { dot: true })) {
            matched = item
            break
          }
        }
        if (!matched) {
          return true
        }
        const expression = opts.filters?.[matched]
        return expression ? filters(ctx, expression, answers) : true
      })
    }

    if (files.length === 0) {
      ctx.log.warn('Template files not found!')
      return
    }

    const rendered = render(files, source, answers)
    writeFileTree(options.dest, rendered)

    if (typeof opts.complete === 'function') {
      opts.complete({ answers, options, files, ctx })
    }

    if (opts.completeMessage) {
      ctx.log.success(opts.completeMessage)
    }

    ctx.log.success('Done!')
  } catch (error) {
    ctx.log.error(error instanceof Error ? error : String(error))
  }
}

export { generate, getTemplateOptions, render, writeFileTree }
