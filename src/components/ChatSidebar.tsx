
import { useState } from 'react';
import { useChat } from '@/context/ChatContext';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  MessageSquare, 
  Plus, 
  Trash2, 
  ChevronLeft, 
  ChevronRight, 
  FileUp, 
  FilePlus
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import { addDocumentToStore } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

export function ChatSidebar() {
  const { chats, activeChatId, startNewChat, switchChat, deleteChat, clearChats, ragEnabled } = useChat();
  const [isOpen, setIsOpen] = useState(true);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [docTitle, setDocTitle] = useState('');
  const [docContent, setDocContent] = useState('');
  const isMobile = useIsMobile();
  const { toast } = useToast();

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        // Simple text file reader
        const text = await file.text();
        setDocTitle(file.name);
        setDocContent(text);
        setIsUploadOpen(true);
      } catch (error) {
        console.error('Error reading file:', error);
        toast({
          title: "Error",
          description: "Failed to read file",
          variant: "destructive"
        });
      }
    }
  };

  const handleAddDocument = async () => {
    if (docTitle && docContent) {
      try {
        await addDocumentToStore(docTitle, docContent);
        toast({
          title: "Document Added",
          description: `"${docTitle}" has been added to the knowledge base`
        });
        setIsUploadOpen(false);
        setDocTitle('');
        setDocContent('');
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
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-full"
                onClick={() => setIsUploadOpen(true)}
                title="Add document"
              >
                <FilePlus className="h-4 w-4" />
              </Button>
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
        
        {ragEnabled && (
          <label className="flex items-center gap-2 mx-4 p-2 border rounded-md cursor-pointer hover:bg-accent/10 transition-colors">
            <FileUp className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">Upload document</span>
            <input
              type="file"
              className="hidden"
              accept=".txt,.md,.json"
              onChange={handleFileUpload}
            />
          </label>
        )}
        
        <ScrollArea className="flex-1 p-4 pt-2">
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
      
      {/* Toggle button */}
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

      {/* Confirm clear chats dialog */}
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

      {/* Upload document dialog */}
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
    </>
  );
}
