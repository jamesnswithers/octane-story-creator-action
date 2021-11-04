import * as _ from 'lodash';
import * as core from '@actions/core';
import * as github from '@actions/github';
import stringArgv from 'string-argv'
import * as octane from '@microfocus/alm-octane-js-rest-sdk'
import { getConfig } from './config'

const octaneActions = ['create']
const octaneStoryTypes = ['story', 'defect', 'quality']

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
  core.info(config);

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
  core.debug('The action is: ' + action);

  const comment = payload.comment.body;
  core.debug('The comment is: ' + comment);

  const commentFirstLine = comment.split("\r", 1)
  core.debug('The first line is: ' + commentFirstLine);

  const octaneCommand = stringArgv(commentFirstLine);
  if (octaneCommand[0] !== "/octane") {
    core.info('Comment does not start with /octane');
    return;
  }

  const requestedAction = octaneCommand[1];
  const requestedType = octaneCommand[2];
  const requestedTitle = _.defaultTo(_.nth(octaneCommand, 3), payload!.issue!.title);

  core.info(octaneCommand.toString());
  if (!(_.includes(octaneActions, requestedAction) && _.includes(octaneStoryTypes, requestedType))) {
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
  
  let octaneEntity, octaneEntityType, createdComment;
  if (requestedType === "defect") {
    octaneEntity = {
      name: requestedTitle
    };
    if (_.hasIn(config , 'defect')) {
      core.info(_.get(config, 'defect'));
      _.merge(octaneEntity, _.get(config, 'defect'));
      core.info(_.get(octaneEntity, 'defect'));
    }
    octaneEntityType = octane.Octane.entityTypes.defects;
    createdComment = "Defect";
  } else if (requestedType === "story") {
    octaneEntity = {
      name: requestedTitle
    };
    if (_.hasIn(config , 'story')) {
      _.merge(octaneEntity, _.get(config, 'story'));
    }
    octaneEntityType = octane.Octane.entityTypes.stories;
    createdComment = "Story";
  } else if (requestedType === "quality") {
    octaneEntity = {
      name: requestedTitle
    };
    if (_.hasIn(config , 'quality')) {
      _.merge(octaneEntity, _.get(config, 'quality'));
    }
    octaneEntityType = octane.Octane.entityTypes.qualityStories;
    createdComment = "Quality Story";
  }

  const creationObj = await octaneConn.create(octaneEntityType, octaneEntity).fields('id').execute();
  core.debug('Creation response: ' + JSON.stringify(creationObj));

  if (creationObj.total_count === 1) {
    const createdId = creationObj.data[0].id;
    core.info("Created id: " + createdId);

    const entityUrl = octaneServer + "/ui/entity-navigation?p=" + octaneSharedSpace + "/" + octaneWorkspace + "&entityType=work_item&id=" + createdId;
    gitHubClient.issues.createComment(
      Object.assign(
        Object.assign({}, github.context.repo),
        {
          issue_number: payload!.issue!.number,
          body: createdComment + " [" + createdId + "](" + entityUrl + ") has been created!"
        }
      )
    );
  }
}

run();

export default run;