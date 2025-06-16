const fs = require('fs').promises;
const path = require('path');
const axios = require('axios');
const pdfParse = require('pdf-parse');


async function main() {
  const pdfPath = "documento.pdf";
  const fileName = path.basename(pdfPath);
  
  const pdfText = await readPdfText(pdfPath);
  
  const chunks = splitIntoChunks(pdfText, 300);
  
  let counter = 0;
  for (const chunk of chunks) {

    const vector = await sendTextToWebhook(chunk);
    
    await storeInQdrant(fileName, chunk, vector, counter);
    console.log(`Chunk ${counter + 1} stored with vector of ${vector.length} dimensions.`);
    counter++;
  }
  
  console.log("Finished!");
}

async function readPdfText(filePath) {
  const dataBuffer = await fs.readFile(filePath);
  const pdfData = await pdfParse(dataBuffer);
  return pdfData.text;
}

function splitIntoChunks(text, wordsPerChunk) {
  const words = text.split(/\s+/).filter(word => word.length > 0);
  const chunks = [];
  
  for (let i = 0; i < words.length; i += wordsPerChunk) {
    const chunk = words.slice(i, i + wordsPerChunk).join(' ');
    chunks.push(chunk);
  }
  
  return chunks;
}

async function sendTextToWebhook(text) {
  try {
    const url = "http://10.50.2.130:42069/webhook/webhook-test";
    const payload = { texto: text };
    
    const response = await axios.post(url, payload);
    console.log("JSON response received");
    
    const data = response.data;
    const obj = Array.isArray(data) ? data[0] : data;
    
    if (obj.vector !== undefined) {
      if (Array.isArray(obj.vector)) {

        return obj.vector;
      } else if (typeof obj.vector === 'string') {

        return obj.vector
          .split(',')
          .filter(item => item.trim().length > 0)
          .map(item => parseFloat(item.trim()));
      } else {
        throw new Error(`The 'vector' came in an unexpected format: ${typeof obj.vector}`);
      }
    } else {
      throw new Error("The JSON response doesn't contain the 'vector' property");
    }
  } catch (error) {
    console.error("Error sending text to webhook:", error.message);
    throw error;
  }
}

async function storeInQdrant(fileName, excerpt, vector, id) {
  try {
    const client = axios.create({
      baseURL: 'http://localhost:6333',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    const point = {
      points: [
        {
          id: id,
          vector: vector,
          payload: {
            arquivo: fileName,
            trecho: excerpt
          }
        }
      ]
    };

    console.log(`Sending to Qdrant: ${JSON.stringify(point).substring(0, 200)}...`);

    const response = await client.put('/collections/trechos_pdf/points', point);

    if (response.status !== 200) {
      throw new Error(`Error storing in Qdrant: ${response.status}, ${JSON.stringify(response.data)}`);
    }
  } catch (error) {
    console.error("Error storing in Qdrant:", error.message);
    if (error.response) {
      console.error("Response data:", error.response.data);
      console.error("Response status:", error.response.status);
    }
    throw error;
  }
}

main().catch(error => {
  console.error("Application error:", error);
  process.exit(1);
});