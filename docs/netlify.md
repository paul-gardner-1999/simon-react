# Netlify deployment

The app is hosted on [Netlify](https://www.netlify.com) and deployed automatically from GitHub. There is no GitHub Actions workflow involved — builds run on Netlify's infrastructure.

| | |
|---|---|
| Production site | https://simon-react.netlify.app |
| Netlify dashboard | https://app.netlify.com/projects/simon-react |
| Deploy history and logs | https://app.netlify.com/projects/simon-react/deploys |
| Build configuration | [`netlify.toml`](../netlify.toml) |

## How deploys are triggered

The repository is connected to Netlify through the [Netlify GitHub App](https://github.com/apps/netlify). GitHub notifies Netlify of repository events, and Netlify decides what to build:

| Event | Result |
|---|---|
| Push or merge to `main` (the production branch) | **Production deploy** to https://simon-react.netlify.app |
| Pull request opened or updated | **Deploy preview** at `https://deploy-preview-<PR number>--simon-react.netlify.app` |
| Push to any other branch | Nothing by default; [branch deploys](https://docs.netlify.com/deploy/deploy-types/branch-deploys/) can be enabled in the dashboard |

A branch without an open pull request does not get a preview. Every push to a PR branch rebuilds that PR's preview.

## The build

For each deploy, Netlify:

1. Clones the commit.
2. Installs dependencies with npm (from `package-lock.json`).
3. Runs `npm run build` (`tsc -b && vite build`) on Node 24.
4. Publishes the `dist/` directory.

These settings come from [`netlify.toml`](../netlify.toml), which [takes precedence over](https://docs.netlify.com/build/configure-builds/file-based-configuration/) the build settings in the Netlify dashboard:

```toml
[build]
  command = "npm run build"
  publish = "dist"

[build.environment]
  NODE_VERSION = "24"
```

The dashboard settings were originally configured for Create React App (publish directory `build`, an older Node). The toolchain now needs Node ≥ 22.12 (Vite, Vitest, jsdom), so keep `NODE_VERSION` in `netlify.toml` in step with the `node` image in the [`Dockerfile`](../Dockerfile). See [Manage build dependencies](https://docs.netlify.com/build/configure-builds/manage-dependencies/) for how Netlify selects the Node version.

The app is a single page with no client-side routing, so no redirect or header rules are configured.

## Pull request checks

Netlify reports back to each pull request with:

| Check | Meaning |
|---|---|
| `netlify/simon-react/deploy-preview` | Whether the preview built and deployed; links to the preview when ready |
| Header rules | Reports changes to [custom headers](https://docs.netlify.com/manage/routing/headers/); shows *skipping* when there are none |
| Redirect rules | Reports changes to [redirects](https://docs.netlify.com/manage/routing/redirects/overview/); shows *skipping* when there are none |
| Pages changed | Lists changed pages; shows *skipping* when there is nothing to report |

If the deploy itself fails, all four checks fail together. Check the deploy log first.

## Troubleshooting a failed deploy

1. Open the failing check's **Details** link, or find the deploy at https://app.netlify.com/projects/simon-react/deploys, and read the build log. (The log requires a Netlify login and is not exposed by Netlify's public API.)
2. Reproduce the build locally the way Netlify runs it:

   ```sh
   rm -rf dist && CI=true npm ci && CI=true npm run build
   ```

   `npm ci` installs exactly what is in `package-lock.json`, so a lockfile out of sync with `package.json` fails here just as it does on Netlify. If this passes, compare your local Node version with `NODE_VERSION`.
3. If the build succeeds but the site is empty or 404s, check that the publish directory is `dist`.

See also Netlify's [build troubleshooting tips](https://docs.netlify.com/build/configure-builds/troubleshooting-tips/).

## Further reading

- [Deploy overview](https://docs.netlify.com/deploy/deploy-overview/)
- [Deploy previews](https://docs.netlify.com/deploy/deploy-types/deploy-previews/)
- [Manage deploys](https://docs.netlify.com/deploy/manage-deploys/manage-deploys-overview/) (rollbacks, locking a deploy)
- [Repository permissions and linking](https://docs.netlify.com/build/git-workflows/repo-permissions-linking/)
- [Ignore builds](https://docs.netlify.com/build/configure-builds/ignore-builds/) (skip deploys for docs-only changes, for example)
- [Environment variables](https://docs.netlify.com/build/configure-builds/environment-variables/)
- [Vite on Netlify](https://docs.netlify.com/build/frameworks/framework-setup-guides/vite/)
