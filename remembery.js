#!/usr/bin/env node

import {execSync} from 'node:child_process'
import {readFileSync, realpathSync} from 'node:fs'
import {dirname} from 'node:path'
import {fileURLToPath} from 'node:url'

import sade from 'sade'

import {compare_answer, get_files_list, prompt_until_success, rand_fromm} from './helpers.js'

const pkg = JSON.parse(readFileSync('./package.json'))
const dir = realpathSync(dirname(fileURLToPath(import.meta.url)))
const files_dir = `${dir}/files`

const remembery = sade('remembery')
remembery
  .version(pkg.version)

remembery
  .command('list')
  .describe('List available remembery files')
  .action(action__list)

remembery
  .command('edit <file>')
  .describe('Edit a remembery file')
  .action(action__edit)

remembery
  .command('testme <file>')
  .describe('Test yourself on the contents of a remembery file')
  .option('-n', 'Limit the number of tests', 10E6)
  .option('--rand', 'Randomise test order', false)
  .example('remembery testme vocab ')
  .example('remembery testme vocab --rand')
  .action(action__testme)

remembery.parse(process.argv)


// action__list
// -------------------------------------------------

function action__list() {
  const files = get_files_list(files_dir)
  files.forEach(console.log)
  !files.length && console.log(`No files found in ${files_dir}`)
}


// action__edit
// -------------------------------------------------

function action__edit(file) {
  const file_path = `${files_dir}/${file}`
  execSync(`mkdir -p "${files_dir}"`)
  execSync(`code -w "${file_path}"`)
}


// action__testmr
// -------------------------------------------------

function action__testme(file, {n, rand}) {
  const file_path = `${files_dir}/${file}`
  try {
    const str = readFileSync(file_path).toString()
    const items = str.split('\n')
      .map(line => line.split(':'))
      .filter(item => item.length === 2)
      .map(([key, value]) => ({
        key: key.trim(),
        value: value.trim(),
      }))

    if (items.length === 0) {
      console.warn('No items in file. Exiting.')
      return
    }

    for (let i=0; i < Number(n); ++i) {
      const item = rand
        ? rand_fromm(items)
        : items[i % items.length]

      let passed = false
      while (!passed) {
        const response = prompt_until_success(`${item.key}: `)
        if (['?', 'dunno', 'not sure'].includes(response)) {
          console.log('∟ The answer is:', item.value)
          passed = true
          continue
        }
        passed = compare_answer(response, item.value)
        passed && console.log('∟ Correct ✔︎')
        !passed && console.log('∟ Incorrect ✘')
      }
    }
  }
  catch (err) {
    console.error(`Error: unable to read ${file_path}.`, err)
  }
}
