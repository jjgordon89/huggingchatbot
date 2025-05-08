import express from 'express';
import { client as lancedbClient } from '../lib/lanceDbService'; // Assuming lanceDbService exports the client
import path from 'path';
import fs from 'fs/promises';

const app = express();
const port = 3001; // Or any other port you prefer

// LanceDB client is imported from ../lib/lanceDbService


app.get('/', (req, res) => {
  res.send('Vector DB Backend');
});

// Endpoint to get vector database statistics
app.get('/api/vector-db/stats', async (req, res) => {
  try {
    const tables = await lancedbClient.listTables();
    const stats = [];

    for (const tableName of tables) {
      const table = await lancedbClient.openTable(tableName);
      const rowCount = await table.countRows();
      stats.push({ name: tableName, rowCount: rowCount });
    }

    res.json(stats);
  } catch (error) {
    console.error('Error fetching LanceDB stats:', error);
    res.status(500).json({ error: 'Failed to fetch vector database statistics' });
  }
});

// Endpoint to get table schema
app.get('/api/vector-db/tables/:tableName/schema', async (req, res) => {
  try {
    const { tableName } = req.params;
    const table = await lancedbClient.openTable(tableName);
    const schema = table.schema();
    res.json(schema);
  } catch (error) {
    console.error(`Error fetching schema for table ${req.params.tableName}:`, error);
    // Check if the error is due to table not found
    const statusCode = error.message.includes('not found') ? 404 : 500;
    res.status(statusCode).json({ error: `Failed to fetch schema for table ${req.params.tableName}` });
  }
});

// Endpoint to get data (documents/vectors) from a table with pagination
app.get('/api/vector-db/tables/:tableName/data', async (req, res) => {
  try {
    const { tableName } = req.params;
    const limit = parseInt(req.query.limit as string) || 10; // Default limit to 10
    const offset = parseInt(req.query.offset as string) || 0; // Default offset to 0

    if (isNaN(limit) || isNaN(offset) || limit < 0 || offset < 0) {
      return res.status(400).json({ error: 'Invalid limit or offset parameters' });
    }

    const table = await lancedbClient.openTable(tableName);
    const totalCount = await table.countRows();
    
    const filterQuery = req.query.filter as string | undefined;

    // Retrieve data with pagination
    let query = table.query();

    if (filterQuery) {
      query = query.search(filterQuery);
    }

    const data = await query.limit(limit).offset(offset).toArrow();

    // Convert Arrow data to JavaScript array of objects
    const jsonData = { documents: data.toArray().map(row => row.toJSON()), total: totalCount };

    res.json(jsonData);
  } catch (error) {
    console.error(`Error fetching data for table ${req.params.tableName}:`, error);
    const statusCode = error.message.includes('not found') ? 404 : 500;
    res.status(statusCode).json({ error: `Failed to fetch documents for table ${req.params.tableName}` });
  }
});

// Endpoint to get vector database size
app.get('/api/vector-db/size', async (req, res) => {
  try {
    // Assuming your LanceDB path is relative to the server file
    const dbPath = path.resolve(__dirname, '../../.lancedb'); // Adjust this path as needed

    let totalSize = 0;

    async function getDirSize(dir) {
      try {
        const entries = await fs.readdir(dir, { withFileTypes: true });
        for (const entry of entries) {
          const fullPath = path.join(dir, entry.name);
          if (entry.isDirectory()) {
            await getDirSize(fullPath);
          } else {
            const stats = await fs.stat(fullPath);
            totalSize += stats.size;
          }
        }
      } catch (error) {
        console.error(`Error reading directory ${dir}:`, error);
        // Continue processing even if one directory read fails
      }
    }

    await getDirSize(dbPath);

// Endpoint to delete a document by ID
app.delete('/api/vector-db/tables/:tableName/documents/:documentId', async (req, res) => {
  try {
    const { tableName, documentId } = req.params;

    const table = await lancedbClient.openTable(tableName);

    // Delete the document by its ID
    await table.delete(`id = '${documentId}'`);

    res.status(200).json({ message: `Document ${documentId} deleted successfully from table ${tableName}` });
  } catch (error) {
    console.error(`Error deleting document ${req.params.documentId} from table ${req.params.tableName}:`, error);
    const statusCode = error.message.includes('not found') ? 404 : 500;
    res.status(statusCode).json({ error: `Failed to delete document ${req.params.documentId} from table ${req.params.tableName}` });
  }
});

// Endpoint to delete an entire table
app.delete('/api/vector-db/tables/:tableName', async (req, res) => {
  try {
    const { tableName } = req.params;

    // Delete the table
    await lancedbClient.dropTable(tableName);

    res.status(200).json({ message: `Table ${tableName} deleted successfully` });
  } catch (error) {
    console.error(`Error deleting table ${req.params.tableName}:`, error);
    const statusCode = error.message.includes('not found') ? 404 : 500;
    res.status(statusCode).json({ error: `Failed to delete table ${req.params.tableName}` });
  }
    res.json({ size: totalSize });
  } catch (error) {
    console.error('Error calculating database size:', error);
    res.status(500).json({ error: 'Failed to get vector database size' });
  }
});

app.listen(port, () => {
  console.log(`Vector DB backend listening at http://localhost:${port}`);
});