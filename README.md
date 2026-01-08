# PicGo-Init

Standalone initializer for PicGo plugin templates. This package replaces the legacy
`picgo init` command from [PicGo-Core](https://github.com/PicGo/PicGo-Core).

## Requirements

- Node.js >= 22

## Usage

```bash
picgo-init <template> [project]
```

Options:

- `--offline`: use cached template from `~/.picgo/templates`.

Examples:

```bash
# create a new project with an official template
picgo-init plugin my-project

# create a new project straight from a GitHub template
picgo-init username/repo my-project
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
