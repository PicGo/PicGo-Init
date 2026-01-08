import { defineConfig } from 'tsdown'

export default defineConfig({
  entry: {
    index: 'src/index.ts',
    cli: 'src/cli.ts'
  },
  exports: true,
  platform: 'node',
  target: 'node22',
  hash: false,
  banner: ({ fileName }) => (fileName.startsWith('cli.') ? '#!/usr/bin/env node\n' : '')
})
