#!/usr/bin/env node

import {execSync} from 'node:child_process'
import {readFileSync, realpathSync} from 'node:fs'
import {dirname} from 'node:path'
import {fileURLToPath} from 'node:url'

import {shuffle} from 'lodash-es'
import sade from 'sade'

import {assert, get_files_list, loose_str_compare, print, prompt_until_success} from './helpers.js'


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
  .command('test <file>')
  .describe('Test yourself on the contents of a remembery file')
  .option('n', 'Limit the number of tests', 10E6)
  .option('r', 'Reverse the questions/answers')
  .option('o', 'Test in file order, as opposed to randomising')
  .example('remembery test spanish-vocab ')
  .example('remembery test capitals')
  .example('remembery test capitals.europe -n 10')
  .action(action__test)

remembery.parse(process.argv)


// action__list
// -------------------------------------------------

function action__list() {
  const files = get_files_list(files_dir)
  files.forEach(print)
  !files.length && print(`No files found in ${files_dir}`)
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

function action__test(file, {n: opt_n, r: opt_r, o: opt_o}) {
  const file_parts = file.split('.')
  assert([1, 2].includes(file_parts.length), '<file> must be in form filename or filename.section')

  const file_path = `${files_dir}/${file_parts[0]}`
  const test_section = file_parts[1]

  try {
    let current_section
    const entries = readFileSync(file_path).toString().split('\n')
      .reduce((carry, line) => {
        const section_heading = line.match(/^\[(.*)\]$/)?.[1]
        if (section_heading) {
          assert(section_heading !== 'all', '"all" cannot be used as a section section_heading')
          current_section = section_heading
          carry[section_heading] = carry[section_heading] || []
          return carry
        }

        const key_value = line?.split(':')
        if (key_value?.length !== 2) {
          return carry
        }
        const [key, value] = key_value
        const item = {key: key.trim(), value: value.trim()}

        carry.all.push(item)
        carry[current_section]?.push(item)

        return carry
      }, {all: []})

    if (!opt_o) {
      Object.keys(entries).forEach(key => entries[key] = shuffle(entries[key]))
    }

    let section_entries = entries.all
    if (test_section) {
      const section_key = Object.keys(entries).find(sec => loose_str_compare(sec, test_section))
      assert(section_key, `Section '${test_section}' not found in memory file.`)
      section_entries = entries[section_key]
    }

    if (!section_entries?.length) {
      console.warn('No entries found. Exiting.')
      return
    }

    const entries_arr = section_entries.slice(0, opt_n ? Math.min(opt_n, section_entries.length) : section_entries.length)
    if (opt_r) {
      entries_arr.forEach(({key, value}, i) => entries_arr[i] = {key: value, value: key})
    }

    entries_arr.forEach(item => {
      let passed = false
      while (!passed) {
        const response = prompt_until_success(`${item.key}: `)
        if (['?', 'dunno', 'not sure'].includes(response)) {
          print('∟ The answer is:', item.value)
          passed = true
          continue
        }
        passed = loose_str_compare(response, item.value)
        passed && print('∟ Correct ✔︎')
        !passed && print('∟ Incorrect ✘')
      }
    })
  }
  catch (err) {
    console.error(`Error: unable to read ${file_path}.`, err)
  }
}
