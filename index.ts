import fs from 'fs'
import { getLatestAudioFile, compressAudioFile, readFileContent, writeFileContent, ensureDirectoryExists } from './modules/fileUtils.ts'
import { INPUT_DIRECTORY, OUTPUT_DIRECTORY } from './modules/constants.ts'
import { transcribeAudio, generateSummary } from './modules/openaiUtils.ts'

const main = async (): Promise<void> => {
    ensureDirectoryExists(INPUT_DIRECTORY)
    ensureDirectoryExists(OUTPUT_DIRECTORY)

    const commonFilename = getLatestAudioFile(INPUT_DIRECTORY)

    const audioFilepath = `${INPUT_DIRECTORY}/${commonFilename}.webm`
    const textFilepath = `${INPUT_DIRECTORY}/${commonFilename}.txt`
    const compressedAudioFilepath = `${INPUT_DIRECTORY}/${commonFilename}-compressed.webm`

    const clientsOrganizations = 'Clients: '
    const people = 'People: '
    const pmsHousekeepingMessagingSystems = 'PMS/Housekeeping/Messaging Systems: '
    const technologiesFrameworks = 'Technologies/Frameworks: '
    const platformsServices = 'Platforms/Services: '
    const microservices = 'Microservices: '
    const conceptsTerms = 'Concepts/Terms: '

    const domainSpecificTerms = [
        clientsOrganizations,
        people,
        pmsHousekeepingMessagingSystems,
        technologiesFrameworks,
        platformsServices,
        microservices,
        conceptsTerms
    ].join(',\n')

    const prompt = `The following list contains domain-specific terms, tools, and names that are crucial for accurate transcription which we are using and might be transcribed wrongly:\n${domainSpecificTerms}`

    let processedAudioFilepath = audioFilepath

    if (fs.existsSync(compressedAudioFilepath)) {
        processedAudioFilepath = compressedAudioFilepath
    } else {
        const stats = fs.statSync(audioFilepath)
        const fileSizeInMB = stats.size / (1024 * 1024)

        if (fileSizeInMB > 3) {
            compressAudioFile({ inputPath: audioFilepath, outputPath: compressedAudioFilepath })
            processedAudioFilepath = compressedAudioFilepath
        }
    }

    const transcriptionText = await transcribeAudio({ filePath: processedAudioFilepath, prompt })
    writeFileContent({ filePath: `${OUTPUT_DIRECTORY}/${commonFilename}-transcription.txt`, content: transcriptionText })

    const googleMeetTranscript = readFileContent(textFilepath)
    const summary = await generateSummary({ googleMeetTranscript, accurateTranscript: transcriptionText, toolsAndTech: domainSpecificTerms })
    writeFileContent({ filePath: `${OUTPUT_DIRECTORY}/${commonFilename}-summary.md`, content: summary })
}

main().catch(error => console.error(error))
