import { Workflow, WorkflowNode, WorkflowExecutionResult } from './workflowTypes';

/**
 * Types for node execution lifecycle and results
 */
interface NodeExecutionResult {
  success: boolean;
  output?: any;
  error?: string;
  executionTime?: string;
}


interface ExecutionCallbacks {
  onNodeStart?: (nodeId: string) => void;
  onNodeComplete?: (nodeId: string, output: any) => void;
  onNodeError?: (nodeId: string, error: string) => void;
  onLogUpdate?: (log: string) => void;
  onWorkflowComplete?: (result: WorkflowExecutionResult) => void;
}

/**
 * Class to handle workflow execution
 */
class WorkflowExecutionService {
  private executingWorkflowId: string | null = null;
  private nodeResults: Record<string, NodeExecutionResult> = {};
  private context: Record<string, any> = {};
  private logs: string[] = [];
  private callbacks: ExecutionCallbacks = {};
  private executionStats = {
    totalExecutionTime: 0,
    nodesExecuted: 0,
    errorsEncountered: 0,
    successfulNodes: 0
  };
  private isExecuting = false;

  /**
   * Get the execution order of nodes by performing a topological sort
   */
  private getExecutionOrder(workflow: Workflow): string[] {
    const nodes = new Map<string, WorkflowNode>();
    const adjacencyList = new Map<string, string[]>();
    const inDegree = new Map<string, number>();
    
    // Initialize data structures
    workflow.nodes.forEach(node => {
      nodes.set(node.id, node);
      adjacencyList.set(node.id, []);
      inDegree.set(node.id, 0);
    });
    
    // Build the adjacency list and in-degree maps
    workflow.edges.forEach(edge => {
      const source = edge.source;
      const target = edge.target;
      
      // Validate edge endpoints exist
      if (!nodes.has(source) || !nodes.has(target)) {
        this.log(`Warning: Edge ${edge.id} references non-existent node`);
        return;
      }
      
      adjacencyList.get(source)?.push(target);
      inDegree.set(target, (inDegree.get(target) || 0) + 1);
    });
    
    // Find all trigger nodes first (they should always execute first)
    const triggerNodes = Array.from(nodes.values())
      .filter(node => node.type === 'trigger')
      .map(node => node.id);
    
    // Find other entry points (nodes with in-degree 0 that aren't triggers)
    const otherEntryPoints = Array.from(inDegree.entries())
      .filter(([nodeId, degree]) => degree === 0 && !triggerNodes.includes(nodeId))
      .map(([nodeId]) => nodeId);
    
    // Start with trigger nodes, then other entry points
    const queue = [...triggerNodes, ...otherEntryPoints];
    
    // Perform topological sort
    const result: string[] = [];
    
    while (queue.length > 0) {
      const nodeId = queue.shift()!;
      result.push(nodeId);
      
      adjacencyList.get(nodeId)?.forEach(neighborId => {
        inDegree.set(neighborId, (inDegree.get(neighborId) || 0) - 1);
        
        if (inDegree.get(neighborId) === 0) {
          queue.push(neighborId);
        }
      });
    }
    
    // Check for cycles and unreachable nodes
    if (result.length !== workflow.nodes.length) {
      const unreachableNodes = workflow.nodes
        .filter(node => !result.includes(node.id))
        .map(node => node.id);
      this.log(`Warning: Workflow contains cycles or unreachable nodes: ${unreachableNodes.join(', ')}`);
    }
    
    return result;
  }

  /**
   * Validate workflow structure before execution
   */
  private validateWorkflow(workflow: Workflow): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    // Check for empty workflow
    if (workflow.nodes.length === 0) {
      errors.push("Workflow has no nodes");
    }
    
    // Check for trigger nodes
    const triggerNodes = workflow.nodes.filter(node => node.type === 'trigger');
    if (triggerNodes.length === 0) {
      errors.push("Workflow must have at least one trigger node");
    }
    
    // Check for orphaned nodes (nodes with no incoming or outgoing connections)
    workflow.nodes.forEach(node => {
      const hasIncoming = workflow.edges.some(edge => edge.target === node.id);
      const hasOutgoing = workflow.edges.some(edge => edge.source === node.id);
      
      if (!hasIncoming && !hasOutgoing && node.type !== 'trigger') {
        errors.push(`Node "${node.data.label || node.id}" is isolated (no connections)`);
      }
    });
    
    // Check for invalid edge references
    workflow.edges.forEach(edge => {
      const sourceExists = workflow.nodes.some(node => node.id === edge.source);
      const targetExists = workflow.nodes.some(node => node.id === edge.target);
      
      if (!sourceExists) {
        errors.push(`Edge references non-existent source node: ${edge.source}`);
      }
      if (!targetExists) {
        errors.push(`Edge references non-existent target node: ${edge.target}`);
      }
    });
    
    // Check for self-loops
    workflow.edges.forEach(edge => {
      if (edge.source === edge.target) {
        errors.push(`Self-loop detected in edge: ${edge.id}`);
      }
    });
    
    return {
      valid: errors.length === 0,
      errors
    };
  }
  
  /**
   * Add a log message
   */
  private log(message: string) {
    const timestamp = new Date().toISOString().split('T')[1].replace('Z', '');
    const log = `[${timestamp}] ${message}`;
    this.logs.push(log);
    this.callbacks.onLogUpdate?.(log);
  }
  
  /**
   * Execute a node and return its result
   */
  private async executeNode(node: WorkflowNode): Promise<NodeExecutionResult> {
    const startTime = performance.now();
    this.log(`Starting execution of node: ${node.data.label || node.id} (${node.type})`);
    this.callbacks.onNodeStart?.(node.id);
    
    try {
      // Validate node data before execution
      const validationResult = this.validateNodeData(node);
      if (!validationResult.valid) {
        throw new Error(`Node validation failed: ${validationResult.errors.join(', ')}`);
      }
      
      let result;
      
      switch (node.type) {
        case 'trigger':
          result = await this.executeTriggerNode(node);
          break;
          
        case 'llm':
          result = await this.executeLLMNode(node);
          break;
          
        case 'rag':
        case 'lancedb':
          result = await this.executeRAGNode(node);
          break;
          
        case 'web-search':
          result = await this.executeWebSearchNode(node);
          break;
          
        case 'conditional':
          result = await this.executeConditionalNode(node);
          break;
          
        case 'function':
          result = await this.executeFunctionNode(node);
          break;
          
        case 'input':
          result = await this.executeInputNode(node);
          break;
          
        case 'output':
          result = await this.executeOutputNode(node);
          break;
          
        case 'agent':
          result = await this.executeAgentNode(node);
          break;
          
        default:
          throw new Error(`Unsupported node type: ${node.type}`);
      }
      
      const endTime = performance.now();
      const executionTime = `${((endTime - startTime) / 1000).toFixed(2)}s`;
      
      this.executionStats.nodesExecuted++;
      this.executionStats.successfulNodes++;
      this.executionStats.totalExecutionTime += (endTime - startTime);
      
      this.log(`Node ${node.data.label || node.id} completed successfully in ${executionTime}`);
      this.callbacks.onNodeComplete?.(node.id, result);
      
      return {
        success: true,
        output: result,
        executionTime
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.log(`Error in node ${node.data.label || node.id}: ${errorMessage}`);
      this.callbacks.onNodeError?.(node.id, errorMessage);
      
      this.executionStats.nodesExecuted++;
      this.executionStats.errorsEncountered++;
      
      return {
        success: false,
        error: errorMessage,
        executionTime: `${((performance.now() - startTime) / 1000).toFixed(2)}s`
      };
    }
  }

  /**
   * Validate node data before execution
   */
  private validateNodeData(node: WorkflowNode): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    switch (node.type) {
      case 'llm':
        if (!node.data.model) errors.push("LLM node missing model configuration");
        if (!node.data.prompt) errors.push("LLM node missing prompt");
        break;
        
      case 'rag':
      case 'lancedb':
        if (!node.data.query && !this.context[`${node.id}_input`]) {
          errors.push("RAG node missing query");
        }
        break;
        
      case 'web-search':
        if (!node.data.query) errors.push("Web search node missing query");
        break;
        
      case 'conditional':
        if (!node.data.condition && !node.data.left) {
          errors.push("Conditional node missing condition logic");
        }
        break;
        
      case 'function':
        if (!node.data.code) errors.push("Function node missing code");
        break;
        
      case 'input':
        if (!node.data.variableName) errors.push("Input node missing variable name");
        break;
        
      case 'output':
        if (!node.data.variableName) errors.push("Output node missing variable name");
        break;
    }
    
    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Execute a trigger node
   */
  private async executeTriggerNode(node: WorkflowNode): Promise<any> {
    this.log(`Trigger Node - Type: ${node.data.triggerType || 'manual'}`);
    
    // Initialize workflow with trigger data
    const triggerData = node.data.payload || node.data.triggerData || {};
    
    // Store trigger data in context for downstream nodes
    this.context['trigger'] = triggerData;
    this.context[`${node.id}_output`] = triggerData;
    
    return {
      type: 'trigger',
      data: triggerData,
      timestamp: new Date().toISOString(),
      triggerId: node.id
    };
  }

  /**
   * Execute an input node
   */
  private async executeInputNode(node: WorkflowNode): Promise<any> {
    const variableName = node.data.variableName;
    const defaultValue = node.data.defaultValue;
    const dataType = node.data.dataType || 'string';
    
    // Check if value is provided in context, otherwise use default
    let value = this.context[variableName] || defaultValue;
    
    // Type conversion based on dataType
    switch (dataType) {
      case 'number':
        value = Number(value) || 0;
        break;
      case 'boolean':
        value = Boolean(value);
        break;
      case 'object':
      case 'array':
        if (typeof value === 'string') {
          try {
            value = JSON.parse(value);
          } catch {
            value = defaultValue || (dataType === 'array' ? [] : {});
          }
        }
        break;
      default:
        value = String(value || '');
    }
    
    this.context[variableName] = value;
    this.log(`Input Node - Variable "${variableName}" set to: ${JSON.stringify(value)}`);
    
    return {
      variableName,
      value,
      dataType
    };
  }

  /**
   * Execute an output node
   */
  private async executeOutputNode(node: WorkflowNode): Promise<any> {
    const variableName = node.data.variableName;
    const inputValue = this.context[`${node.id}_input`] || this.context[variableName] || null;
    
    // Store in final output context
    this.context[variableName] = inputValue;
    
    this.log(`Output Node - Variable "${variableName}" captured: ${JSON.stringify(inputValue)}`);
    
    return {
      variableName,
      value: inputValue,
      captured: true
    };
  }

  /**
   * Execute an agent node
   */
  private async executeAgentNode(node: WorkflowNode): Promise<any> {
    const { name, model, systemPrompt, temperature, maxTokens, skills } = node.data;
    
    this.log(`Agent Node - "${name}" using model: ${model}`);
    
    // Get input from previous nodes or context
    const input = this.context[`${node.id}_input`] || '';
    
    // Process the agent request
    const agentPrompt = systemPrompt 
      ? `${systemPrompt}\n\nUser: ${input}`
      : input;
    
    // Simulate agent processing (in real implementation, this would call actual AI service)
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const response = `Agent "${name}" processed: "${String(input).substring(0, 50)}..." using skills: ${skills?.join(', ') || 'none'}`;
    
    this.log(`Agent Node - Response generated (${response.length} chars)`);
    
    return {
      agentName: name,
      response,
      model,
      skills: skills || [],
      usage: { 
        totalTokens: Math.floor(Math.random() * 1000) + 100,
        promptTokens: Math.floor(Math.random() * 500) + 50,
        completionTokens: Math.floor(Math.random() * 500) + 50
      }
    };
  }
  
  /**
   * Execute an LLM node
   */
  private async executeLLMNode(node: WorkflowNode): Promise<any> {
    // In a real implementation, this would call an actual LLM API
    const { model, prompt, temperature } = node.data;
    
    this.log(`LLM Node - Using model: ${model}, Temperature: ${temperature}`);
    
    // Process variables in the prompt
    let processedPrompt = prompt;
    const variablePattern = /\{\{([^}]+)\}\}/g;
    const variables = prompt.match(variablePattern) || [];
    
    for (const variable of variables) {
      const varName = variable.slice(2, -2).trim();
      const varValue = this.context[varName];
      
      if (varValue) {
        processedPrompt = processedPrompt.replace(variable, String(varValue));
      }
    }
    
    this.log(`LLM Node - Processed prompt: ${processedPrompt.substring(0, 100)}...`);
    
    // Simulated delay and response
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return {
      text: `This is a simulated response for prompt: "${processedPrompt.substring(0, 30)}..."`,
      model,
      usage: { total_tokens: Math.floor(Math.random() * 1000) + 100 }
    };
  }
  
  /**
   * Execute a RAG node
   */
  private async executeRAGNode(node: WorkflowNode): Promise<any> {
    const { retrievalMethod, topK, documents } = node.data;
    
    this.log(`RAG Node - Method: ${retrievalMethod}, TopK: ${topK}`);
    
    // In a real implementation, this would retrieve documents from a vector store
    // For the demo, we'll just return the configured documents or simulated ones
    const retrievedDocs = documents && documents.length > 0 
      ? documents.slice(0, topK) 
      : Array(topK).fill(0).map((_, i) => ({
          id: `doc-${i}`,
          title: `Sample Document ${i}`,
          content: `This is sample content for document ${i}`,
          score: (Math.random() * 0.3 + 0.7).toFixed(2) // Random score between 0.7 and 1.0
        }));
    
    this.log(`RAG Node - Retrieved ${retrievedDocs.length} documents`);
    
    // Simulated delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    return {
      documents: retrievedDocs,
      count: retrievedDocs.length,
      method: retrievalMethod
    };
  }
  
  /**
   * Execute a web search node
   */
  private async executeWebSearchNode(node: WorkflowNode): Promise<any> {
    const { query, resultCount, provider } = node.data;
    
    this.log(`WebSearch Node - Query: ${query}, Provider: ${provider || 'default'}`);
    
    // Process variables in the query
    let processedQuery = query;
    const variablePattern = /\{\{([^}]+)\}\}/g;
    const variables = query.match(variablePattern) || [];
    
    for (const variable of variables) {
      const varName = variable.slice(2, -2).trim();
      const varValue = this.context[varName];
      
      if (varValue) {
        processedQuery = processedQuery.replace(variable, String(varValue));
      }
    }
    
    // Simulated search results
    const results = Array(resultCount || 3).fill(0).map((_, i) => ({
      title: `Search Result ${i+1} for "${processedQuery}"`,
      url: `https://example.com/result-${i+1}`,
      snippet: `This is a snippet of content related to "${processedQuery}" with some information that might be useful.`,
      position: i+1
    }));
    
    this.log(`WebSearch Node - Found ${results.length} results`);
    
    // Simulated delay
    await new Promise(resolve => setTimeout(resolve, 1200));
    
    return {
      results,
      query: processedQuery,
      totalResults: results.length,
      provider: provider || 'default'
    };
  }
  
  /**
   * Execute a conditional node
   */
  private async executeConditionalNode(node: WorkflowNode): Promise<any> {
    const { condition, conditionType } = node.data;
    
    this.log(`Conditional Node - Type: ${conditionType}, Evaluating condition`);
    
    let result = false;
    
    if (conditionType === 'expression') {
      // Simple expression evaluation
      try {
        // Replace variables in the condition
        let processedCondition = condition;
        const variablePattern = /\{\{([^}]+)\}\}/g;
        const variables = condition.match(variablePattern) || [];
        
        for (const variable of variables) {
          const varName = variable.slice(2, -2).trim();
          const varValue = this.context[varName];
          
          if (varValue !== undefined) {
            processedCondition = processedCondition.replace(
              variable, 
              typeof varValue === 'object' ? JSON.stringify(varValue) : String(varValue)
            );
          }
        }
        
        // WARNING: eval is used for demonstration only - in a real app, use a safer alternative
        // eslint-disable-next-line no-eval
        result = eval(processedCondition);
        this.log(`Conditional Node - Condition evaluated to: ${result}`);
      } catch (error) {
        this.log(`Conditional Node - Error evaluating condition: ${error}`);
        throw new Error(`Error evaluating condition: ${error}`);
      }
    } else if (conditionType === 'comparison') {
      // Simple comparison
      const { left, operator, right } = node.data;
      const leftValue = this.context[left] || left;
      const rightValue = this.context[right] || right;
      
      switch (operator) {
        case '==': result = leftValue == rightValue; break;
        case '===': result = leftValue === rightValue; break;
        case '!=': result = leftValue != rightValue; break;
        case '!==': result = leftValue !== rightValue; break;
        case '>': result = leftValue > rightValue; break;
        case '>=': result = leftValue >= rightValue; break;
        case '<': result = leftValue < rightValue; break;
        case '<=': result = leftValue <= rightValue; break;
        default: throw new Error(`Unknown operator: ${operator}`);
      }
      
      this.log(`Conditional Node - ${leftValue} ${operator} ${rightValue} = ${result}`);
    }
    
    return { result, condition };
  }
  
  /**
   * Execute a function node
   */
  private async executeFunctionNode(node: WorkflowNode): Promise<any> {
    const { code, language, functionName } = node.data;
    
    this.log(`Function Node - Executing ${functionName || 'anonymous function'}`);
    
    // In a production environment, you'd use a safer execution method like a web worker
    // or a remote serverless function rather than eval
    try {
      // Create a context object with variables
      const contextStr = Object.entries(this.context)
        .map(([key, value]) => `const ${key} = ${JSON.stringify(value)};`)
        .join('\n');
      
      // Prepare the function to execute
      const functionBody = `
        ${contextStr}
        
        ${code}
        
        // Execute the function with context
        ${functionName ? functionName : '(function(context) { ' + code + ' })'};
      `;
      
      // WARNING: eval is used for demonstration only - in a real app, use a safer alternative
      // eslint-disable-next-line no-eval
      const result = eval(functionBody)(this.context);
      this.log(`Function Node - Execution successful`);
      
      return result;
    } catch (error) {
      this.log(`Function Node - Execution error: ${error}`);
      throw new Error(`Error executing function: ${error}`);
    }
  }
  
  /**
   * Execute the workflow with enhanced error handling and validation
   */
  public async executeWorkflow(
    workflow: Workflow, 
    callbacks: ExecutionCallbacks = {}
  ): Promise<WorkflowExecutionResult> {
    // Prevent concurrent execution
    if (this.isExecuting) {
      throw new Error('Workflow execution already in progress');
    }
    
    // Reset state
    this.isExecuting = true;
    this.executingWorkflowId = workflow.id;
    this.nodeResults = {};
    this.context = {};
    this.logs = [];
    this.callbacks = callbacks;
    this.executionStats = {
      totalExecutionTime: 0,
      nodesExecuted: 0,
      errorsEncountered: 0,
      successfulNodes: 0
    };
    
    const startTime = performance.now();
    this.log(`Starting execution of workflow: ${workflow.name || workflow.id}`);
    
    try {
      // Validate workflow structure first
      const validation = this.validateWorkflow(workflow);
      if (!validation.valid) {
        throw new Error(`Workflow validation failed: ${validation.errors.join('; ')}`);
      }
      
      // Get the execution order
      const executionOrder = this.getExecutionOrder(workflow);
      this.log(`Execution order: ${executionOrder.length} nodes - ${executionOrder.join(' → ')}`);
      
      // Initialize context with any global variables or settings
      this.context['__workflow__'] = {
        id: workflow.id,
        name: workflow.name,
        startedAt: new Date().toISOString()
      };
      
      // Execute each node in order
      for (const nodeId of executionOrder) {
        const node = workflow.nodes.find(n => n.id === nodeId);
        
        if (!node) {
          this.log(`Warning: Node ${nodeId} not found in workflow`);
          continue;
        }
        
        // Prepare node context from incoming edges
        await this.prepareNodeContext(node, workflow);
        
        // Execute the node
        const result = await this.executeNode(node);
        this.nodeResults[nodeId] = result;
        
        // Update global context with node output
        if (result.success) {
          this.context[nodeId] = result.output;
          this.context[`${nodeId}_output`] = result.output;
        } else {
          this.log(`Node ${node.data.label || nodeId} failed: ${result.error}`);
          
          // Check if this is a critical path node or if we should continue
          const canContinue = this.shouldContinueAfterFailure(node, workflow);
          if (!canContinue) {
            this.log('Critical node failed, stopping workflow execution');
            break;
          }
        }
      }
      
      // Gather final outputs
      const output = this.gatherWorkflowOutputs(workflow);
      
      // Calculate overall success
      const overallSuccess = this.executionStats.errorsEncountered === 0;
      
      const endTime = performance.now();
      const totalExecutionTime = `${((endTime - startTime) / 1000).toFixed(2)}s`;
      
      this.log(`Workflow execution ${overallSuccess ? 'completed successfully' : 'completed with errors'} in ${totalExecutionTime}`);
      this.log(`Stats: ${this.executionStats.successfulNodes}/${this.executionStats.nodesExecuted} nodes successful`);
      
      const result: WorkflowExecutionResult = {
        success: overallSuccess,
        output,
        nodeResults: { ...this.nodeResults },
        executionTime: totalExecutionTime,
        logs: [...this.logs],
        stats: { ...this.executionStats }
      };
      
      callbacks.onWorkflowComplete?.(result);
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.log(`Workflow execution failed: ${errorMessage}`);
      
      const executionTime = `${((performance.now() - startTime) / 1000).toFixed(2)}s`;
      const result: WorkflowExecutionResult = {
        success: false,
        error: errorMessage,
        nodeResults: { ...this.nodeResults },
        executionTime,
        logs: [...this.logs],
        stats: { ...this.executionStats }
      };
      
      callbacks.onWorkflowComplete?.(result);
      return result;
    } finally {
      this.isExecuting = false;
      this.executingWorkflowId = null;
    }
  }

  /**
   * Prepare context for a node based on its incoming edges
   */
  private async prepareNodeContext(node: WorkflowNode, workflow: Workflow): Promise<void> {
    const incomingEdges = workflow.edges.filter(edge => edge.target === node.id);
    
    if (incomingEdges.length === 0) {
      // This is an entry node (trigger, input, etc.)
      return;
    }
    
    // Collect outputs from source nodes
    const inputs: any[] = [];
    let primaryInput: any = null;
    
    for (const edge of incomingEdges) {
      const sourceNodeId = edge.source;
      const sourceNodeResult = this.nodeResults[sourceNodeId];
      
      if (sourceNodeResult && sourceNodeResult.success) {
        inputs.push(sourceNodeResult.output);
        
        // The first successful input becomes the primary input
        if (primaryInput === null) {
          primaryInput = sourceNodeResult.output;
        }
        
        // Store with specific handle names if provided
        if (edge.sourceHandle) {
          const handleName = edge.sourceHandle.replace('handle-', '');
          this.context[handleName] = sourceNodeResult.output;
        }
      }
    }
    
    // Store aggregated inputs
    this.context[`${node.id}_input`] = primaryInput;
    this.context[`${node.id}_inputs`] = inputs;
  }

  /**
   * Determine if workflow should continue after a node failure
   */
  private shouldContinueAfterFailure(node: WorkflowNode, workflow: Workflow): boolean {
    // For now, only stop on trigger node failures
    // In the future, this could be configurable per node
    return node.type !== 'trigger';
  }

  /**
   * Gather final outputs from output nodes and context
   */
  private gatherWorkflowOutputs(workflow: Workflow): Record<string, any> {
    const output: Record<string, any> = {};
    
    // Collect from output nodes
    const outputNodes = workflow.nodes.filter(node => node.type === 'output');
    outputNodes.forEach(node => {
      if (node.data.variableName && this.context[node.data.variableName] !== undefined) {
        output[node.data.variableName] = this.context[node.data.variableName];
      }
    });
    
    // If no output nodes, include some default outputs
    if (outputNodes.length === 0) {
      // Include outputs from the last executed nodes
      const lastNodes = workflow.nodes
        .filter(node => this.nodeResults[node.id]?.success)
        .slice(-3); // Last 3 successful nodes
      
      lastNodes.forEach(node => {
        if (this.nodeResults[node.id]?.output) {
          output[`${node.data.label || node.id}_output`] = this.nodeResults[node.id].output;
        }
      });
    }
    
    return output;
  }

  /**
   * Get current execution status
   */
  public getExecutionStatus() {
    return {
      isExecuting: this.isExecuting,
      executingWorkflowId: this.executingWorkflowId,
      stats: { ...this.executionStats },
      logs: [...this.logs]
    };
  }

  /**
   * Stop current execution (if possible)
   */
  public stopExecution() {
    if (this.isExecuting) {
      this.log('Execution stopped by user request');
      this.isExecuting = false;
      this.executingWorkflowId = null;
    }
  }
}

export const workflowExecutionService = new WorkflowExecutionService();