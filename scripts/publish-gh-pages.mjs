import {
  cpSync,
  existsSync,
  mkdtempSync,
  readdirSync,
  rmSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { basename, join, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';

const remoteUrl = 'https://github.com/Esaluter/observatory.git';
const branch = 'gh-pages';
const dryRun = process.argv.includes('--dry-run');
const projectRoot = resolve(import.meta.dirname, '..');
const distDir = join(projectRoot, 'dist');

function runGit(cwd, args, { allowFailure = false } = {}) {
  const result = spawnSync('git', args, {
    cwd,
    encoding: 'utf8',
    shell: false,
    stdio: ['ignore', 'pipe', 'pipe'],
  });

  if (result.error) {
    throw result.error;
  }

  if (result.status !== 0 && !allowFailure) {
    const detail = result.stderr.trim() || result.stdout.trim();
    throw new Error(`git ${args[0]} failed${detail ? `: ${detail}` : ''}`);
  }

  return {
    status: result.status,
    stdout: result.stdout.trim(),
    stderr: result.stderr.trim(),
  };
}

function requireBuild() {
  if (!existsSync(join(distDir, 'index.html'))) {
    throw new Error('dist/index.html not found. Run npm run build first.');
  }

  if (!existsSync(join(distDir, '.nojekyll'))) {
    throw new Error('dist/.nojekyll not found. Run npm run build first.');
  }

  if (existsSync(join(distDir, '.git'))) {
    throw new Error('Refusing to publish: dist must not contain a .git directory.');
  }
}

function readIdentity() {
  const name = runGit(projectRoot, ['config', 'user.name'], {
    allowFailure: true,
  }).stdout;
  const email = runGit(projectRoot, ['config', 'user.email'], {
    allowFailure: true,
  }).stdout;

  if (!name || !email) {
    throw new Error(
      'Git user.name and user.email must be configured before publishing.',
    );
  }

  return { name, email };
}

function copyBuild(targetDir) {
  for (const entry of readdirSync(distDir, { withFileTypes: true })) {
    cpSync(join(distDir, entry.name), join(targetDir, entry.name), {
      recursive: true,
      force: true,
    });
  }
}

function main() {
  requireBuild();

  const temporaryRepository = mkdtempSync(join(tmpdir(), 'observatory-pages-'));

  try {
    copyBuild(temporaryRepository);
    runGit(temporaryRepository, ['init', '--quiet']);
    runGit(temporaryRepository, [
      'symbolic-ref',
      'HEAD',
      `refs/heads/${branch}`,
    ]);
    runGit(temporaryRepository, ['add', '-A']);

    const tree = runGit(temporaryRepository, ['write-tree']).stdout;
    const files = runGit(temporaryRepository, ['ls-files']).stdout
      .split(/\r?\n/u)
      .filter(Boolean);

    if (!files.includes('.nojekyll')) {
      throw new Error('.nojekyll was not staged for publication.');
    }

    console.log(`Prepared ${files.length} files from ${basename(distDir)}.`);

    if (dryRun) {
      console.log(`Dry run complete. Content tree: ${tree}`);
      return;
    }

    const identity = readIdentity();
    runGit(temporaryRepository, ['config', 'user.name', identity.name]);
    runGit(temporaryRepository, ['config', 'user.email', identity.email]);
    runGit(temporaryRepository, ['remote', 'add', 'origin', remoteUrl]);

    const remoteHead = runGit(
      temporaryRepository,
      ['ls-remote', '--heads', 'origin', branch],
    ).stdout;
    let parent = '';

    if (remoteHead) {
      parent = remoteHead.split(/\s+/u)[0];
      runGit(temporaryRepository, [
        'fetch',
        '--quiet',
        '--depth=1',
        'origin',
        `refs/heads/${branch}`,
      ]);

      const remoteTree = runGit(temporaryRepository, [
        'rev-parse',
        'FETCH_HEAD^{tree}',
      ]).stdout;

      if (remoteTree === tree) {
        console.log('gh-pages already contains this build; nothing to publish.');
        return;
      }
    }

    const commitArgs = ['commit-tree', tree, '-m', 'Deploy Observatory'];
    if (parent) {
      commitArgs.push('-p', parent);
    }

    const commit = runGit(temporaryRepository, commitArgs).stdout;
    runGit(temporaryRepository, [
      'push',
      'origin',
      `${commit}:refs/heads/${branch}`,
    ]);
    console.log(`Published ${commit.slice(0, 12)} to ${branch}.`);
  } finally {
    const expectedPrefix = join(tmpdir(), 'observatory-pages-');
    if (temporaryRepository.startsWith(expectedPrefix)) {
      rmSync(temporaryRepository, { recursive: true, force: true });
    }
  }
}

try {
  main();
} catch (error) {
  console.error(`Publication failed: ${error.message}`);
  process.exitCode = 1;
}
