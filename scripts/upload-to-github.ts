import { Octokit } from '@octokit/rest';
import * as fs from 'fs';
import * as path from 'path';

let connectionSettings: any;

async function getAccessToken() {
  if (connectionSettings && connectionSettings.settings.expires_at && new Date(connectionSettings.settings.expires_at).getTime() > Date.now()) {
    return connectionSettings.settings.access_token;
  }
  
  const hostname = process.env.REPLIT_CONNECTORS_HOSTNAME;
  const xReplitToken = process.env.REPL_IDENTITY 
    ? 'repl ' + process.env.REPL_IDENTITY 
    : process.env.WEB_REPL_RENEWAL 
    ? 'depl ' + process.env.WEB_REPL_RENEWAL 
    : null;

  if (!xReplitToken) {
    throw new Error('X_REPLIT_TOKEN not found');
  }

  connectionSettings = await fetch(
    'https://' + hostname + '/api/v2/connection?include_secrets=true&connector_names=github',
    {
      headers: {
        'Accept': 'application/json',
        'X_REPLIT_TOKEN': xReplitToken
      }
    }
  ).then(res => res.json()).then(data => data.items?.[0]);

  const accessToken = connectionSettings?.settings?.access_token || connectionSettings.settings?.oauth?.credentials?.access_token;

  if (!connectionSettings || !accessToken) {
    throw new Error('GitHub not connected');
  }
  return accessToken;
}

async function getGitHubClient() {
  const accessToken = await getAccessToken();
  return new Octokit({ auth: accessToken });
}

const ignorePaths = [
  'node_modules',
  '.git',
  '.cache',
  '.config',
  '.npm',
  '.replit',
  'attached_assets',
  '.upm',
  'generated-icon.png',
  '.nix',
  'replit.nix'
];

function shouldIgnore(filePath: string): boolean {
  return ignorePaths.some(p => filePath.includes(p));
}

function getAllFiles(dir: string, files: string[] = []): string[] {
  const items = fs.readdirSync(dir);
  for (const item of items) {
    const fullPath = path.join(dir, item);
    if (shouldIgnore(fullPath)) continue;
    
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      getAllFiles(fullPath, files);
    } else {
      files.push(fullPath);
    }
  }
  return files;
}

async function main() {
  const repoName = 'magic-mastery-quiz-replit';
  const owner = 'lokeshgithub';
  
  console.log('Getting GitHub client...');
  const octokit = await getGitHubClient();
  
  console.log('Collecting files...');
  const files = getAllFiles('.');
  console.log(`Found ${files.length} files to upload`);
  
  console.log('Uploading files using Contents API (this works for empty repos)...');
  let count = 0;
  let failed = 0;
  
  for (const file of files) {
    const content = fs.readFileSync(file);
    const relativePath = file.startsWith('./') ? file.slice(2) : file;
    
    try {
      await octokit.repos.createOrUpdateFileContents({
        owner,
        repo: repoName,
        path: relativePath,
        message: `Add ${relativePath}`,
        content: content.toString('base64'),
        branch: 'main',
      });
      count++;
      if (count % 5 === 0) {
        console.log(`Uploaded ${count}/${files.length} files...`);
      }
    } catch (e: any) {
      if (e.status === 422 && e.message.includes('sha')) {
        try {
          const { data: existingFile } = await octokit.repos.getContent({
            owner,
            repo: repoName,
            path: relativePath,
          });
          const sha = (existingFile as any).sha;
          
          await octokit.repos.createOrUpdateFileContents({
            owner,
            repo: repoName,
            path: relativePath,
            message: `Update ${relativePath}`,
            content: content.toString('base64'),
            sha,
            branch: 'main',
          });
          count++;
        } catch (e2: any) {
          console.log(`Failed to update ${relativePath}: ${e2.message}`);
          failed++;
        }
      } else {
        console.log(`Failed to upload ${relativePath}: ${e.message}`);
        failed++;
      }
    }
  }
  
  console.log(`\nDone! Uploaded ${count} files, ${failed} failed.`);
  console.log(`Your code is now at: https://github.com/${owner}/${repoName}`);
}

main().catch(console.error);
