import { useState, useRef } from 'react';
import { useChat } from '@/context/ChatContext';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { 
  MessageSquare, 
  Plus, 
  Trash2, 
  ChevronLeft, 
  ChevronRight, 
  FileUp, 
  FilePlus,
  Settings,
  Database,
  FileType
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import { 
  addDocumentToStore, 
  getAllDocuments, 
  deleteDocument, 
  Document as DocType,
  EMBEDDING_MODELS,
  getCurrentEmbeddingModel,
  setEmbeddingModel,
  reembedAllDocuments,
  DocumentType,
  processDocumentFile
} from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

export function ChatSidebar() {
  const { chats, activeChatId, startNewChat, switchChat, deleteChat, clearChats, ragEnabled, setRagEnabled } = useChat();
  const [isOpen, setIsOpen] = useState(true);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isDocsOpen, setIsDocsOpen] = useState(false);
  const [docTitle, setDocTitle] = useState('');
  const [docContent, setDocContent] = useState('');
  const [docFilename, setDocFilename] = useState('');
  const [documents, setDocuments] = useState<DocType[]>([]);
  const [currentEmbeddingModel, setCurrentEmbeddingModel] = useState(getCurrentEmbeddingModel());
  const [isReembedding, setIsReembedding] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isMobile = useIsMobile();
  const { toast } = useToast();

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    try {
      setIsUploading(true);
      setUploadProgress(10);
      
      const result = await processDocumentFile(file, (progress) => {
        setUploadProgress(10 + progress * 0.8);
      });
      
      setUploadProgress(90);
      
      setDocTitle(result.title);
      setDocFilename(file.name);
      setDocContent(result.content);
      setIsUploadOpen(true);
      setUploadProgress(100);
      
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      
    } catch (error) {
      console.error('Error processing file:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to process file",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleAddDocument = async () => {
    if (docTitle && docContent) {
      try {
        await addDocumentToStore(docTitle, docContent, docFilename);
        toast({
          title: "Document Added",
          description: `"${docTitle}" has been added to the knowledge base`
        });
        setIsUploadOpen(false);
        setDocTitle('');
        setDocContent('');
        setDocFilename('');
        if (isDocsOpen) {
          loadDocuments();
        }
      } catch (error) {
        console.error('Error adding document:', error);
        toast({
          title: "Error",
          description: "Failed to add document to knowledge base",
          variant: "destructive"
        });
      }
    }
  };
  
  const loadDocuments = () => {
    const docs = getAllDocuments();
    setDocuments(docs);
  };
  
  const handleDeleteDocument = (docId: string) => {
    try {
      const deleted = deleteDocument(docId);
      if (deleted) {
        toast({
          title: "Document Deleted",
          description: "Document has been removed from the knowledge base"
        });
        loadDocuments();
      }
    } catch (error) {
      console.error('Error deleting document:', error);
      toast({
        title: "Error",
        description: "Failed to delete document",
        variant: "destructive"
      });
    }
  };
  
  const handleChangeEmbeddingModel = async (modelId: string) => {
    try {
      setCurrentEmbeddingModel(setEmbeddingModel(modelId));
      toast({
        title: "Embedding Model Changed",
        description: `Using ${currentEmbeddingModel.name} for document embeddings`
      });
    } catch (error) {
      console.error('Error changing embedding model:', error);
      toast({
        title: "Error",
        description: "Failed to change embedding model",
        variant: "destructive"
      });
    }
  };
  
  const handleReembedDocuments = async () => {
    try {
      setIsReembedding(true);
      await reembedAllDocuments(currentEmbeddingModel.id);
      toast({
        title: "Documents Re-embedded",
        description: `All documents have been re-embedded using ${currentEmbeddingModel.name}`
      });
    } catch (error) {
      console.error('Error re-embedding documents:', error);
      toast({
        title: "Error",
        description: "Failed to re-embed documents",
        variant: "destructive"
      });
    } finally {
      setIsReembedding(false);
    }
  };
  
  const getDocumentTypeIcon = (type: DocumentType) => {
    switch (type) {
      case 'markdown': return 'MD';
      case 'code': return '</>';
      case 'json': return '{}';
      case 'pdf': return 'PDF';
      case 'csv': return 'CSV';
      case 'excel': return 'XLS';
      case 'html': return 'HTML';
      default: return 'TXT';
    }
  };
  
  const getAcceptedFileTypes = () => {
    return ".txt,.md,.json,.js,.ts,.html,.css,.py,.pdf,.csv,.xlsx,.xls,.docx,.doc";
  };

  return (
    <>
      <div 
        className={cn(
          "fixed top-[--header-height] bottom-0 left-0 z-20 flex flex-col w-72 bg-card border-r transition-transform duration-300",
          !isOpen && "-translate-x-full",
          isMobile && "w-full"
        )}
      >
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-lg font-medium">Conversations</h2>
          <div className="flex gap-1">
            {ragEnabled && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 rounded-full"
                  onClick={() => { loadDocuments(); setIsDocsOpen(true); }}
                  title="View documents"
                >
                  <Database className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 rounded-full"
                  onClick={() => setIsSettingsOpen(true)}
                  title="RAG settings"
                >
                  <Settings className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 rounded-full"
                  onClick={() => setIsUploadOpen(true)}
                  title="Add document"
                >
                  <FilePlus className="h-4 w-4" />
                </Button>
              </>
            )}
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-full"
              onClick={() => chats.length > 0 && setIsConfirmOpen(true)}
              disabled={chats.length === 0}
              title="Clear all chats"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-full md:hidden"
              onClick={toggleSidebar}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        <Button
          onClick={() => {
            startNewChat();
            if (isMobile) setIsOpen(false);
          }}
          className="m-4 gap-2"
        >
          <Plus className="h-4 w-4" />
          New Chat
        </Button>
        
        <div className="mx-4 mb-2">
          <div className="flex items-center gap-2">
            <div className="flex-1 h-px bg-border"></div>
            <span className="text-xs text-muted-foreground">Features</span>
            <div className="flex-1 h-px bg-border"></div>
          </div>
        </div>
        
        <div className="mx-4 mb-2">
          <Button
            variant={ragEnabled ? "default" : "outline"}
            size="sm"
            className="w-full flex justify-between items-center"
            onClick={() => setRagEnabled(!ragEnabled)}
          >
            <span>Knowledge Base (RAG)</span>
            <span className={cn(
              "px-2 py-0.5 rounded text-xs",
              ragEnabled ? "bg-primary-foreground" : "bg-muted text-muted-foreground"
            )}>
              {ragEnabled ? "On" : "Off"}
            </span>
          </Button>
        </div>
        
        {ragEnabled && (
          <label className="flex items-center gap-2 mx-4 p-2 border rounded-md cursor-pointer hover:bg-accent/10 transition-colors mb-2 relative">
            <FileUp className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">Upload document</span>
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              accept={getAcceptedFileTypes()}
              onChange={handleFileUpload}
              disabled={isUploading}
            />
            {isUploading && (
              <div className="absolute inset-0 bg-background/80 flex flex-col items-center justify-center">
                <Progress value={uploadProgress} className="w-4/5 h-2 mb-1" />
                <span className="text-xs text-muted-foreground">Processing...</span>
              </div>
            )}
          </label>
        )}
        
        <div className="mx-4 mb-2">
          <div className="flex items-center gap-2">
            <div className="flex-1 h-px bg-border"></div>
            <span className="text-xs text-muted-foreground">Chats</span>
            <div className="flex-1 h-px bg-border"></div>
          </div>
        </div>
        
        <ScrollArea className="flex-1 p-4 pt-0">
          <div className="space-y-2">
            {chats.map((chat) => (
              <Button
                key={chat.id}
                variant={chat.id === activeChatId ? "secondary" : "ghost"}
                className={cn(
                  "w-full justify-start text-left h-auto py-3 px-4",
                  chat.id === activeChatId ? "bg-secondary" : ""
                )}
                onClick={() => {
                  switchChat(chat.id);
                  if (isMobile) setIsOpen(false);
                }}
              >
                <div className="flex w-full items-center gap-2 overflow-hidden">
                  <MessageSquare className="h-4 w-4 shrink-0" />
                  <span className="truncate">{chat.title}</span>
                  {chat.id === activeChatId && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 ml-auto rounded-full hover:bg-destructive/10 hover:text-destructive"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteChat(chat.id);
                      }}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  )}
                </div>
              </Button>
            ))}
          </div>
        </ScrollArea>
      </div>
      
      <Button
        variant="outline"
        size="icon"
        className={cn(
          "fixed top-[calc(var(--header-height)+0.75rem)] left-4 z-10 rounded-full shadow-md h-9 w-9",
          "transition-opacity duration-300",
          isOpen && "opacity-0 pointer-events-none"
        )}
        onClick={toggleSidebar}
      >
        <ChevronRight className="h-4 w-4" />
      </Button>

      <Dialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Clear all chats?</DialogTitle>
            <DialogDescription>
              This action cannot be undone. All your conversations will be permanently deleted.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsConfirmOpen(false)}>Cancel</Button>
            <Button
              variant="destructive"
              onClick={() => {
                clearChats();
                setIsConfirmOpen(false);
              }}
            >
              Delete All
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isUploadOpen} onOpenChange={setIsUploadOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add Document to Knowledge Base</DialogTitle>
            <DialogDescription>
              This document will be used for retrieval-augmented generation (RAG).
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">Document Title</label>
              <input
                type="text"
                className="w-full p-2 border rounded-md"
                value={docTitle}
                onChange={(e) => setDocTitle(e.target.value)}
                placeholder="Enter document title"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Document Content</label>
              <textarea
                className="w-full p-2 border rounded-md h-32"
                value={docContent}
                onChange={(e) => setDocContent(e.target.value)}
                placeholder="Enter or paste document content"
              />
              <p className="text-xs text-muted-foreground">
                From file: {docFilename || "No file selected"}
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsUploadOpen(false)}>Cancel</Button>
            <Button
              onClick={handleAddDocument}
              disabled={!docTitle || !docContent}
            >
              Add Document
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Knowledge Base Settings</DialogTitle>
            <DialogDescription>
              Configure retrieval-augmented generation (RAG) settings.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">Embedding Model</label>
              <Select
                value={currentEmbeddingModel.id}
                onValueChange={handleChangeEmbeddingModel}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select embedding model" />
                </SelectTrigger>
                <SelectContent>
                  {EMBEDDING_MODELS.map(model => (
                    <SelectItem key={model.id} value={model.id}>
                      <div className="flex flex-col">
                        <span>{model.name}</span>
                        <span className="text-xs text-muted-foreground">{model.description}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground mt-1">
                Current: {currentEmbeddingModel.name} ({currentEmbeddingModel.dimensions} dimensions)
              </p>
            </div>
            
            <Button 
              onClick={handleReembedDocuments} 
              disabled={isReembedding || getAllDocuments().length === 0}
              variant="outline"
              className="w-full"
            >
              {isReembedding ? "Re-embedding..." : "Re-embed All Documents"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      
      <Dialog open={isDocsOpen} onOpenChange={setIsDocsOpen}>
        <DialogContent className="sm:max-w-md max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>Knowledge Base Documents</DialogTitle>
            <DialogDescription>
              Manage documents used for retrieval-augmented generation.
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="flex-1 pr-4 -mr-4">
            <div className="space-y-4 py-2">
              {documents.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  No documents added yet. Upload documents to enhance your AI's knowledge.
                </p>
              ) : (
                documents.map(doc => (
                  <div key={doc.id} className="border rounded-lg p-3 space-y-2">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="h-6 px-2 font-mono">
                          {getDocumentTypeIcon(doc.type)}
                        </Badge>
                        <h4 className="font-medium">{doc.title}</h4>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 rounded-full hover:bg-destructive/10 hover:text-destructive"
                        onClick={() => handleDeleteDocument(doc.id)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Added {new Date(doc.createdAt).toLocaleDateString()}
                    </p>
                    <p className="text-sm line-clamp-2 text-muted-foreground">
                      {doc.content.substring(0, 100)}...
                    </p>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
          <DialogFooter>
            <Button
              onClick={() => setIsUploadOpen(true)}
              className="w-full"
            >
              Add New Document
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
