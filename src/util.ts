import * as _ from 'lodash';

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
  description: String = 'Story';
}

export class Quality extends OctaneEntity {
  type: EntityTypes = EntityTypes.QUALITY;
  description: String = 'Quality Story';
}

export class Defect extends OctaneEntity {
  type: EntityTypes = EntityTypes.DEFECT;
  description: String = 'Defect';
}