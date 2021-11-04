import * as github from '@actions/github';

const CONFIG_FILE = '.github/octane-story-creator.json';

/**
 * Loads the json configuration file from GitHub
 *
 * @param {object} gitHubClient An authenticated GitHub context
 * @param {object} params Params to fetch the file with
 * @returns {Promise<object>} The parsed JSON file
 * @async
 */
async function loadJsonConfig(gitHubClient, params) {
  const response = await gitHubClient.repos.getContents(params);
  if (typeof response.data.content !== 'string') {
    return
  }
  return JSON.parse(Buffer.from(response.data.content, 'base64').toString()) || {}
}

/**
 * Loads the specified config file from the context's repository
 *
 * If the config file does not exist in the context's repository, `null`
 * is returned.
 *
 * @param {object} gitHubClient An authenticated GitHub context
 * @returns {object} The merged configuration
 * @async
 */
export async function getConfig(gitHubClient) {
  const params = Object.assign(Object.assign({}, github.context.repo), { path: CONFIG_FILE })
  return await loadJsonConfig(gitHubClient, params);
}