/*
Copyright 2022 Expedia, Inc.
Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at
    https://www.apache.org/licenses/LICENSE-2.0
Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

import { LATE_REVIEW } from '../constants';
import { HelperInputs } from '../types/generated';
import { octokit } from '../octokit';
import { RestEndpointMethodTypes } from '@octokit/rest';
import { map } from "bluebird";

type PullResponseType = RestEndpointMethodTypes["pulls"]["get"]["response"];
type ListResponseType = RestEndpointMethodTypes["pulls"]["list"]["response"];

export class AddPrLateReviewLabels extends HelperInputs {
  owner = '';
  repo = '';
}

export const addPrLateReviewLabels = async ({ owner, repo }: AddPrLateReviewLabels) => {
  // Get all pull requests
  const pull_requests = await octokit.pulls.list({
    owner: owner,
    repo: repo,
    state: "open"
  }) as ListResponseType;

  const pr_data = pull_requests.data;

  // Loop through all of the issue numbers
  map(pr_data, async pull_request =>
    labelPullRequest( 
      pull_request,
      owner,
      repo
    )
  );
    
};

const labelPullRequest = async ( pull_request: any, owner: string, repo: string) => {
  const pr = parseInt(pull_request.id);
  // Get the PR
  const pull_request_data = await octokit.pulls.get({
      owner: owner,
      repo: repo,
      pull_number: pr
    }) as PullResponseType;

  // Checks if the PR is within the Late Review timeframe
  if (!pull_request_data || !await isLabelNeeded(pull_request_data.data)) {
    return;
  } 

  // Only update labels if its qualified for label
  octokit.issues.addLabels({
    labels: [LATE_REVIEW],
    issue_number: pr,
    owner: owner,
    repo: repo
  });
}

const isLabelNeeded = async ( { mergeable_state, updated_at}: any ) => {
  if (!mergeable_state || !updated_at) {
    return false;
  }

  const last_updated = new Date( updated_at );
  const now = new Date();
  const age = now.getTime() - last_updated.getTime();

  const days = 2;
  const state = "blocked";

  return age > 86400000 * days && mergeable_state == state;
}
