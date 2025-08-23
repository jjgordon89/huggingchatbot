import { Workflow, WorkflowNode, WorkflowEdge, NodeType } from './workflowTypes';

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  suggestions: string[];
}

export interface NodeValidation {
  nodeId: string;
  nodeType: NodeType;
  valid: boolean;
  errors: string[];
  warnings: string[];
}

export class WorkflowValidationService {
  /**
   * Perform comprehensive workflow validation
   */
  public validateWorkflow(workflow: Workflow): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    const suggestions: string[] = [];

    // Basic structure validation
    this.validateStructure(workflow, errors);
    
    // Node-specific validation
    const nodeValidations = this.validateNodes(workflow);
    nodeValidations.forEach(nv => {
      errors.push(...nv.errors);
      warnings.push(...nv.warnings);
    });
    
    // Edge validation
    this.validateEdges(workflow, errors, warnings);
    
    // Flow validation
    this.validateFlow(workflow, errors, warnings, suggestions);
    
    // Performance and best practices
    this.validateBestPractices(workflow, warnings, suggestions);

    return {
      valid: errors.length === 0,
      errors,
      warnings,
      suggestions
    };
  }

  /**
   * Validate basic workflow structure
   */
  private validateStructure(workflow: Workflow, errors: string[]): void {
    if (!workflow.id) {
      errors.push('Workflow missing ID');
    }
    
    if (!workflow.name || workflow.name.trim() === '') {
      errors.push('Workflow missing name');
    }
    
    if (!Array.isArray(workflow.nodes)) {
      errors.push('Workflow nodes must be an array');
      return;
    }
    
    if (!Array.isArray(workflow.edges)) {
      errors.push('Workflow edges must be an array');
      return;
    }
    
    if (workflow.nodes.length === 0) {
      errors.push('Workflow must contain at least one node');
    }
  }

  /**
   * Validate individual nodes
   */
  private validateNodes(workflow: Workflow): NodeValidation[] {
    return workflow.nodes.map(node => this.validateNode(node));
  }

  /**
   * Validate a single node
   */
  private validateNode(node: WorkflowNode): NodeValidation {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Basic node structure
    if (!node.id) {
      errors.push('Node missing ID');
    }
    
    if (!node.type) {
      errors.push('Node missing type');
    }
    
    if (!node.data) {
      errors.push('Node missing data');
      return { nodeId: node.id, nodeType: node.type, valid: false, errors, warnings };
    }

    // Type-specific validation
    switch (node.type) {
      case 'trigger':
        this.validateTriggerNode(node, errors, warnings);
        break;
      case 'llm':
        this.validateLLMNode(node, errors, warnings);
        break;
      case 'rag':
      case 'lancedb':
        this.validateRAGNode(node, errors, warnings);
        break;
      case 'web-search':
        this.validateWebSearchNode(node, errors, warnings);
        break;
      case 'conditional':
        this.validateConditionalNode(node, errors, warnings);
        break;
      case 'function':
        this.validateFunctionNode(node, errors, warnings);
        break;
      case 'input':
        this.validateInputNode(node, errors, warnings);
        break;
      case 'output':
        this.validateOutputNode(node, errors, warnings);
        break;
      case 'agent':
        this.validateAgentNode(node, errors, warnings);
        break;
      default:
        errors.push(`Unknown node type: ${node.type}`);
    }

    return {
      nodeId: node.id,
      nodeType: node.type,
      valid: errors.length === 0,
      errors,
      warnings
    };
  }

  private validateTriggerNode(node: WorkflowNode, errors: string[], warnings: string[]): void {
    if (!node.data.label) {
      warnings.push(`Trigger node "${node.id}" missing label`);
    }
    
    const triggerType = node.data.triggerType || 'manual';
    if (!['manual', 'scheduled', 'webhook'].includes(triggerType)) {
      errors.push(`Invalid trigger type: ${triggerType}`);
    }
    
    if (triggerType === 'scheduled' && !node.data.schedule) {
      errors.push('Scheduled trigger missing schedule configuration');
    }
  }

  private validateLLMNode(node: WorkflowNode, errors: string[], warnings: string[]): void {
    if (!node.data.model) {
      errors.push(`LLM node "${node.id}" missing model configuration`);
    }
    
    if (!node.data.prompt) {
      errors.push(`LLM node "${node.id}" missing prompt`);
    } else if (node.data.prompt.length < 10) {
      warnings.push(`LLM node "${node.id}" has very short prompt`);
    }
    
    if (node.data.temperature && (node.data.temperature < 0 || node.data.temperature > 2)) {
      warnings.push(`LLM node "${node.id}" temperature should be between 0 and 2`);
    }
    
    if (node.data.maxTokens && node.data.maxTokens < 1) {
      errors.push(`LLM node "${node.id}" maxTokens must be positive`);
    }
  }

  private validateRAGNode(node: WorkflowNode, errors: string[], warnings: string[]): void {
    if (!node.data.retrievalMethod) {
      errors.push(`RAG node "${node.id}" missing retrieval method`);
    }
    
    if (!node.data.topK || node.data.topK < 1) {
      errors.push(`RAG node "${node.id}" topK must be a positive integer`);
    }
    
    if (node.data.topK > 50) {
      warnings.push(`RAG node "${node.id}" topK is very high, may impact performance`);
    }
  }

  private validateWebSearchNode(node: WorkflowNode, errors: string[], warnings: string[]): void {
    if (!node.data.query && !node.data.queryTemplate) {
      errors.push(`Web search node "${node.id}" missing query or query template`);
    }
    
    if (node.data.resultCount && node.data.resultCount < 1) {
      errors.push(`Web search node "${node.id}" resultCount must be positive`);
    }
    
    if (node.data.resultCount > 20) {
      warnings.push(`Web search node "${node.id}" requesting many results, may be slow`);
    }
  }

  private validateConditionalNode(node: WorkflowNode, errors: string[], warnings: string[]): void {
    const hasCondition = node.data.condition;
    const hasComparison = node.data.left && node.data.operator && node.data.right;
    
    if (!hasCondition && !hasComparison) {
      errors.push(`Conditional node "${node.id}" missing condition logic`);
    }
    
    if (hasComparison && !['==', '===', '!=', '!==', '>', '>=', '<', '<='].includes(node.data.operator)) {
      errors.push(`Conditional node "${node.id}" has invalid operator`);
    }
  }

  private validateFunctionNode(node: WorkflowNode, errors: string[], warnings: string[]): void {
    if (!node.data.code) {
      errors.push(`Function node "${node.id}" missing code`);
    }
    
    if (!node.data.functionName) {
      warnings.push(`Function node "${node.id}" missing function name`);
    }
    
    // Basic syntax check for common issues
    if (node.data.code && node.data.code.includes('eval(')) {
      warnings.push(`Function node "${node.id}" uses eval(), which may be unsafe`);
    }
  }

  private validateInputNode(node: WorkflowNode, errors: string[], warnings: string[]): void {
    if (!node.data.variableName) {
      errors.push(`Input node "${node.id}" missing variable name`);
    }
    
    if (!node.data.dataType) {
      warnings.push(`Input node "${node.id}" missing data type specification`);
    }
  }

  private validateOutputNode(node: WorkflowNode, errors: string[], warnings: string[]): void {
    if (!node.data.variableName) {
      errors.push(`Output node "${node.id}" missing variable name`);
    }
  }

  private validateAgentNode(node: WorkflowNode, errors: string[], warnings: string[]): void {
    if (!node.data.name) {
      errors.push(`Agent node "${node.id}" missing name`);
    }
    
    if (!node.data.model) {
      errors.push(`Agent node "${node.id}" missing model configuration`);
    }
    
    if (node.data.skills && !Array.isArray(node.data.skills)) {
      errors.push(`Agent node "${node.id}" skills must be an array`);
    }
  }

  /**
   * Validate workflow edges
   */
  private validateEdges(workflow: Workflow, errors: string[], warnings: string[]): void {
    const nodeIds = new Set(workflow.nodes.map(n => n.id));
    
    workflow.edges.forEach(edge => {
      if (!edge.id) {
        errors.push('Edge missing ID');
      }
      
      if (!edge.source || !nodeIds.has(edge.source)) {
        errors.push(`Edge "${edge.id}" references non-existent source node: ${edge.source}`);
      }
      
      if (!edge.target || !nodeIds.has(edge.target)) {
        errors.push(`Edge "${edge.id}" references non-existent target node: ${edge.target}`);
      }
      
      if (edge.source === edge.target) {
        errors.push(`Edge "${edge.id}" creates self-loop`);
      }
    });
    
    // Check for duplicate edges
    const edgeKeys = new Set();
    workflow.edges.forEach(edge => {
      const key = `${edge.source}->${edge.target}`;
      if (edgeKeys.has(key)) {
        warnings.push(`Duplicate edge between ${edge.source} and ${edge.target}`);
      }
      edgeKeys.add(key);
    });
  }

  /**
   * Validate workflow flow and logic
   */
  private validateFlow(workflow: Workflow, errors: string[], warnings: string[], suggestions: string[]): void {
    // Check for trigger nodes
    const triggerNodes = workflow.nodes.filter(n => n.type === 'trigger');
    if (triggerNodes.length === 0) {
      errors.push('Workflow must have at least one trigger node');
    }
    
    if (triggerNodes.length > 3) {
      warnings.push('Workflow has many trigger nodes, consider simplifying');
    }
    
    // Check for output nodes
    const outputNodes = workflow.nodes.filter(n => n.type === 'output');
    if (outputNodes.length === 0) {
      suggestions.push('Consider adding output nodes to capture workflow results');
    }
    
    // Check for unreachable nodes
    const reachableNodes = this.findReachableNodes(workflow);
    const unreachableNodes = workflow.nodes.filter(n => !reachableNodes.has(n.id));
    
    unreachableNodes.forEach(node => {
      warnings.push(`Node "${node.data.label || node.id}" is unreachable`);
    });
    
    // Check for cycles
    if (this.hasCycles(workflow)) {
      errors.push('Workflow contains cycles');
    }
  }

  /**
   * Validate best practices and performance considerations
   */
  private validateBestPractices(workflow: Workflow, warnings: string[], suggestions: string[]): void {
    // Check workflow complexity
    if (workflow.nodes.length > 20) {
      suggestions.push('Large workflow detected, consider breaking into smaller workflows');
    }
    
    // Check for expensive operations in sequence
    const expensiveNodes = workflow.nodes.filter(n => 
      ['llm', 'web-search', 'rag'].includes(n.type)
    );
    
    if (expensiveNodes.length > 5) {
      warnings.push('Many expensive operations detected, may impact performance');
    }
    
    // Check for proper error handling
    const conditionalNodes = workflow.nodes.filter(n => n.type === 'conditional');
    if (expensiveNodes.length > 0 && conditionalNodes.length === 0) {
      suggestions.push('Consider adding conditional nodes for error handling');
    }
    
    // Check naming conventions
    const unnamedNodes = workflow.nodes.filter(n => !n.data.label || n.data.label.trim() === '');
    if (unnamedNodes.length > 0) {
      suggestions.push('Add descriptive labels to all nodes for better maintainability');
    }
  }

  /**
   * Find all nodes reachable from trigger nodes
   */
  private findReachableNodes(workflow: Workflow): Set<string> {
    const reachable = new Set<string>();
    const triggerNodes = workflow.nodes.filter(n => n.type === 'trigger');
    
    const dfs = (nodeId: string) => {
      if (reachable.has(nodeId)) return;
      reachable.add(nodeId);
      
      const outgoingEdges = workflow.edges.filter(e => e.source === nodeId);
      outgoingEdges.forEach(edge => dfs(edge.target));
    };
    
    triggerNodes.forEach(trigger => dfs(trigger.id));
    
    return reachable;
  }

  /**
   * Check if workflow contains cycles
   */
  private hasCycles(workflow: Workflow): boolean {
    const visited = new Set<string>();
    const recursionStack = new Set<string>();
    
    const dfs = (nodeId: string): boolean => {
      visited.add(nodeId);
      recursionStack.add(nodeId);
      
      const outgoingEdges = workflow.edges.filter(e => e.source === nodeId);
      
      for (const edge of outgoingEdges) {
        if (!visited.has(edge.target)) {
          if (dfs(edge.target)) return true;
        } else if (recursionStack.has(edge.target)) {
          return true;
        }
      }
      
      recursionStack.delete(nodeId);
      return false;
    };
    
    for (const node of workflow.nodes) {
      if (!visited.has(node.id)) {
        if (dfs(node.id)) return true;
      }
    }
    
    return false;
  }
}

export const workflowValidationService = new WorkflowValidationService();