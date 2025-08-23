# Getting Started

This guide will help you set up and start using the AI Platform in just a few minutes.

## 📋 Prerequisites

- Node.js 18+ and npm
- Modern web browser (Chrome, Firefox, Safari, Edge)
- Internet connection for AI model APIs

## 🚀 Installation

### Option 1: Local Development

1. **Clone and Install**
   ```bash
   git clone <your-repo-url>
   cd ai-platform
   npm install
   ```

2. **Start Development Server**
   ```bash
   npm run dev
   ```

3. **Open in Browser**
   Navigate to `http://localhost:5173`

### Option 2: Production Build

1. **Build the Application**
   ```bash
   npm run build
   ```

2. **Serve the Build**
   ```bash
   npm run preview
   ```

## ⚙️ Initial Setup

### 1. First Launch

When you first open the application, it will automatically:
- Create a default workspace called "My Workspace"
- Set up initial configuration with recommended settings
- Create example workflows to get you started

### 2. Configure API Keys

To use AI models, you'll need to set up API keys:

1. **Navigate to Settings**
   - Click the Settings button in the top-right corner
   - Or go to the Profile page

2. **Add API Keys**
   - **OpenAI**: For GPT models
   - **Anthropic**: For Claude models
   - **Google AI**: For Gemini models
   - **Hugging Face**: For open-source models
   - **Perplexity**: For web-enhanced responses

3. **Choose Your Models**
   Each provider offers different models with varying capabilities:
   - **Text Generation**: GPT-4, Claude-3, Gemini Pro
   - **Embeddings**: OpenAI embeddings, Hugging Face models
   - **Vision**: GPT-4 Vision, Claude-3 Opus

### 3. Set Up Your First Workspace

1. **Workspace Overview**
   - Workspaces organize your projects, documents, and settings
   - Each workspace has its own configuration and knowledge base

2. **Customize Settings**
   - Go to Profile → Workspace Settings
   - Configure default models
   - Set RAG parameters
   - Adjust UI preferences

## 🎯 Your First Workflow

Let's create a simple AI workflow:

### 1. Open Workflow Builder

1. Click "Open Workflow Builder" from the dashboard
2. You'll see a visual editor with a node palette on the left

### 2. Create a Basic Chat Workflow

1. **Add Input Node**
   - Drag "Input" from the palette
   - Configure it to accept user messages

2. **Add LLM Node**
   - Drag "LLM" from the palette
   - Select your preferred model (e.g., GPT-4)
   - Set a system prompt

3. **Add Output Node**
   - Drag "Output" from the palette
   - Configure to return the response

4. **Connect the Nodes**
   - Draw connections between nodes
   - Input → LLM → Output

5. **Test Your Workflow**
   - Click the "Run" button
   - Enter a test message
   - See the AI response

### 3. Enhance with RAG

To add knowledge-based responses:

1. **Upload Documents**
   - Go to Knowledge Base
   - Upload PDF, TXT, or DOCX files
   - Wait for processing

2. **Add RAG Node**
   - In your workflow, add a RAG node
   - Configure retrieval settings
   - Connect: Input → RAG → LLM → Output

## 💬 Start Chatting

### 1. Basic Chat

1. **Navigate to Chat**
   - Click the chat icon in the sidebar
   - Or go to the Chat page

2. **Select a Model**
   - Choose from your configured models
   - Each has different strengths

3. **Start Conversing**
   - Type your message
   - Get AI responses
   - Context is maintained across the conversation

### 2. Use Knowledge Base

If you've uploaded documents:
- Enable RAG in chat settings
- Your AI will reference your documents
- Ask questions about your uploaded content

## 📚 Knowledge Management

### 1. Upload Documents

1. **Go to Knowledge Base**
2. **Upload Files**
   - Supported formats: PDF, TXT, DOCX, MD
   - Drag and drop or click to select
3. **Processing**
   - Documents are automatically chunked
   - Embeddings are generated
   - Ready for RAG queries

### 2. Configure Processing

- **Chunk Size**: How to split documents (512-2048 tokens)
- **Overlap**: Overlap between chunks (50-200 tokens)
- **Embedding Model**: Which model to use for vectors

## 🔧 Advanced Features

### Fine-Tuning Models

1. **Prepare Training Data**
   - Format as JSONL with input/output pairs
   - Upload to the Fine-Tuning section

2. **Start Training Job**
   - Select base model
   - Configure hyperparameters
   - Monitor progress

### Workflow Scheduling

1. **Schedule Workflows**
   - Set cron expressions
   - Automate recurring tasks
   - Monitor execution logs

### Multi-Workspace Management

1. **Create Workspaces**
   - Organize different projects
   - Separate API keys and settings
   - Switch between contexts

## 🚨 Troubleshooting

### Common Issues

1. **API Key Errors**
   - Verify keys are correctly entered
   - Check API quotas and billing
   - Ensure proper permissions

2. **Slow Performance**
   - Check internet connection
   - Consider using faster models
   - Optimize document chunk sizes

3. **Workflow Errors**
   - Validate all node connections
   - Check required fields
   - Review error logs

### Getting Help

- Check the [FAQ](./faq.md) for common questions
- Review error messages in the browser console
- Check network requests for API issues

## 🎉 Next Steps

Now that you're set up:

1. **Explore Examples**: Check the pre-built workflow templates
2. **Read User Guide**: Dive deeper into each feature
3. **Join Community**: Connect with other users
4. **Build Something Cool**: Create your first AI application

---

Ready to build amazing AI experiences? Let's go! 🚀