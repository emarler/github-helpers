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

import { run } from '../src/main';
import * as core from '@actions/core';
import { getActionInputs } from '../src/utils/get-action-inputs';
import { createPrComment } from '../src/helpers/create-pr-comment';
import { getInput } from '@actions/core';

jest.mock('@actions/core');
jest.mock('@actions/github', () => ({
  context: { repo: { repo: 'repo', owner: 'owner' } },
  getOctokit: jest.fn(() => ({ rest: { issues: { createComment: jest.fn() } } }))
}));
jest.mock('../src/utils/get-action-inputs');
jest.mock('../src/helpers/create-pr-comment');
const helper = 'create-pr-comment';
const otherInputs = {
  my: 'input',
  another: 'input'
};
const output = 'some output';
(getInput as jest.Mock).mockReturnValue(helper);
(getActionInputs as jest.Mock).mockReturnValue(otherInputs);
(createPrComment as jest.Mock).mockResolvedValue(output);

describe('main', () => {
  beforeEach(async () => {
    await run();
  });

  it('should call helper with all inputs', () => {
    expect(createPrComment).toHaveBeenCalledWith(otherInputs);
  });

  it('should set output', () => {
    expect(core.setOutput).toHaveBeenCalledWith('output', output);
  });
});
