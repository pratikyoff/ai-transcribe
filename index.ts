import fs from 'fs'
import { getLatestAudioFile, compressAudioFile, readFileContent, writeFileContent } from './modules/fileUtils.ts'
import { transcribeAudio, generateSummary } from './modules/openaiUtils.ts'

async function main() {
    let commonFilename = getLatestAudioFile('./inputFiles')

    const audioFilepath = `./inputFiles/${commonFilename}.webm`
    const textFilepath = `./inputFiles/${commonFilename}.txt`

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

    const stats = fs.statSync(audioFilepath)
    const fileSizeInMB = stats.size / (1024 * 1024)

    let processedAudioFilepath = audioFilepath

    if (fileSizeInMB > 3) {
        const compressedAudioFilepath = `./inputFiles/${commonFilename}-compressed.webm`
        compressAudioFile(audioFilepath, compressedAudioFilepath)
        processedAudioFilepath = compressedAudioFilepath
    }

    const transcriptionText = await transcribeAudio(processedAudioFilepath, prompt)
    writeFileContent(`./outputFiles/${commonFilename}-transcription.txt`, transcriptionText)

    const googleMeetTranscript = readFileContent(textFilepath)
    const summary = await generateSummary(googleMeetTranscript, transcriptionText, domainSpecificTerms)
    writeFileContent(`./outputFiles/${commonFilename}-summary.md`, summary)
}

main().catch(error => console.error(error))