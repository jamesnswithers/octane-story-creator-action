import * as _ from 'lodash';
import { EntityTypes, ActionMethods } from './util';

const helpText = `
Call on the Octane command using \`/octane <action> <options>\`.
Available actions are: \`${ _.join(_.keys(ActionMethods), '\`, \`') }\`.
Available entity types for options are \`${ _.join(_.values(EntityTypes), '\`, \`') }\`.
`;

/**
 * Creates the help text used in the `/octane help` command
 *
 * @returns {object} Help Text
 */
 export function getHelp() {
  return helpText;
}