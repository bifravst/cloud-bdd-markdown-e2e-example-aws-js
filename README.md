# BDD Feature Runner for AWS Examples

[![GitHub Actions](https://github.com/NordicSemiconductor/cloud-bdd-markdown-e2e-example-aws-js/workflows/Test%20and%20Release/badge.svg)](https://github.com/NordicSemiconductor/cloud-bdd-markdown-e2e-example-aws-js/actions)
[![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg)](https://github.com/semantic-release/semantic-release)
[![Renovate](https://img.shields.io/badge/renovate-enabled-brightgreen.svg)](https://renovatebot.com)
[![@commitlint/config-conventional](https://img.shields.io/badge/%40commitlint-config--conventional-brightgreen)](https://github.com/conventional-changelog/commitlint/tree/master/@commitlint/config-conventional)
[![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg)](https://github.com/prettier/prettier/)
[![ESLint: TypeScript](https://img.shields.io/badge/ESLint-TypeScript-blue.svg)](https://github.com/typescript-eslint/typescript-eslint)

Example use of
[@nordicsemiconductor/bdd-markdown](https://www.npmjs.com/package/@nordicsemiconductor/bdd-markdown).

    npm ci           # install dependencies
    npx cdk deploy   # deploy the stack to your AWS account
    npm test         # run the tests

_Note: AWS CDK follows the AWS SDK way of authenticating. See
[this guide](https://docs.aws.amazon.com/cdk/v2/guide/getting_started.html) to
learn more._

## Webhook receiver

The [`Webhook.feature.md`](./features/Webhook.feature.md) shows how to use AWS
ApiGateway, Lambda and SQS to set up a real test double for a webhook endpoint.
It allows to test that a component which is supposed to send a webhook is
actually sending it.

## Set up CD

You need to create a
[developer token](https://help.github.com/en/articles/creating-a-personal-access-token-for-the-command-line)
with `repo` and `admin:repo_hook` permissions for an account that has write
permissions to your repository.

You need to store this token in AWS ParameterStore which is a **one-time**
manual step done through the AWS CLI:

    aws ssm put-parameter --name /codebuild/github-token --type String --value <Github Token>
    aws ssm put-parameter --name /codebuild/github-username --type String --value <Github Username>

Then set up the continuous deployment:

    npx tsx cdk/cloudformation-cd.ts deploy

## Architecture decision records (ADRs)

see [./adr](./adr).
