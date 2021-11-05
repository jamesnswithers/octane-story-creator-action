import * as _ from 'lodash';
import * as octane from '@microfocus/alm-octane-js-rest-sdk';

export enum ActionMethods {
 CREATE = "create",
 HELP = "help"
}

export enum EntityTypes {
  STORY = "story",
  QUALITY = "quality",
  DEFECT = "defect"
}

export class OctaneEntity {
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