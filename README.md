# octane-story-creator-action
 GitHub Action to Create Octane Stories

## GitHub Action Configuration

```
name: Octane Story Creator

on:
  issue_comment:
    types: [created, edited]

jobs:
  octane-story:
    name: Create Octane Story
    if: ${{ github.event.issue.pull_request }}
    runs-on: ubuntu-latest
    steps:
      - uses: jamesnswithers/octane-story-creator-action@main
        env:
          GITHUB_TOKEN: '${{ secrets.GITHUB_TOKEN }}'
          SERVER: '${{ secrets.OCTANE_SERVER }}'
          WORKSPACE: '${{ secrets.OCTANE_WORKSPACE }}'
          SHARED_SPACE: '${{ secrets.OCTANE_SHAREDSPACE }}'
          USER: '${{ secrets.OCTANE_USER }}'
          PASSWORD: '${{ secrets.OCTANE_PASSWORD }}'
```

## Use
From a Pull Request you can use the `create` command to create User Stories, Defects and Quality Stories.

The `create` command structure is:

```
/octane create <type> <options>
```

The Action will create a story and comment in the Pull Request the story reference.

These options can be included in the command to populate the story with different information.

- `--title="Optional Title"`
- `--template=TemplateName`

### Types
You can specify one of three types; `story`, `defect` and `quality`.

### Templates

The template will help you apply data to stories created. The template is a a JSON document with a default template set. The default template can be overridden by providing another, named template which will be merged with the default. See the [example](https://github.com/jamesnswithers/octane-story-creator-action/blob/main/src/main.ts) for reference, but also review the Octane API documentation for fields not listed.

### Help

You can also use the `help` command to create a comment with information about the action.

```
/octane help
```