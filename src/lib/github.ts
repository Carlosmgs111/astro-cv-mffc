import { Octokit } from 'octokit';

let instance: Octokit | null = null;

export function getOctokit(): Octokit {
  if (!instance) {
    instance = new Octokit({ auth: import.meta.env.GITHUB_TOKEN });
  }
  return instance;
}

export const repo = {
  get owner() { return import.meta.env.GITHUB_OWNER as string; },
  get repo() { return import.meta.env.GITHUB_REPO as string; },
  get branch() { return (import.meta.env.GITHUB_BRANCH || 'main') as string; },
};
