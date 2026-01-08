import type { Answers as InquirerAnswers, PromptSession } from 'inquirer'

export type Answers = InquirerAnswers

export interface Logger {
  info: (message: string) => void
  success: (message: string) => void
  warn: (message: string) => void
  error: (message: string | Error) => void
}

export type PromptFn = <T extends Answers>(questions: PromptSession<T>) => Promise<T>

export interface InitContext {
  log: Logger
  prompt: PromptFn
}

export interface InitOptions {
  template: string
  dest: string
  hasSlash: boolean
  inPlace: boolean
  offline: boolean
  tmp: string
  project?: string
}

export interface FileTree {
  [filePath: string]: string | Buffer
}

export interface CompleteContext {
  answers: Answers
  options: InitOptions
  files: string[]
  ctx: InitContext
}

export interface TemplateOptions {
  prompts?: PromptSession<Answers>
  filters?: Record<string, string>
  complete?: (context: CompleteContext) => void
  completeMessage?: string
}
