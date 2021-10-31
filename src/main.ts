import * as _ from 'lodash';
import * as core from '@actions/core';
import * as github from '@actions/github';
import stringArgv from 'string-argv'
import * as octane from '@microfocus/alm-octane-js-rest-sdk'

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
  const requestedTitle = octaneCommand[3];

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
  
  let octaneEntity, octaneEntityType;
  if (requestedType === "defect") {
    octaneEntity = {
      name: requestedTitle,
      description: 'some description here'
    };
    octaneEntityType = octane.Octane.entityTypes.defects;
  } else if (requestedType === "story") {
    octaneEntity = {
      name: requestedTitle,
      description: 'some description here'
    };
    octaneEntityType = octane.Octane.entityTypes.stories;
  } else if (requestedType === "quality") {
    octaneEntity = {
      name: requestedTitle,
      description: 'some description here'
    };
    octaneEntityType = octane.Octane.entityTypes.qualities;
  }
  const creationObj = await octaneConn.create(octaneEntityType, octaneEntity).fields('id').execute();
  core.debug('Creation response: ' + JSON.stringify(creationObj));
  if (creationObj.total_count === 1) {
    const createdId = creationObj.data[0].id;
    core.info("Created id: " + createdId);
    gitHubClient.issues.createComment(
      Object.assign(
        Object.assign({}, github.context.repo),
        {
          issue_number: payload!.issue!.pull_request!.number,
          body: "OCTANE-US" + createdId + "; https://" + octaneServer + "/ui/entity-navigation?p=" + octaneSharedSpace + "/" + octaneWorkspace + "&entityType=work_item&id=" + createdId
        }
      )
    );
  }
}

run();

export default run;