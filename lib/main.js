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
Object.defineProperty(exports, "__esModule", { value: true });
const _ = __importStar(require("lodash"));
const core = __importStar(require("@actions/core"));
const github = __importStar(require("@actions/github"));
const parseArgs = __importStar(require("minimist"));
const run = () => __awaiter(void 0, void 0, void 0, function* () {
    core.debug('👋 Hello! You are an amazing person! 🙌');
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
    core.info('The action is: ' + action);
    const comment = payload.comment.body;
    core.info('The comment is: ' + comment);
    const commentFirstLine = comment.split("\r", 1);
    core.info('The first line is: ' + commentFirstLine);
    if (commentFirstLine[0] !== "/octane") {
        core.info('Comment does not start with /octane');
        return;
    }
    const octaneCommand = parseArgs(comment);
    core.info(octaneCommand);
});
run();
exports.default = run;
