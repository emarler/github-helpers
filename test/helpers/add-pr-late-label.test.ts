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

import { LATE_REVIEW } from '../../src/constants';
import { addPrLateReviewLabels } from '../../src/helpers/add-pr-late-label';
import { octokit } from '../../src/octokit';

describe('addPrLateReviewLabels', () => {
  const mockList = jest.fn();
  jest.mock('@actions/core');
  jest.mock('@actions/github', () => ({
    getOctokit: jest.fn(() => ({
      rest: {
        issues: {
          addLabels: jest.fn()
        },
        pulls: {
          list: mockList
        }
      }
    }))
  }));

  jest.spyOn(Date, 'now').mockImplementation(() => new Date('2022-08-04T10:00:00Z').getTime());

  describe('Late Review', () => {
    const owner = "owner";
    const repo = "repo";


    it('should add Late Review label to the pr', async () => {
      mockList.mockReturnValueOnce({
        status: "200",
        data: [
          {
            id: 123,
            requested_reviewers: [{id:234}]
          }
        ]
      }).mockReturnValueOnce({
        status: "200",
        data: []
      });

      await addPrLateReviewLabels({
        owner,
        repo
      });

      expect(octokit.pulls.list).toHaveBeenCalledWith({
        owner: "owner",
        page: 1,
        per_page: 100,
        repo: "repo",
        sort: "created",
        state: "open"
      });

      expect(octokit.pulls.list).toHaveBeenCalledWith({
        owner: "owner",
        page: 2,
        per_page: 100,
        repo: "repo",
        sort: "created",
        state: "open"
      });

      expect(octokit.issues.addLabels).toHaveBeenCalledWith({
        labels: [LATE_REVIEW],
        issue_number: 123,
        repo: "repo",
        owner: "owner"
      });
    });

    it('should not add any labels to the pr', async () => {
      mockList.mockReturnValueOnce({
        status: "200",
        data: [
          {
            id: 123,
            requested_reviewers: [{id:234}]
          }
        ]
      }).mockReturnValueOnce({
        status: "200",
        data: []
      });

      await addPrLateReviewLabels({
        owner,
        repo
      });

      expect(octokit.pulls.list).toHaveBeenCalledWith({
        owner: "owner",
        page: 1,
        per_page: 100,
        repo: "repo",
        sort: "created",
        state: "open"
      });

      expect(octokit.pulls.list).toHaveBeenCalledWith({
        owner: "owner",
        page: 2,
        per_page: 100,
        repo: "repo",
        sort: "created",
        state: "open"
      });

      expect(octokit.issues.addLabels).not.toHaveBeenCalledWith();
    });
  });
});
