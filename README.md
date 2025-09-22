# AI Transcribe

AI Transcribe is a Node.js application designed to process audio files, transcribe them using OpenAI's Whisper model, and generate a structured summary of meeting transcripts. This tool is particularly useful for meetings conducted over platforms like Google Meet, where it can cross-reference live captions with accurate transcriptions to produce a comprehensive summary.

## Features

- **Audio Processing**: Automatically selects the latest `.webm` audio file from the `inputFiles` directory for processing.
- **Audio Compression**: Compresses audio files larger than 3 MB to ensure efficient processing.
- **Transcription**: Utilizes OpenAI's Whisper model to transcribe audio files accurately.
- **Summary Generation**: Cross-references Google Meet live captions with accurate transcriptions to generate a detailed meeting summary.
- **Output**: Saves both the transcription and the summary in the `outputFiles` directory.

## Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/pratikyoff/ai-transcribe.git
   cd ai-transcribe
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up environment variables**:
   - Create a `.env` file in the root directory.
   - Add your OpenAI API key:
     ```
     OPENAI_API_KEY=your_openai_api_key
     ```

## Usage

1. **Prepare your audio files**:
   - Place your `.webm` audio files in the `inputFiles` directory.

2. **Run the application**:
   ```bash
   npm start
   ```

3. **Check the output**:
   - Transcriptions will be saved as `-transcription.txt` files in the `outputFiles` directory.
   - Summaries will be saved as `-summary.md` files in the same directory.

## Configuration

- **Node Version**: Ensure you are using Node.js version 24.8.0 or higher.
- **Environment Variables**: The application requires an OpenAI API key, which should be stored in a `.env` file.

## Contributing

Contributions are welcome! Please open an issue or submit a pull request on GitHub.

## License

This project is licensed under the ISC License.

## Contact

For any questions or issues, please open an issue on the [GitHub repository](https://github.com/pratikyoff/ai-transcribe/issues).

## Acknowledgments

- This project uses the [OpenAI API](https://openai.com/api/) for transcription and summary generation.
- Special thanks to the developers and contributors of the libraries and tools used in this project.