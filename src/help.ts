const helpText = `
  Call on the Octane command using \`/octane <action> <options>\`.
  Available actions are:
    - help
    - create
`;

/**
 * Creates the help text used in the `/octane help` command
 *
 * @returns {object} Help Text
 */
 export function getHelp() {
  return helpText;
}