import { Octokit } from '@octokit/rest';

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

async function main() {
  const repoName = process.argv[2] || 'magic-mastery-quiz-replit';
  
  console.log('Getting GitHub client...');
  const octokit = await getGitHubClient();
  
  console.log('Getting authenticated user...');
  const { data: user } = await octokit.users.getAuthenticated();
  console.log(`Authenticated as: ${user.login}`);
  
  console.log(`Creating repository: ${repoName}...`);
  try {
    await octokit.repos.createForAuthenticatedUser({
      name: repoName,
      description: 'Magic Mastery Quiz - Educational quiz app migrated from Lovable to Replit',
      private: false,
      auto_init: false,
    });
    console.log(`Repository created: https://github.com/${user.login}/${repoName}`);
  } catch (error: any) {
    if (error.status === 422) {
      console.log(`Repository ${repoName} already exists, will push to it.`);
    } else {
      throw error;
    }
  }
  
  console.log('\nTo push your code to GitHub, run these commands in the Shell:');
  console.log('');
  console.log(`git remote add github https://github.com/${user.login}/${repoName}.git`);
  console.log('git push -u github main');
  console.log('');
  console.log('Or if the remote already exists:');
  console.log('git push github main');
}

main().catch(console.error);
