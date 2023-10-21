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

export function rand_fromm(arr) {
  const i = Math.floor(Math.random() * arr.length)
  return arr[i]
}


// compare_answer
// -------------------------------------------------

export function compare_answer(x, y) {
  function normalise(str) {
    return str.trim()
      .toLowerCase()
      .replace(/\s+/g, ' ')
  }

  return x && y && normalise(x) === normalise(y)
}

