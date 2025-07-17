# PDF Vectorizer

A Node.js application that processes PDF documents by extracting text, splitting it into chunks, generating vector embeddings via webhook, and storing them in Qdrant vector database for semantic search capabilities.

## Features

- **PDF Text Extraction**: Extracts text content from PDF files
- **Text Chunking**: Splits large text into manageable chunks for processing
- **Vector Embedding**: Generates vector embeddings via external webhook service
- **Vector Storage**: Stores embeddings in Qdrant vector database
- **Semantic Search Ready**: Prepares documents for AI-powered search and retrieval

## Requirements

- Node.js 14.x or higher
- Qdrant vector database running on `localhost:6333`
- External webhook service for vector generation
- PDF file to process

## Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install fs axios pdf-parse dotenv
   ```
3. Create a `.env` file with your webhook URL:
   ```env
   WEBHOOK=https://your-webhook-service.com/generate-embeddings
   ```

## Usage

1. Place your PDF file in the project directory and name it `documento.pdf`
2. Start Qdrant vector database (default port 6333)
3. Run the application:
   ```bash
   node index.js
   ```

## Configuration

### Environment Variables

Create a `.env` file with the following variables:

```env
WEBHOOK=https://your-embedding-service.com/api/embeddings
```

### Customization

You can modify the following parameters in the code:

- **PDF File Path**: Change `pdfPath` variable to process different files
- **Chunk Size**: Modify `wordsPerChunk` parameter (default: 300 words)
- **Qdrant Collection**: Change collection name in `storeInQdrant` function (default: `trechos_pdf`)
- **Qdrant URL**: Modify the baseURL in the Qdrant client configuration

## How It Works

1. **PDF Processing**: Reads and extracts text from the specified PDF file
2. **Text Chunking**: Splits the extracted text into chunks of 300 words each
3. **Vector Generation**: Sends each chunk to the webhook service to generate embeddings
4. **Database Storage**: Stores the text chunks and their corresponding vectors in Qdrant

## Webhook Service Requirements

Your webhook service should:
- Accept POST requests with JSON payload: `{ "texto": "your text here" }`
- Return JSON response with vector data in one of these formats:
  ```json
  {
    "vector": [0.1, 0.2, 0.3, ...]
  }
  ```
  or
  ```json
  {
    "vector": "0.1,0.2,0.3,..."
  }
  ```

## Qdrant Setup

1. Install and run Qdrant:
   ```bash
   docker run -p 6333:6333 qdrant/qdrant
   ```

2. Create a collection (optional - the app will use existing or create new):
   ```bash
   curl -X PUT 'http://localhost:6333/collections/trechos_pdf' \
     -H 'Content-Type: application/json' \
     -d '{
       "vectors": {
         "size": 1536,
         "distance": "Cosine"
       }
     }'
   ```

## Data Structure

Each stored point in Qdrant contains:
- **ID**: Sequential number starting from 0
- **Vector**: Embedding array from the webhook service
- **Payload**:
  - `arquivo`: Original PDF filename
  - `trecho`: Text chunk content

## Output

The application provides progress feedback:
```
JSON response received
Sending to Qdrant: {"points":[{"id":0,"vector":[0.1,0.2,...],"payload":{"arquivo":"documento.pdf","trecho":"chunk text..."}}]}...
Chunk 1 stored with vector of 1536 dimensions.
Chunk 2 stored with vector of 1536 dimensions.
...
Finished!
```

## Error Handling

The application handles various error scenarios:
- PDF reading errors
- Webhook service failures
- Qdrant connection issues
- Invalid vector formats
- Network connectivity problems

## Use Cases

- **Document Search**: Enable semantic search across PDF documents
- **RAG Systems**: Prepare documents for Retrieval-Augmented Generation
- **Content Analysis**: Analyze document content using vector similarity
- **Knowledge Base**: Build searchable knowledge bases from PDF collections

## Dependencies

- `fs`: File system operations
- `path`: Path manipulation utilities
- `axios`: HTTP client for API requests
- `pdf-parse`: PDF text extraction
- `dotenv`: Environment variable management

## License

This project is provided as-is for educational and development purposes.
