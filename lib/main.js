"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const _ = __importStar(require("lodash"));
const core = __importStar(require("@actions/core"));
const github = __importStar(require("@actions/github"));
const string_argv_1 = __importDefault(require("string-argv"));
const octane = __importStar(require("@microfocus/alm-octane-js-rest-sdk"));
const octaneActions = ['create'];
const octaneStoryTypes = ['story', 'defect', 'quality'];
const { SERVER: octaneServer, SHARED_SPACE: octaneSharedSpace, WORKSPACE: octaneWorkspace, USER: octaneUser, PASSWORD: octanePassword, GITHUB_TOKEN: githubToken = "" } = process.env;
const run = () => __awaiter(void 0, void 0, void 0, function* () {
    const gitHubClient = new github.GitHub(githubToken);
    const context = github.context;
    const payload = context.payload;
    const action = payload.action || '';
    core.info('The event type is: ' + context.eventName);
    if ('issue_comment' !== context.eventName || !payload.issue.pull_request) {
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
    const commentFirstLine = comment.split("\r", 1);
    core.debug('The first line is: ' + commentFirstLine);
    const octaneCommand = string_argv_1.default(commentFirstLine);
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
    let octaneEntity, octaneEntityType, createdComment;
    if (requestedType === "defect") {
        octaneEntity = {
            name: requestedTitle,
            description: 'some description here'
        };
        octaneEntityType = octane.Octane.entityTypes.defects;
        createdComment = "Defect [OCTANE-DE";
    }
    else if (requestedType === "story") {
        octaneEntity = {
            name: requestedTitle,
            description: 'some description here'
        };
        octaneEntityType = octane.Octane.entityTypes.stories;
        createdComment = "Story [OCTANE-US";
    }
    else if (requestedType === "quality") {
        octaneEntity = {
            name: requestedTitle,
            description: 'some description here'
        };
        octaneEntityType = octane.Octane.entityTypes.qualityStories;
        createdComment = "Quality Story [OCTANE-QS";
    }
    const creationObj = yield octaneConn.create(octaneEntityType, octaneEntity).fields('id').execute();
    core.debug('Creation response: ' + JSON.stringify(creationObj));
    if (creationObj.total_count === 1) {
        const createdId = creationObj.data[0].id;
        core.info("Created id: " + createdId);
        const entityUrl = octaneServer + "/ui/entity-navigation?p=" + octaneSharedSpace + "/" + octaneWorkspace + "&entityType=work_item&id=" + createdId;
        gitHubClient.issues.createComment(Object.assign(Object.assign({}, github.context.repo), {
            issue_number: payload.issue.number,
            body: createdComment + createdId + "](" + entityUrl + ") has been created!"
        }));
    }
});
run();
exports.default = run;
