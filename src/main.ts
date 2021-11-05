import * as _ from 'lodash';
import * as core from '@actions/core';
import * as github from '@actions/github';
import stringArgv from 'string-argv';
import * as octane from '@microfocus/alm-octane-js-rest-sdk';
import { getConfig } from './config';
import { getHelp } from './help';
import { EntityTypes, ActionMethods, Story, Defect, Quality, githubComment } from './util';

const {
  SERVER: octaneServer ,
  SHARED_SPACE: octaneSharedSpace,
  WORKSPACE: octaneWorkspace,
  USER: octaneUser,
  PASSWORD: octanePassword,
  GITHUB_TOKEN: githubToken = ""
} = process.env

const run = async (): Promise<void> => {
  const gitHubClient = new github.GitHub(githubToken);
  const config = await getConfig(gitHubClient);
  core.info('Action config: ' + JSON.stringify(config));

  const context = github!.context;
  const payload = context!.payload;
  const action = payload!.action || '';

  core.info('The event type is: ' + context.eventName);
  if ('issue_comment' !== context.eventName  || !payload!.issue!.pull_request) {
    core.info('The payload is not an issue_comment on a pull request');
    return;
  }
  
  if (!_.includes(['created', 'edited'], action)) {
    core.info('The action didn\'t create or edit a comment');
    return;
  }
  core.info('The action is: ' + action);

  const comment = payload.comment.body;
  core.info('The comment is: ' + comment);

  const commentFirstLine = comment.split("\r", 1)
  core.info('The first line is: ' + commentFirstLine);

  const octaneCommand = stringArgv(commentFirstLine);
  core.info(octaneCommand.toString());
  if (_.nth(octaneCommand, 0) !== "/octane") {
    core.info('Comment does not start with /octane');
    return;
  }

  const requestedAction = _.nth(octaneCommand, 1);
  const requestedType = _.nth(octaneCommand, 2);

  const titleIndex = _.indexOf(octaneCommand, '--title');
  const requestedTitle = titleIndex > 0 ? _.nth(octaneCommand, titleIndex + 1) : payload!.issue!.title;

  const templateIndex = _.indexOf(octaneCommand, '--template');
  const templateName = templateIndex > 0 ? _.nth(octaneCommand, templateIndex + 1) : 'default';
  const octaneConfig = _.merge(_.get(config, 'default'), _.get(config, templateName))

  if (requestedAction === ActionMethods.help) {
    githubComment(gitHubClient, context, getHelp());
    return;
  } else if (!(requestedAction === ActionMethods.create && _.includes(EntityTypes, requestedType))) {
    core.info('Comment does not contain correct Octane actions or types');
    return;
  }
  
  core.info('action: ' + requestedAction);
  core.info('type: ' + requestedType);
  core.info('title: ' + requestedTitle);

  core.info('octaneServer: ' + octaneServer);
  const octaneConn = new octane.Octane({
    server: octaneServer,
    sharedSpace: octaneSharedSpace,
    workspace: octaneWorkspace,
    user: octaneUser,
    password: octanePassword,
    headers: {
      ALM_OCTANE_TECH_PREVIEW: true
    }
  });
  
  let entityObject;
  switch (requestedType) {
    case EntityTypes.STORY: {
      entityObject = new Story(requestedTitle);
      break;
    }
    case EntityTypes.DEFECT: {
      entityObject = new Defect(requestedTitle);
      break;
    }
    case EntityTypes.QUALITY: {
      entityObject = new Quality(requestedTitle);
      break;
    }
    default: {
      throw "Entity type not supported";
    }
  }
  entityObject.mergeApiConfig(_.get(octaneConfig, entityObject.type, {}));
  core.info(entityObject.title);
  core.info(JSON.stringify(entityObject.apiObject));

  const creationObj = await octaneConn.create(entityObject.octaneType, entityObject.apiObject).fields('id').execute();
  core.info('Creation response: ' + JSON.stringify(creationObj));

  if (creationObj.total_count === 1) {
    const createdId = creationObj.data[0].id;
    core.info("Created id: " + createdId);

    const entityUrl = octaneServer + "/ui/entity-navigation?p=" + octaneSharedSpace + "/" + octaneWorkspace + "&entityType=work_item&id=" + createdId;
    const comment = _.assign(github.context.repo, {
      issue_number: payload!.issue!.number,
      body: entityObject.description + " [" + createdId + "](" + entityUrl + ") has been created!"
    });
    core.info('Generated Comment: ' + JSON.stringify(comment));
    gitHubClient.issues.createComment(comment);
  }
}

run();

export default run;