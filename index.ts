import fs from "fs";
import { execSync } from "child_process";
import OpenAI from "openai";

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

let commonFilename = "";

// if commonFilename is not set, use the latest file in the inputFiles directory
if (!commonFilename) {
  const inputFiles = fs.readdirSync("./inputFiles").filter(file => file.endsWith(".webm"));
  if (inputFiles.length === 0) {
    throw new Error("No audio files found in the inputFiles directory.");
  }
  // sort files by modification time, descending
  inputFiles.sort((a, b) => fs.statSync(`./inputFiles/${b}`).mtime.getTime() - fs.statSync(`./inputFiles/${a}`).mtime.getTime());
  commonFilename = inputFiles[0].replace(".webm", "");
}

const audioFilepath = `./inputFiles/${commonFilename}.webm`;
const audioFilename = `${commonFilename}.webm`;

const textFilepath = `./inputFiles/${commonFilename}.txt`;
const textFilename = `${commonFilename}.txt`;

if (!audioFilename) {
  throw new Error("Filename could not be determined from the path.");
}

const toolsAndTech = "Optii, Flexkeeping, Mews, Cloudbeds, api-services, ai-services, Platform, LikeMagic, Apaleo, LiteLLM, Langfuse, GDPR, Freshwork, Freshdesk, Freshchat, Hookdeck, LiveKit, CTA, Staycity, Amano, Dalata, Crowdin, HLD, Ostello Bello, Twilio, BetterAuth, D3x, D3x.ai, api-services, ai-services, chat-services, JOI validation, NextJS, Claude, Anthropic, Gemini, CRUD, Outbound, tenant, subtenant, Bicycle Street, evals (frequently mistaken as email), BR - business rules, HCR (Human connect request), McDreams, Jason, Laura, Lina, Gaurav, Monasha, Pratik, Raunaq, Mike, Ram, Bhaskar";
const prompt = `There are some correct tech, tools and names that we are using which might be transcribed wrongly: ${toolsAndTech}`;

// Check file size and compress if necessary
const stats = fs.statSync(audioFilepath);
const fileSizeInMB = stats.size / (1024 * 1024);

let processedAudioFilepath = audioFilepath;

if (fileSizeInMB > 3) {
  console.log(`File size is ${fileSizeInMB.toFixed(2)} MB, which is larger than 3 MB. Compressing...`);
  console.time("Audio Compression");
  const compressedAudioFilepath = `./inputFiles/${commonFilename}-compressed.webm`;
  execSync(`ffmpeg -i ${audioFilepath} -c:a libopus -b:a 64k ${compressedAudioFilepath}`);
  console.timeEnd("Audio Compression");
  processedAudioFilepath = compressedAudioFilepath;
}

console.log('Processing audio file with whisper-1 model...');
console.time("Audio Transcription");
const transcription = await openai.audio.transcriptions.create({
  file: fs.createReadStream(processedAudioFilepath),
  model: "whisper-1",
  prompt
});
console.timeEnd("Audio Transcription");

// output translation.text to file
fs.writeFileSync(`./outputFiles/${audioFilename}-transcription.txt`, transcription.text, "utf8");

// read google meet transcript
const googleMeetTranscript = fs.readFileSync(textFilepath, "utf8");
// now generate the summary for the transcription
console.log('Generating summary for the meeting transcripts...');
console.time("Summary Generation");
const summary = await openai.chat.completions.create({
  model: "o3-2025-04-16",
  messages: [
    {
      role: "system",
      content: `## Meeting Date: ${new Date().toLocaleDateString("en-US", { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' })}

You are provided with two transcripts from the same meeting:

- **Transcript 1 (Google Meet Live Captioning)**: Contains speaker labels but may have inaccuracies. The speaker labels are always correct, but the content may not be. The person marked as You is Pratik.
- **Transcript 2 (Accurate Transcript)**: Contains accurate text but lacks speaker labels.

Please note that certain technical terms, tools, and participant names may have been incorrectly transcribed. Pay special attention to the following correct terms and names: **${toolsAndTech}**.

### Instructions:

1. **Cross-reference** both transcripts:
   - Use **Transcript 1** to identify who said what.
   - Use **Transcript 2** to verify and correct the accuracy of the content.

2. **Evaluate carefully**:
   - The speaker labels in the first transcript are always correct and should be trusted.
   - But the content in the first transcript is not accurate.
   - The second transcript is generally accurate but may still contain minor errors.
   - Use context, provided correct terms and names, and your judgment to determine the correct information.

3. **Exclude**:
   - Greetings, small talk, and irrelevant conversation.

4. **Provide output closely following the example format** (provided within the '---' delimiters) clearly structured in markdown, but not including the delimiters itself:

---
## Meeting Date: July 2, 2025 (Wednesday)

## Summary:
A concise summary of the entire meeting (50 words max), including brief mentions of the contributions of each participant.

## Topics:
Clearly organize all relevant information discussed in the meeting by topic, rather than by participant. Include all information here except personal information.

Example format:
1. Topic 1
  - Detail or discussion point 1
  - Detail or discussion point 2
  - etc.

2. Topic 2
  - Detail or discussion point 1
  - Detail or discussion point 2
  - etc.

## Action Points:
List all actionable tasks assigned to each participant clearly. Include all tasks, even if they are small or seem trivial.

Example format:
- Participant Name 1
  - Action point 1
  - Action point 2
  - etc.

- Participant Name 2
  - Action point 1
  - Action point 2
  - etc.
---

Please ensure clarity, accuracy, and readability in your response.`,
    }, {
      role: "user",
      content: `Transcript 1 (Google Meet Live Captioning):
      ${googleMeetTranscript}
      Transcript 2 (Accurate Transcript):
      ${fs.readFileSync(`./outputFiles/${audioFilename}-transcription.txt`, "utf8")}`
    }
  ],
  max_completion_tokens: 5000,
  temperature: 1
});
console.timeEnd("Summary Generation");

// output summary to file
fs.writeFileSync(`./outputFiles/${commonFilename}-summary.md`, summary.choices[0].message.content || '', "utf8");
