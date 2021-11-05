import * as _ from 'lodash';
import * as octane from '@microfocus/alm-octane-js-rest-sdk';

export const ActionMethods = {
 'create': 'create',
 'help': 'help'
}

export enum EntityTypes {
  STORY = "story",
  QUALITY = "quality",
  DEFECT = "defect"
}

class OctaneEntity {
  title: String;
  apiObject: Object;

  constructor(title: String) {
    this.title = title;
    this.apiObject = {
      name: title
    };
  }

  mergeApiConfig(config: Object) {
    this.apiObject = _.merge(this.apiObject, config);
  }
}

export class Story extends OctaneEntity {
  type: EntityTypes = EntityTypes.STORY;
  octaneType = octane.Octane.entityTypes.stories;
  description: String = 'Story';
}

export class Quality extends OctaneEntity {
  type: EntityTypes = EntityTypes.QUALITY;
  octaneType = octane.Octane.entityTypes.qualityStories;
  description: String = 'Quality Story';
}

export class Defect extends OctaneEntity {
  type: EntityTypes = EntityTypes.DEFECT;
  octaneType = octane.Octane.entityTypes.defects;
  description: String = 'Defect';
}

/**
 * Adds a comment to the GitHub Pull Request
 *
 * @param {object} gitHubClient An authenticated GitHub context
 * @param {object} context github context object
 * @param {String} comment The body of the comment
 * @async
 */
 export async function githubComment(gitHubClient, context, comment) {
  const commentObject = _.assign(context.repo, {
    issue_number: context.payload.issue.number,
    body: comment
  });
  gitHubClient.issues.createComment(commentObject);
}