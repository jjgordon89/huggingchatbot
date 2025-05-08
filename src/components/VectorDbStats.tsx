typescriptreact
import React, { useState, useEffect } from 'react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableCaption
} from '@/components/ui/table';
import { Button } from './ui/button';

interface TableStats {
  name: string;
  rowCount: number;
}

const VectorDbStats: React.FC = () => {
  const [tableStats, setTableStats] = useState<TableStats[]>([]);
  const [selectedTableSchema, setSelectedTableSchema] = useState<any>(null);
  const [selectedTableName, setSelectedTableName] = useState<string | null>(null);
  const [loadingSchema, setLoadingSchema] = useState(false);
  const [schemaError, setSchemaError] = useState<string | null>(null);
  const [documents, setDocuments] = useState<any[] | null>(null);
  const [loadingDocuments, setLoadingDocuments] = useState(false);
  const [documentError, setDocumentError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [filterQuery, setFilterQuery] = useState('');
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [selectedDocument, setSelectedDocument] = useState<any | null>(null);
  const [totalDocuments, setTotalDocuments] = useState<number | null>(null); // Assuming backend provides total count
  const [dbSize, setDbSize] = useState<number | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/vector-db/stats');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data: TableStats[] = await response.json();
        setTableStats(data);
      } catch (error) {
        console.error("Failed to fetch vector database stats:", error);
        // Optionally update state to show an error message in the UI
      }
    };

    fetchStats();
  }, []);

 useEffect(() => {
 const fetchDbSize = async () => {
 try {
 const response = await fetch('/api/vector-db/size');
 if (!response.ok) {
 throw new Error(`HTTP error! status: ${response.status}`);
 }
 const data = await response.json();
 setDbSize(data.size);
 } catch (error) {
 console.error("Failed to fetch vector database size:", error);
 // Optionally update state to show an error message in the UI
 }
 };
 fetchDbSize();
  }, []);

  const fetchSchema = async (tableName: string) => {
    setLoadingSchema(true);
    setSelectedTableName(tableName);
    setSchemaError(null);
    setSelectedTableSchema(null); // Clear previous schema
    try {
      const response = await fetch(`/api/vector-db/tables/${tableName}/schema`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setSelectedTableSchema(data);
      console.log(`Schema for table ${tableName}:`, data);
    } catch (error) {
      console.error(`Failed to fetch schema for table ${tableName}:`, error);
      setSchemaError(`Failed to load schema: ${(error as Error).message}`);
    } finally {
      setLoadingSchema(false);
    }
  };

  const fetchDocuments = async (tableName: string, page: number, limit: number) => {
    setLoadingDocuments(true);
    setDocumentError(null);
    setDocuments(null); // Clear previous documents

    const offset = (page - 1) * limit;
    const filterParam = filterQuery ? `&filter=${encodeURIComponent(filterQuery)}` : ''; // Include filter parameter if present
    
    // Ensure data is an array and total is a number
    try {
      const response = await fetch(`/api/vector-db/tables/${tableName}/data?limit=${limit}&offset=${offset}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();

      // Assuming the backend response includes total count
      if (data.total !== undefined) {
          setTotalDocuments(data.total);
      } else {
      } // Consider handling missing total more robustly
      setDocuments(data);
    } catch (error) {
      console.error(`Failed to fetch documents for table ${tableName}:`, error);
      setDocumentError(`Failed to load documents: ${(error as Error).message}`);
    } finally {
      setLoadingDocuments(false);
    }
  };

  const handleViewDocuments = (tableName: string) => {
    setSelectedTableName(tableName);
    setCurrentPage(1); // Reset to first page when viewing a new table
    setFilterQuery(''); // Reset filter when viewing a new table
    setSelectedDocument(null); // Clear selected document
    fetchDocuments(tableName, 1, itemsPerPage);
  };

  const handleFilterDocuments = () => {
    setCurrentPage(1); // Reset to first page when applying filter
    selectedTableName && fetchDocuments(selectedTableName, 1, itemsPerPage);
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    selectedTableName && fetchDocuments(selectedTableName, newPage, itemsPerPage);
  };

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/vector-db/stats');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data: TableStats[] = await response.json();
      setTableStats(data);
    } catch (error) {
      console.error("Failed to fetch vector database stats:", error);
      // Optionally update state to show an error message in the UI
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleDeleteTable = async (tableName: string) => {
    const isConfirmed = window.confirm(
      `WARNING: This action is irreversible.\n\nAre you absolutely sure you want to delete the table "${tableName}" and all its data?`
    );

    if (!isConfirmed) return;

  const handleDeleteDocument = async (document: any) => {
    if (!selectedTableName || !document.id) {
      console.error("Table name or document ID is missing.");
      return;
    }

    const isConfirmed = window.confirm(
      `Are you sure you want to delete the document with ID ${document.id}?`
    );

    if (!isConfirmed) {
      return;
    }

    try {
      const response = await fetch(`/api/vector-db/tables/${selectedTableName}/documents/${document.id}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      // Refresh the document list after deletion
      fetchDocuments(selectedTableName, currentPage, itemsPerPage);
      if (selectedDocument && selectedDocument.id === document.id) setSelectedDocument(null); // Clear selected document if it was deleted
    } catch (error) {
      console.error(`Failed to delete document ${document.id}:`, error);
      setDocumentError(`Failed to delete document: ${(error as Error).message}`);
    }
  };

    try {
      const response = await fetch(`/api/vector-db/tables/${tableName}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      fetchStats(); // Refresh table list
      if (selectedTableName === tableName) {
        setSelectedTableName(null);
        setSelectedTableSchema(null);
        setDocuments(null);
        setSelectedDocument(null);
      }
    } catch (error) {
      console.error(`Failed to delete table ${tableName}:`, error);
    }
  };
  return (

    {dbSize !== null && (
      <Card className="mb-4">
        <CardHeader>
          <CardTitle>Database Size</CardTitle>
        </CardHeader>
        <CardContent>
          <p>{(dbSize / (1024 * 1024)).toFixed(2)} MB</p> {/* Display size in MB */}
        </CardContent>
      </Card>

    <Card>
      <CardHeader>
        <CardTitle>Vector Database Statistics</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Table Name</TableHead>
              <TableHead>Number of Rows</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tableStats.length > 0 ? (
              tableStats.map((stats, index) => (
                <TableRow key={index}>
                  <TableCell
                    className="cursor-pointer hover:underline"
                    onClick={() => fetchSchema(stats.name)}
                  >
                    {stats.name}</TableCell>
                  <TableCell>{stats.rowCount}</TableCell>
                  <TableCell><Button variant="destructive" size="sm" onClick={() => handleDeleteTable(stats.name)}>Delete Table</Button></TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={2} className="text-center text-muted-foreground">
                  No vector database tables found or failed to load stats.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
      {loadingSchema && (
        <CardContent className="p-4 text-center text-muted-foreground">Loading schema...</CardContent>
      )}
      {schemaError && (
        <CardContent className="p-4 text-center text-destructive">{schemaError}</CardContent>
      )}
      {selectedTableSchema && !loadingSchema && !schemaError && (
        <CardContent>
 {/* Assuming selectedTableSchema is an object with a fields property that is an array */}
          <Card>
            <CardHeader>
              <CardTitle>Schema for {selectedTableName}</CardTitle>
            </CardHeader>
            <CardContent className="overflow-x-auto p-4 bg-muted rounded-md">
 <Table>
 <TableHeader>
 <TableRow>
 <TableHead>Field Name</TableHead>
 <TableHead>Data Type</TableHead>
 {/* Add more headers if other schema properties are relevant */}
 </TableRow>
 </TableHeader>
 <TableBody>
 {selectedTableSchema.fields && selectedTableSchema.fields.map((field: any, fieldIndex: number) => (
 <TableRow key={fieldIndex}>
 <TableCell>{field.name}</TableCell>
 <TableCell>{field.type}</TableCell>
 </TableRow>
 ))}
 </TableBody>
 </Table>
            </CardContent>
            <CardContent>
              <Button
                variant="outline"
                size="sm"
                onClick={() => selectedTableName && handleViewDocuments(selectedTableName)}
                disabled={loadingDocuments}
              >
                {loadingDocuments ? 'Loading Documents...' : 'View Documents'}
              </Button>
            </CardContent>
          </Card>
        </CardContent>
      )}
      {loadingDocuments && (
        <CardContent className="p-4 text-center text-muted-foreground">Loading documents...</CardContent>
      )}
      {documentError && (
        <CardContent className="p-4 text-center text-destructive">{documentError}</CardContent>
      )}
      {documents && !loadingDocuments && !documentError && (
        <CardContent>
          <Card>
            <CardContent className="p-4">
              <div className="flex space-x-2 items-center">
                <input
                  type="text"
                  placeholder="Filter documents..."
                  value={filterQuery}
                  onChange={(e) => setFilterQuery(e.target.value)}
                  className="flex-grow p-2 border rounded-md"
                />
                <Button variant="outline" size="sm" onClick={handleFilterDocuments} disabled={loadingDocuments}>
                  Filter
                </Button>
              </div>
            </CardContent>
            <CardHeader><CardTitle>Documents from {selectedTableName}</CardTitle></CardHeader>
            <CardContent className="overflow-x-auto p-4 bg-muted rounded-md">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Text</TableHead>
                    <TableHead>Metadata</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {documents.map((doc, docIndex) => (
                    <TableRow key={docIndex} className="cursor-pointer hover:bg-muted/50" onClick={() => setSelectedDocument(doc)}>
 <TableCell className="font-mono text-xs flex items-center justify-between">
 {doc.id ?? 'N/A'}
 <Button variant="destructive" size="sm" onClick={(e) => {
 e.stopPropagation(); // Prevent row click event
 handleDeleteDocument(doc);
 }}>Delete</Button></TableCell>
                      <TableCell className="text-wrap max-w-xs text-sm">{doc.text ?? 'N/A'}</TableCell>
                      <TableCell className="font-mono text-xs">{doc.metadata ? JSON.stringify(doc.metadata, null, 2) : 'N/A'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
            {documents && documents.length > 0 && (
              <CardContent className="flex justify-between items-center p-4">
                <div>
                  Items per page:{' '}
                  <input
                    type="number"
                    min="1"
                    value={itemsPerPage}
                    onChange={(e) => setItemsPerPage(parseInt(e.target.value))}
                    className="w-16 p-1 border rounded-md text-center"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <span>Page {currentPage}</span>
                  <Button variant="outline" size="sm" onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1 || loadingDocuments}>
                    Previous Page
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handlePageChange(currentPage + 1)} disabled={loadingDocuments || (totalDocuments !== null && currentPage * itemsPerPage >= totalDocuments)}>
                    Next Page
                  </Button>
                </div>
              </CardContent>
            )}
          </Card>
        </CardContent>
      )}
      {selectedDocument && (
        <CardContent>
          <Card>
            <CardHeader>
              <CardTitle>Details for Document {selectedDocument.id ?? 'N/A'}</CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(selectedDocument).map(([key, value]) => (
                  <div key={key}>
                    <p className="text-sm font-medium">{key}:</p>
                    <pre className="mt-1 p-2 bg-muted rounded-md overflow-x-auto text-xs">{JSON.stringify(value, null, 2)}</pre>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </CardContent>
      )}
    </Card>
  );
};

export default VectorDbStats;