import fs from 'fs'
import { execSync } from 'child_process'

export function getLatestAudioFile(directory: string): string {
    const inputFiles = fs.readdirSync(directory).filter(file => file.endsWith('.webm'))
    if (inputFiles.length === 0) {
        throw new Error('No audio files found in the inputFiles directory.')
    }
    inputFiles.sort((a, b) => fs.statSync(`${directory}/${b}`).mtime.getTime() - fs.statSync(`${directory}/${a}`).mtime.getTime())
    return inputFiles[0].replace('.webm', '')
}

export function compressAudioFile(inputPath: string, outputPath: string): void {
    console.log(`Compressing audio file...`)
    console.time('Audio Compression')
    execSync(`ffmpeg -i ${inputPath} -c:a libopus -b:a 64k ${outputPath}`)
    console.timeEnd('Audio Compression')
}

export function readFileContent(filePath: string): string {
    return fs.readFileSync(filePath, 'utf8')
}

export function writeFileContent(filePath: string, content: string): void {
    fs.writeFileSync(filePath, content, 'utf8')
}