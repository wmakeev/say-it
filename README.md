# say-it

Say any text input with Yandex SpeechKit

## Install

1. Clone

   ```
   git clone {repo} && npm install
   ```

2. Create Yandex API key

   - [Create key](https://cloud.yandex.ru/docs/iam/operations/api-key/create) with roles `ai.speechkit-stt.user`, `ai.speechkit-tts.user`

   - Add key to `./.env` as `SPEECHKIT_API_KEY`

3. Add alias to `~/.bashrc`

   ```
   # Say text with Yandex SpeechKit
   alias say-it="(cd /path-to-repo/say-it && node -r dotenv/config .)"
   ```

## Usage

```bash
echo 'Test' | say-it
```

## Dependencies

- FFmpeg [ffplay](https://ffmpeg.org/ffplay.html)
