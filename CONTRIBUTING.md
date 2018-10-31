# Contributing

Welcome to the Databyss team. We're happy you are present, although [presence has been deconstructed](http://www.returntocinder.com/motif/presence) so [question](https://databyssorg.slack.com) everything you see here!

## Getting started

Always work from a local fork and submit changes via pull request.

1.  Fork the databyss repository on Github
2.  Clone your fork to your local machine `git clone git@github.com:<yourname>/databyss.git`
3.  Create a branch `git checkout -b my-topic-branch`
4.  Make your changes, lint, then push to to GitHub with `git push --set-upstream origin my-topic-branch`.
5.  Visit GitHub and make your pull request.

## Coding style

Please follow the coding style and directory patterns of the current codebase. We use eslint, so if possible, enable linting in your editor to get real-time feedback. The linting rules are also run when Webpack recompiles your changes, and can be run manually with `yarn lint`. You should run `yarn lint` and fix any problems _before_ submitting your pull request.

We also use `prettier` rules to maintain consistent, readable code. Try to enable prettier linting and "format on save" if you can for more real-time feedback.

## Writing tests

You may write unit tests for your code and components by creating `*.test.js` files anywhere within the repo. For functional testing, we use [StoryShots](https://storybook.js.org/testing/structural-testing/). This creates [Jest snapshots](https://jestjs.io/docs/en/snapshot-testing) for any Storybook story defined in the codebase.

Please familiarize yourself with [Storybook](https://storybook.js.org/) and create stories for your work if you are working on a _module_. For example, the [Landing](packages/skilltype-ui/modules/Landing/Landing.js) component is a _module_ because it represents a route in the app that renders "fullscreen" - so in other words a "screen unit" of the app.

During testing, StoryShot renders the story to HTML and compares the rendered markup to the markup in the snapshot stored from an earlier test run. If you review the differences and everything looks ok, it give you a chance to confirm the changes and update the snapshot. You must do this before submitting your PR, because the CI will reject the changes if the snapshots are out of date.

## Happy coding!

See you on the [Slack](https://databyssorg.slack.com/#dev)
