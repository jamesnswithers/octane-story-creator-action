import * as _ from 'lodash';
import * as core from '@actions/core';
import * as github from '@actions/github';

const run = async (): Promise<void> => {
  core.debug('👋 Hello! You are an amazing person! 🙌')

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
}

run();

export default run;