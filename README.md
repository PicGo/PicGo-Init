# PicGo-Init

Standalone initializer for PicGo plugin templates. This package replaces the legacy
`picgo init` command from [PicGo-Core](https://github.com/PicGo/PicGo-Core).

## Requirements

- Node.js >= 22

## Usage

```bash
npx picgo-init <template> [project]
```

Options:

- `--offline`: use cached template from `~/.picgo/templates`.

Examples:

```bash
# create a new project with an official template
npx picgo-init plugin my-project

# create a new project straight from a GitHub template
npx picgo-init username/repo my-project
```

### CLI Help

```bash
Usage: picgo-init <template> [project]

create picgo plugin's development templates

Options:
  --offline   use cached template
  --debug     debug mode
  -h, --help  display help for command

Examples:

  # create a new project with an official template
  $ picgo-init plugin my-project

  # create a new project straight from a github template
  $ picgo-init username/repo my-project
```

## Development

- Install dependencies:

```bash
pnpm install
```

- Run the unit tests:

```bash
pnpm test
```

- Build the library:

```bash
pnpm build
```
