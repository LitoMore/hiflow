import fs from 'fs'
import inquirer from 'inquirer';
import { HOME } from './args'

export const CONFIG_FILE_PATH = `${HOME}/.hiflow`

function writeConfigFile(path, content) {
  return new Promise((resolve, reject) =>
    fs.writeFile(path, content, 'utf8', err => (err ? reject(err) : resolve())));
}

function formatConfigForSave(configJSON = {}) {
  return Object.keys(configJSON)
    .reduce((memo, curr) => {
      memo.push(`${curr.trim()}=${configJSON[curr].trim()}`)
      return memo
    }, [])
    .sort()
    .join('\n')
}

function saveConfigItem(key, value) {
  return writeConfigFile(CONFIG_FILE_PATH, formatConfigForSave({...getConfig(), key: value}))
}

function getConfigFile() {
  if (fs.existsSync(CONFIG_FILE_PATH)) {
    return fs.readFileSync(CONFIG_FILE_PATH, 'utf8')
  }

  throw new Error('Config not found')
}

export function getBitbucketToken() {
  return getConfig().BITBUCKET_TOKEN
}

function parseConfig(settings = '') {
  return settings.split('\n').reduce((memo, curr) => {
      const key = curr.substring(0, curr.indexOf('=')).trim()
      const value = curr.substring(curr.indexOf('=')+1).trim()

      if (key, value) {
        memo[key] = value
      }
      return memo
    }, {})
}

export function getConfig() {
  try {
    return parseConfig(getConfigFile()) || {}
  } catch (e) {
    return {}
  }
}

export function promptUserSetup() {
  return inquirer.prompt([
    {
      type: 'input',
      name: 'username',
      message: 'What\'s your bitbucket username?',
      validate: val => !!val,
      filter: val => val.trim(),
      when: () => true,
    },
    {
      type: 'password',
      name: 'password',
      message: 'What\'s your bitbucket password?',
      validate: val => !!val,
      filter: val => val.trim(),
      when: () => true,
    },
  ])
}

function createToken(username, password) {
  return new Buffer(`${username}:${password}`).toString('base64')
}

function handlePrompt({username, password}) {
  return writeConfigFile(CONFIG_FILE_PATH, formatConfigForSave({
    ...getConfig(),
    BITBUCKET_USERNAME: username,
    BITBUCKET_TOKEN: createToken(username, password),
  }))
}

export function runSetup() {
  return promptUserSetup()
    .then(handlePrompt)
    .catch(() => {})
}

