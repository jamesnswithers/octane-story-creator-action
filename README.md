# octane-story-creator-action
 GitHub Action to Create Octane Tickets

## Use
From a Pull Request you can us the `create` command to create User Stories, Defects and Quality Stories.

The `create` command structure is:

```
/octane create <type> "optional title"
```

The Action will create a ticket and comment in the Pull Request the ticket reference.

If left blank, the title for the Octane ticket will be taken from the title of the Pull Request.

### Types
You can specify one of three types; `story`, `defect` and `quality`.