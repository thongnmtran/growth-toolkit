/* eslint-disable @typescript-eslint/no-explicit-any */
import { AnyKey, ArrayLike, ObjectLike, TypeName } from '../types';
import { Funcs } from './Funcs';

export const RerunRequestedSymbol = Symbol('Rerun Requested');

export enum NodeType {
  array = 'array',
  object = 'object',
  null = 'null',
  string = 'string',
  number = 'number',
  bigint = 'bigint',
  boolean = 'boolean',
  symbol = 'symbol',
  function = 'function',
  undefined = 'undefined',
}
export const SimpleTypeMap: Record<TypeName, NodeType> = {
  object: NodeType.object, // => "array" | "object" | "null"
  string: NodeType.string,
  number: NodeType.number,
  bigint: NodeType.bigint,
  boolean: NodeType.boolean,
  symbol: NodeType.symbol,
  function: NodeType.function,
  undefined: NodeType.undefined,
};

export interface BaseNode<ValueType> {
  type: NodeType;
  value: ValueType;
  prop?: AnyKey;
  parent?: ParentNode;
  isModified?: boolean; // Whether use the output as the new value for this node
  newValue?: any; // The new value for this node
  rerunRequested?: boolean; // This node has been totaly modified  Traversal again
}
export interface ArrayNode extends BaseNode<ArrayLike> {
  type: NodeType.array;
}
export interface ObjectNode extends BaseNode<ObjectLike> {
  type: NodeType.object;
}
export interface NullNode extends BaseNode<null> {
  type: NodeType.null;
}
export interface StringNode extends BaseNode<string> {
  type: NodeType.string;
}
export interface NumberNode extends BaseNode<number> {
  type: NodeType.number;
}
export interface BigIntNode extends BaseNode<bigint> {
  type: NodeType.bigint;
}
export interface BooleanNode extends BaseNode<boolean> {
  type: NodeType.boolean;
}
export interface SymbolNode extends BaseNode<symbol> {
  type: NodeType.symbol;
}
export interface FunctionNode extends BaseNode<() => any> {
  type: NodeType.function;
}
export interface UndefinedNode extends BaseNode<undefined> {
  type: NodeType.undefined;
}

export type ParentNode = ObjectNode | ArrayNode | undefined;

export type Node =
  | ObjectNode
  | ArrayNode
  | NullNode
  | StringNode
  | NumberNode
  | BigIntNode
  | BooleanNode
  | SymbolNode
  | FunctionNode
  | UndefinedNode;

// --- Utils

export function removeNode(node: Node) {
  const parent = node.parent;
  if (!parent) {
    return;
  }
  if (parent.type === NodeType.array) {
    const index = parent.value.indexOf(node.value);
    if (index >= 0) {
      parent.value.splice(index, 1);
    }
  }
  if (parent.type === NodeType.object && node.prop) {
    delete parent.value[node.prop];
  }
}

export function hardModifyNode(node: Node, newValue: any) {
  modifyNode(node, newValue);
  requestRerun(node);
}

export function modifyNode(node: Node, newValue: any) {
  node.newValue = newValue;
  node.isModified = true;
}

export function requestRerun(node: Node) {
  node.rerunRequested = true;
  throw RerunRequestedSymbol;
}

const Utils = {
  removeNode,
  hardModifyNode,
  modifyNode,
  requestRerun,
};

// --- End Utils

/**
 * Whether traversal depper into this node or not
 */
export interface NodeVerifier {
  (node: Node): Promise<boolean> | boolean;
}

export interface NodeResolver {
  (node: Node, utils: typeof Utils): Promise<void> | void;
}

function detectType(value: unknown): NodeType {
  const valueType = typeof value;
  let nodeType = SimpleTypeMap[valueType];
  if (nodeType === NodeType.object) {
    if (Array.isArray(value)) {
      nodeType = NodeType.array;
    }
    if (!value) {
      nodeType = NodeType.null;
    }
  }
  return nodeType;
}

function updateNode(node: Partial<Node>): Node {
  if (node.isModified) {
    node.isModified = false;
    node.value = node.newValue;
    node.newValue = undefined;
    if (node.parent) {
      if (node.parent.type === NodeType.array) {
        node.parent.value[node.prop as number] = node.value;
      }
      if (node.parent.type === NodeType.object) {
        node.parent.value[node.prop as string] = node.value;
      }
    }
  }
  node.type = detectType(node.value);
  return node as Node;
}

function buildNode({
  value,
  parent,
  prop,
}: {
  value?: any;
  parent?: ParentNode;
  prop?: AnyKey;
}): Node {
  return updateNode({
    value,
    prop,
    parent,
  });
}

export type TraversalParams<ValueType> = {
  value?: ValueType;
  prop?: AnyKey;
  parent?: ParentNode;
  verifier?: NodeVerifier;
  resolver?: NodeResolver;
};

export async function traversal<ReturnType = undefined, ValueType = unknown>({
  value,
  prop,
  parent,
  verifier,
  resolver,
}: TraversalParams<ValueType>): Promise<
  ReturnType extends undefined ? ValueType : ReturnType
> {
  const node = buildNode({
    value,
    prop,
    parent,
  });
  await traversalNode({
    node,
    verifier,
    resolver,
  });
  updateNode(node);
  return node.value as never;
}

export type TraversalNodeParams = {
  node: Node;
  verifier?: NodeVerifier | undefined;
  resolver?: NodeResolver | undefined;
};

async function traversalNode(params: TraversalNodeParams): Promise<void> {
  const { node, verifier = Funcs.asyncTrueFunc, resolver } = params;

  if (!(await verifier?.(node))) {
    return;
  }

  try {
    if (node.type === NodeType.array) {
      for (const itemI of [...node.value]) {
        const index = node.value.indexOf(itemI);
        await traversal({
          value: itemI,
          prop: index,
          parent: node,
          verifier,
          resolver,
        });
      }
    } else if (node.type === NodeType.object) {
      for (const [prop, value] of Object.entries(node.value)) {
        await traversal({
          value: value,
          prop: prop,
          parent: node,
          verifier,
          resolver,
        });
      }
    }
  } catch (error) {
    updateNode(node); // Check if sub-nodes has modified this node
    await handleTraversalError(error, params);
  }

  updateNode(node); // Check if sub-nodes has modified this node
  try {
    await resolver?.(node, Utils);
  } catch (error) {
    await handleTraversalError(error, params);
  }
}

export function findRerunRequestedAccentor(node: Node): ParentNode | null {
  if (!node.parent) {
    return null;
  }
  const topMostParent = findRerunRequestedAccentor(node.parent);
  if (topMostParent) {
    return topMostParent;
  }
  if (node.parent.rerunRequested) {
    return node.parent;
  }
  return null;
}

async function handleTraversalError(error: any, params: TraversalNodeParams) {
  const topMostParent = findRerunRequestedAccentor(params.node);
  if (topMostParent) {
    requestRerun(topMostParent); // Throw
  }
  if (error === RerunRequestedSymbol) {
    params.node.rerunRequested = false;
    await traversalNode(params);
  }
}

export async function findNodes<NodeType = any>(
  value: any,
  nodeFinder: (nodeI: Node) => boolean
): Promise<NodeType[]> {
  const matches: NodeType[] = [];
  await traversal({
    value,
    resolver: (node) => {
      if (nodeFinder(node)) {
        matches.push(node.value as never);
      }
    },
  });
  return matches;
}
