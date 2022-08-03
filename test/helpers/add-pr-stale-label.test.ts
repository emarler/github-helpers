/*
Copyright 2021 Expedia, Inc.
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

import { STALE, LATE_REVIEW } from '../../src/constants';
import { addPrStaleLabel } from '../../src/helpers/add-pr-stale-label';
import { octokit } from '../../src/octokit';

jest.mock('@actions/core');
jest.mock('@actions/github', () => ({
  getOctokit: jest.fn(() => ({
    rest: {
      issues: {
        addLabels: jest.fn()
      },
      pulls: {
        list: jest.fn().mockReturnValue({
          header:"",
          status:"",
          url:"",
          data: [
            {
              id: 123
            }
          ]
        }),
        get: jest.fn().mockReturnValueOnce({
          header:"",
          status:"",
          url:"",
          data: {
            updated_at: "2022-07-25T07:00:00.000Z",
            mergeable_state: "blocked"
          }
        }).mockReturnValueOnce({
          header:"",
          status:"",
          url:"",
          data: {
            updated_at: "2022-06-25T07:00:00.000Z",
            mergeable_state: "unknown"
          }
        }).mockReturnValueOnce({
          header:"",
          status:"",
          url:"",
          data: {
            updated_at: "2022-07-25T07:00:00.000Z",
            mergeable_state: "behind"
          }
        })
      }
    }
  }))
}));

describe('addPrStaleLabel', () => {
  jest.setTimeout(9999999);
  describe('Late Review', () => {
    const owner = "owner";
    const repo = "repo";


    it('should add Late Review label to the pr', async () => {
      await addPrStaleLabel({
        owner,
        repo
      });

      expect(octokit.pulls.list).toHaveBeenCalledWith({
        owner: "owner",
        repo: "repo",
        state: "open"
      });

      expect(octokit.pulls.get).toHaveBeenCalledWith({
        owner: "owner",
        repo: "repo",
        pull_number: 123
      });

      expect(octokit.issues.addLabels).toHaveBeenCalledWith({
        labels: [LATE_REVIEW],
        issue_number: 123,
        repo: "repo",
        owner: "owner"
      });
    });

    it('should add Stale label to the pr', async () => {
      await addPrStaleLabel({
        owner,
        repo
      });
      
      expect(octokit.pulls.list).toHaveBeenCalledWith({
        owner: "owner",
        repo: "repo",
        state: "open"
      });

      expect(octokit.pulls.get).toHaveBeenCalledWith({
        owner: "owner",
        repo: "repo",
        pull_number: 123
      });

      expect(octokit.issues.addLabels).toHaveBeenCalledWith({
        labels: [STALE],
        issue_number: 123,
        repo: "repo",
        owner: "owner"
      });
    });

    it('should not add any labels to the pr', async () => {
      await addPrStaleLabel({
        owner,
        repo
      });
      
      expect(octokit.pulls.list).toHaveBeenCalledWith({
        owner: "owner",
        repo: "repo",
        state: "open"
      });
      
      expect(octokit.pulls.get).toHaveBeenCalledWith({
        owner: "owner",
        repo: "repo",
        pull_number: 123
      });

      expect(octokit.issues.addLabels).not.toHaveBeenCalledWith();
    });
  });
});