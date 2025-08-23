# AI Platform Documentation

Welcome to the comprehensive documentation for the AI Platform - a powerful, flexible AI workflow and chat application built with modern web technologies.

## 📋 Table of Contents

- [Getting Started](./getting-started.md)
- [User Guide](./user-guide/README.md)
- [Developer Guide](./developer-guide/README.md)
- [API Reference](./api-reference/README.md)
- [Deployment Guide](./deployment.md)
- [Contributing](./contributing.md)
- [FAQ](./faq.md)

## 🚀 Overview

The AI Platform is a comprehensive solution for building, managing, and deploying AI-powered workflows and chat experiences. It features:

- **Visual Workflow Builder**: Create complex AI workflows with a drag-and-drop interface
- **Multi-Model Support**: Integration with OpenAI, Anthropic, Google AI, and more
- **Knowledge Management**: Upload and manage documents for RAG (Retrieval Augmented Generation)
- **Fine-Tuning**: Create and manage custom fine-tuned models
- **Real-time Chat**: Interactive chat interface with AI agents
- **Workspace Management**: Organize projects and settings
- **Responsive Design**: Beautiful, modern UI with liquid metal aesthetics

## 🏗️ Architecture

### Technology Stack

- **Frontend**: React 18, TypeScript, Vite
- **UI Framework**: Tailwind CSS, shadcn/ui components
- **State Management**: React Context API, React Query
- **Routing**: React Router v6
- **Database**: SQLite (client-side), LanceDB for vector storage
- **AI Integration**: Multiple provider APIs
- **Build Tool**: Vite with TypeScript

### Key Features

#### 🔧 Workflow Builder
- Visual node-based editor using ReactFlow
- Support for multiple node types (LLM, RAG, Web Search, Conditional, etc.)
- Real-time validation and execution monitoring
- Template system for reusable workflows

#### 📚 Knowledge Base
- Document upload and processing
- Vector embeddings with multiple model options
- Advanced RAG implementations
- Document chunking strategies

#### 🤖 Chat Interface
- Multi-model chat support
- Context-aware conversations
- Workspace-specific chat sessions
- Message history and persistence

#### ⚡ Fine-Tuning
- Custom model training workflows
- Job monitoring and metrics
- Integration with major AI providers
- Real-time progress tracking

## 🎨 Design System

The application uses a sophisticated design system with:

- **Liquid Metal Aesthetics**: Holographic cards, buttons, and effects
- **Semantic Color Tokens**: HSL-based color system defined in CSS variables
- **Responsive Components**: Mobile-first design approach
- **Custom Animations**: Smooth transitions and micro-interactions
- **Dark Theme**: Optimized for low-light environments

## 📖 Quick Start

1. **Installation**
   ```bash
   npm install
   npm run dev
   ```

2. **Configuration**
   - Set up API keys in the Settings panel
   - Create your first workspace
   - Upload documents to the knowledge base

3. **Build Your First Workflow**
   - Navigate to Workflow Builder
   - Drag nodes from the palette
   - Connect nodes to create your logic flow
   - Test and deploy

## 📚 Documentation Structure

- **[Getting Started](./getting-started.md)**: Installation, setup, and first steps
- **[User Guide](./user-guide/README.md)**: Complete feature walkthrough
- **[Developer Guide](./developer-guide/README.md)**: Architecture, APIs, and customization
- **[API Reference](./api-reference/README.md)**: Detailed API documentation
- **[Deployment](./deployment.md)**: Production deployment guide

## 🤝 Support

- GitHub Issues: Report bugs and request features
- Documentation: Comprehensive guides and examples
- Community: Join our Discord server

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

*Built with ❤️ using React, TypeScript, and modern web technologies*