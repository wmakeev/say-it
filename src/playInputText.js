import { execa } from 'execa'
import assert from 'node:assert'
import { readFileSync } from 'node:fs'
import { stat, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fetch } from 'undici'
import { md5 } from './tools/hash/md5.js'

const ENDPOINT = 'https://tts.api.cloud.yandex.net/speech/v1/tts:synthesize'
const CACHE_FOLDER = path.join(process.cwd(), '__temp/cache')

const { SPEECHKIT_API_KEY } = process.env

assert.ok(SPEECHKIT_API_KEY, 'SPEECHKIT_API_KEY')

/**
 * Play audio file
 *
 * @param {string} file
 */
const playAudio = async file => {
  await execa('ffplay', ['-v', '0', '-nodisp', '-autoexit', file])
}

/**
 * @param {string} file
 */
const isFileExist = async file => {
  try {
    await stat(file)
    return true
  } catch (err) {
    assert.ok(err instanceof Error)

    if ('code' in err && err.code === 'ENOENT') {
      return false
    } else {
      throw err
    }
  }
}

export async function playInputText() {
  let inputText

  try {
    inputText = readFileSync(process.stdin.fd, 'utf-8')
  } catch (err) {
    assert.ok(err instanceof Error)

    // Empty input?
    if ('code' in err && err.code === 'EAGAIN') {
      inputText = 'Empty input'
      // process.exit(0)
    } else {
      throw err
    }
  }

  if (!inputText) process.exit(0)

  const textHash = md5(inputText)

  const cachedAudioFile = path.join(CACHE_FOLDER, `${textHash}.mp3`)
  const cachedTextFile = path.join(CACHE_FOLDER, `${textHash}.txt`)

  if (await isFileExist(cachedAudioFile)) {
    await playAudio(cachedAudioFile)
    process.exit(0)
  }

  // https://cloud.yandex.ru/docs/speechkit/tts/request

  const resp = await fetch(ENDPOINT, {
    method: 'POST',
    headers: {
      Authorization: `Api-Key ${SPEECHKIT_API_KEY}`
    },
    body: new URLSearchParams({
      text: inputText,
      lang: 'ru-RU',
      voice: 'john',
      speed: '1.2',
      format: 'mp3'
    })
  })

  if (!resp.ok) {
    const text = await resp.text()

    console.error(text)

    throw new Error('Response error')
  }

  const voiceArrayBuffer = await resp.arrayBuffer()

  const voiceBuffer = Buffer.from(voiceArrayBuffer)

  await Promise.all([
    writeFile(cachedAudioFile, voiceBuffer),
    writeFile(cachedTextFile, inputText, 'utf-8')
  ])

  await playAudio(cachedAudioFile)
}
