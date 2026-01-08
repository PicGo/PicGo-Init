import path from 'node:path'
import { homedir, tmpdir } from 'node:os'
import fs from 'fs-extra'
import { downloadTemplate } from 'giget'
import type { InitContext, InitOptions } from './types.js'
import { generate } from './templates.js'

export interface InitFlags {
  offline?: boolean
}

const resolveTemplateCacheDir = (template: string): string => {
  return path.join(homedir(), '.picgo/templates', template.replace(/[/:]/g, '-'))
}

const toGigetSource = (input: string): string => {
  if (/^(https?:\/\/)/.test(input) || input.includes(':')) {
    return input
  }
  return `github:${input}`
}

const makeWritable = (target: string): void => {
  if (!fs.existsSync(target)) {
    return
  }
  try {
    const stats = fs.lstatSync(target)
    if (stats.isDirectory()) {
      fs.chmodSync(target, 0o777)
      for (const entry of fs.readdirSync(target)) {
        makeWritable(path.join(target, entry))
      }
    } else {
      fs.chmodSync(target, 0o666)
    }
  } catch {
    // best-effort; ignore permission errors here
  }
}

const removeTemplateDir = (ctx: InitContext, target: string): boolean => {
  if (!fs.existsSync(target)) {
    return true
  }
  try {
    fs.rmSync(target, { recursive: true, force: true })
    return true
  } catch {
    // fallthrough
  }
  try {
    makeWritable(target)
    fs.rmSync(target, { recursive: true, force: true })
    return true
  } catch (removeError) {
    ctx.log.warn(`Failed to clean template cache at ${target}: ${String(removeError)}`)
    return false
  }
}

const createTempDownloadDir = (): string => {
  const cacheRoot = path.join(homedir(), '.picgo/templates')
  try {
    fs.ensureDirSync(cacheRoot)
    return fs.mkdtempSync(path.join(cacheRoot, 'picgo-init-'))
  } catch {
    return fs.mkdtempSync(path.join(tmpdir(), 'picgo-init-'))
  }
}

const createInitOptions = (template: string, project: string | undefined, flags: InitFlags): InitOptions => {
  const hasSlash = template.includes('/')
  const inPlace = !project || project === '.'
  const dest = path.resolve(project || '.')
  const offline = Boolean(flags.offline)
  const tmp = resolveTemplateCacheDir(template)
  const templatePath = offline ? tmp : template

  return {
    template: templatePath,
    project,
    hasSlash,
    inPlace,
    dest,
    tmp,
    offline
  }
}

const downloadAndGenerate = async (ctx: InitContext, options: InitOptions): Promise<void> => {
  const cleaned = removeTemplateDir(ctx, options.tmp)
  const downloadDir = cleaned ? options.tmp : createTempDownloadDir()
  if (!cleaned) {
    ctx.log.warn(`Using temporary directory for template download: ${downloadDir}`)
  }

  ctx.log.info('Template files are downloading...')
  const source = toGigetSource(options.template)

  try {
    await downloadTemplate(source, {
      dir: downloadDir,
      forceClean: true,
      force: true,
      silent: true
    })
    ctx.log.success('Template files are downloaded!')
    await generate(ctx, {
      ...options,
      tmp: downloadDir
    })
  } catch (error) {
    ctx.log.error(error instanceof Error ? error : String(error))
  }
}

const runInit = async (ctx: InitContext, options: InitOptions): Promise<void> => {
  if (options.offline) {
    if (fs.existsSync(options.template)) {
      await generate(ctx, options)
    } else {
      ctx.log.error(`Local template ${options.template} not found`)
    }
    return
  }

  const resolved = {
    ...options,
    template: options.hasSlash ? options.template : `PicGo/picgo-template-${options.template}`
  }

  await downloadAndGenerate(ctx, resolved)
}

export { createInitOptions, resolveTemplateCacheDir, runInit, toGigetSource }
