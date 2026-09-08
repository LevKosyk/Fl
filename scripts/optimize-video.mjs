import { existsSync, mkdirSync, statSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import path from 'node:path';

const [inputPath, outputName] = process.argv.slice(2);

if (!inputPath || !outputName) {
  console.error('Использование: npm run optimize:video -- <путь-к-видео> <имя-без-расширения>');
  process.exit(1);
}

if (!existsSync(inputPath)) {
  console.error(`Файл не найден: ${inputPath}`);
  process.exit(1);
}

if (!/^[a-z0-9][a-z0-9-]*$/i.test(outputName)) {
  console.error('Имя может содержать только латинские буквы, цифры и дефисы.');
  process.exit(1);
}

const outputDirectory = path.resolve('static/videos');
const videoOutput = path.join(outputDirectory, `${outputName}.mp4`);
const posterOutput = path.join(outputDirectory, `${outputName}-poster.jpg`);
mkdirSync(outputDirectory, { recursive: true });

const run = (command, args) => {
  const result = spawnSync(command, args, { stdio: 'inherit' });
  if (result.error) {
    console.error(`${command} не найден. Установи ffmpeg и повтори команду.`);
    process.exit(1);
  }
  if (result.status !== 0) process.exit(result.status || 1);
};

run('ffmpeg', [
  '-hide_banner', '-y', '-i', inputPath,
  '-map', '0:v:0', '-map', '0:a:0?',
  '-vf', 'scale=1280:1280:force_original_aspect_ratio=decrease:force_divisible_by=2:flags=lanczos',
  '-c:v', 'libx264', '-preset', 'slow', '-crf', '24',
  '-pix_fmt', 'yuv420p', '-profile:v', 'high', '-level', '4.0',
  '-maxrate', '3M', '-bufsize', '6M', '-g', '60', '-keyint_min', '60',
  '-c:a', 'aac', '-b:a', '96k',
  '-movflags', '+faststart', '-map_metadata', '-1',
  videoOutput,
]);

run('ffmpeg', [
  '-hide_banner', '-loglevel', 'error', '-y',
  '-ss', '00:00:01.500', '-i', videoOutput,
  '-frames:v', '1', '-q:v', '3', posterOutput,
]);

const megabytes = (filePath) => (statSync(filePath).size / 1024 / 1024).toFixed(1);
console.log(`Готово: ${videoOutput} (${megabytes(videoOutput)} МБ)`);
console.log(`Poster: ${posterOutput}`);
