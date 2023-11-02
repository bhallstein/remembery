import {execSync} from 'node:child_process'

import readline from 'readline-sync'


// identity_func
// -------------------------------------------------

export const identity_func = x => x


// get_files_list
// -------------------------------------------------

export function get_files_list(dir_path) {
  const exclude = [
    '.',
    '..',
  ]
  try {
    return execSync(`ls -1 "${dir_path}" 2>&1`)
      .toString()
      .split('\n')
      .filter(item => item && !exclude.includes(item))
  }
  catch {
    return []
  }
}


// prompt_until_success
// -------------------------------------------------

export function prompt_until_success(prompt) {
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const answer = readline.question(prompt)
    if (answer) {
      return answer
    }
  }
}


// rand_from
// -------------------------------------------------

export function rand_from(arr) {
  const i = Math.floor(Math.random() * arr.length)
  return arr[i]
}


// loose_str_compare
// -------------------------------------------------

const normalise = str => str.trim()
  .toLowerCase()
  .replace(/\s+/g, ' ')

export function loose_str_compare(x, y) {
  return x && y && normalise(x) === normalise(y)
}

export function very_loose_str_compare(response, actual) {
  response = normalise(response)
  actual = normalise(actual)

  return actual.includes(response)
}


// assert
// -------------------------------------------------

export function assert(assertion, error_msg) {
  if (!assertion) {
    throw Error(error_msg || 'unknown error')
  }
}


// print
// --

export function print(...args) {
  console.log(...args)
}
