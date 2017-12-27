import axios from 'axios'
import inquirer from 'inquirer'
import chalk from 'chalk'

import { HOME } from './args'
import { getBitbucketToken } from './config'
import {
  getRepositoryName,
  getRepositoryRemoteUsername,
  getRepositoryBranch,
} from './git'

const BITBUCKET_TOKEN = getBitbucketToken()
const GIT_REPO_NAME = getRepositoryName()
const GIT_REPO_ORIGIN_USERNAME = getRepositoryRemoteUsername()
const BITBUCKET_API_BASEURL = `https://bitbucket.org/!api/2.0/repositories/${GIT_REPO_ORIGIN_USERNAME}/${GIT_REPO_NAME}`

function handleResponse(response) {
  // console.log('data - ', response.data)
  return response.data
}

function handleError(error) {
  // console.log('error - ', JSON.stringify(error.response.data.error))
  // console.log('error - ', error)
  return error.response.data.error
}

export function bitbucketRequest(url, params = {}, method) {
  return axios({
    url,
    method: method || 'get',
    data: params,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Basic ${BITBUCKET_TOKEN}`,
    },
  })
  .then(handleResponse)
  .catch(e => Promise.reject(handleError(e)))
}

function buildAPIUrl(path) {
  return `${BITBUCKET_API_BASEURL}/${path}`
}

// TODO: recurse to get all pages of pull requests
export function getPullRequests() {
  return bitbucketRequest(buildAPIUrl(`pullrequests`))
    .then(data => data.values)
}

export function createPullRequest(data) {
  return bitbucketRequest(buildAPIUrl('pullrequests'), data, 'POST')
}

export function getRepository() {
  return bitbucketRequest(BITBUCKET_API_BASEURL)
}
