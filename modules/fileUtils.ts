import fs from 'fs'
import { execSync } from 'child_process'

const getLatestAudioFile = (directory: string): string => {
    const inputFiles = fs.readdirSync(directory).filter(file => file.endsWith('.webm'))
    if (inputFiles.length === 0) {
        throw new Error('No audio files found in the inputFiles directory.')
    }
    inputFiles.sort((a, b) => fs.statSync(`${directory}/${b}`).mtime.getTime() - fs.statSync(`${directory}/${a}`).mtime.getTime())
    return inputFiles[0].replace('.webm', '')
}

const compressAudioFile = (params: { inputPath: string; outputPath: string }): void => {
    const { inputPath, outputPath } = params
    console.log('Compressing audio file...')
    console.time('Audio Compression')
    execSync(`ffmpeg -i ${inputPath} -c:a libopus -b:a 64k ${outputPath}`)
    console.timeEnd('Audio Compression')
}

const readFileContent = (filePath: string): string => fs.readFileSync(filePath, 'utf8')

const writeFileContent = (params: { filePath: string; content: string }): void => {
    const { filePath, content } = params
    fs.writeFileSync(filePath, content, 'utf8')
}

const ensureDirectoryExists = (directoryPath: string): void => {
    if (!fs.existsSync(directoryPath)) {
        fs.mkdirSync(directoryPath, { recursive: true })
    }
}

export { getLatestAudioFile, compressAudioFile, readFileContent, writeFileContent, ensureDirectoryExists }
