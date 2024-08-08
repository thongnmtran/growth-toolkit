/* eslint-disable @typescript-eslint/no-explicit-any */
import { CustomEventEmitter, Typed } from '@growth-toolkit/common-utils';
import {
  BoardNode,
  Connector,
  Frame,
  Json,
  Rect,
  Shape,
  ShapeType,
} from '@mirohq/websdk-types';
import { findHoveringItem, fromItemToCanvas } from './board-utils';

export type MiroNode = {
  id: string;
  node: Shape;
  children: MiroNode[];
  // parent?: MiroNode | null;
};

export type MyMiroReadyEvent = Typed<'ready'>;

export type ViewportChangeEvent = Typed<'viewport-change'> & {
  viewport: Rect;
};

export type NodeEnterEvent = Typed<'node-enter'> & {
  event: MouseEvent;
  node: Shape;
  rect: Rect;
};

export type NodeLeaveEvent = Typed<'node-leave'> & {
  event: MouseEvent;
  node: Shape;
};

export type MyMiroEvent =
  | MyMiroReadyEvent
  | NodeEnterEvent
  | NodeLeaveEvent
  | ViewportChangeEvent;

export class MiroBase extends CustomEventEmitter<MyMiroEvent> {
  canvas!: HTMLCanvasElement;
  nodes: BoardNode[] = [];
  dataRootKey = 'data-root';
  collectionName = 'growth-toolkit';

  constructor() {
    super();
    this.handleMouseMove = this.handleMouseMove.bind(this) as never;
    this.handleMouseLeave = this.handleMouseLeave.bind(this) as never;
    this.loadViewport = this.loadViewport.bind(this) as never;

    this.init().then(() => {
      this.notifyReady();
    });
  }

  eval(script: string) {
    Object.assign(window, { myMiro: this });
    window.eval(`
      miro = window.miro;
      myMiro = window.myMiro;
      board = miro.board;
      (async () => {
        ${script}
      })()
    `);
  }

  isReady() {
    const canvas = this.findCanvas();
    return !!canvas && !!window.miro && !!window.miro.board;
  }

  findCanvas() {
    return document.querySelector(
      '#pixiCanvasContainer canvas',
    ) as HTMLCanvasElement | null;
  }

  async waitUntilReady() {
    return new Promise<void>((resolve) => {
      if (this.isReady()) {
        resolve();
      } else {
        const observer = new MutationObserver(() => {
          if (this.isReady()) {
            resolve();
            observer.disconnect();
          }
        });

        observer.observe(document.body, {
          attributes: true,
          childList: true,
          subtree: true,
          characterData: true,
        });
      }
    });
  }

  async init() {
    await this.waitUntilReady();
    await this.loadDataRoot();

    this.canvas = this.findCanvas()!;
    this.canvas.addEventListener('mousemove', this.handleMouseMove);
    this.canvas.addEventListener('mouseenter', this.handleMouseMove);
    this.canvas.addEventListener('mouseleave', this.handleMouseLeave);
    // this.canvas.addEventListener('mouseup', this.loadViewport);
    window.addEventListener('viewportchange', this.loadViewport);

    miro.board.ui.on('experimental:items:update', async () => {
      await this.loadBoardNodes();
      // console.log('> Experimental update', event);
      // const shouldSync = event.items.some((item) => item.type === 'shape');
      // if (shouldSync) {
      //   await this.adjustStyles(true);
      //   await this.loadConfig();
      //   this.notifyReady();
      // }
    });

    await this.loadBoardNodes();
    await this.loadViewport();

    const store = this.getStore();
    store.onValue(this.dataRootKey, async (value, version) => {
      if (!this.dataVersion || +version > this.dataVersion) {
        this.dataVersion = +version;
        this.dataRoot = (value as never) || {};
      }
    });

    (window as any).myMiro = this;
  }

  notifyReady() {
    this.emitEvent({
      type: 'ready',
    });
  }

  // --- Storage

  dataRoot: Record<string, any> = {};
  dataVersion = 0;

  getStore() {
    return miro.board.storage.collection(this.collectionName);
  }

  async loadJson<Type extends Json = any>(key: string) {
    const dataRoot = await this.loadDataRoot();
    return dataRoot[key] as Type;
  }

  async saveJson<Type extends Json>(key: string, value: Type) {
    const dataRoot = await this.loadDataRoot();
    dataRoot[key] = JSON.parse(JSON.stringify(value));
    await this.saveDataRoot();
  }

  protected async loadDataRoot() {
    const store = this.getStore();
    const dataRoot =
      (await store.get<Record<string, any>>(this.dataRootKey)) || {};
    console.log('> Load data:', dataRoot);
    this.dataRoot = dataRoot;
    return dataRoot;
  }

  protected async saveDataRoot() {
    this.dataVersion++;
    console.log('> Save data:', this.dataRoot);
    const store = this.getStore();
    await store.set(this.dataRootKey, this.dataRoot);
  }

  async clearDataRoot() {
    const store = this.getStore();
    await store.remove(this.dataRootKey);
  }

  async backup() {
    const store = this.getStore();
    const data = this.dataRoot;
    if (data) {
      await store.set('backup', data);
    }
  }

  // Board nodes

  async loadBoardNodes() {
    this.nodes = await miro.board.get();
  }

  async getSelectedNode() {
    return (await miro.board.getSelection())[0];
  }

  getShapes(shape?: ShapeType) {
    let shapes = this.getNodes<Shape>('shape');
    if (shape) {
      shapes = shapes.filter((s) => s.shape === shape);
    }
    return shapes;
  }

  getFrames() {
    return this.getNodes<Frame>('frame');
  }

  findFrame(frameId: string) {
    return this.getFrames().find((f) => f.id === frameId) as Frame;
  }

  getNodes<Type extends BoardNode>(type?: BoardNode['type']) {
    const nodes = this.nodes.filter((n) => n.type === type) as Type[];
    return nodes;
  }

  findRoot() {
    return this.getShapes().find((shape) => shape.content.includes('#root'));
  }

  findRoots() {
    return this.getShapes().filter((shape) => shape.content.includes('#root'));
  }

  findByText(text: string) {
    return this.getShapes().find((shape) => shape.content.includes(text));
  }

  getConnectors(shape: Shape) {
    return (shape.connectorIds || []).map(
      (id) => this.getById(id) as Connector,
    );
  }

  getParentConnector(shape: Shape) {
    const connectors = this.getConnectors(shape);
    const parentConnector = connectors.find((connector) => {
      const end = connector.end?.item;
      if (!end) {
        return null;
      }
      return end === shape.id;
    });
    return parentConnector;
  }

  getById(id: string) {
    return this.nodes.find((n) => n.id === id);
  }

  async getModuleNodes(): Promise<MiroNode['node'][]> {
    const root = await this.fastGetTree();
    if (!root) {
      return [];
    }
    const flat: any = ({ node, children = [] }: any) => [
      node,
      ...children.flatMap(flat),
    ];
    const nodes = root.children.flatMap(flat);
    return nodes as never;
  }

  cachedTree?: MiroNode;

  async fastGetTree() {
    if (this.cachedTree) {
      return this.cachedTree;
    }
    const root = await this.getTree();
    if (!root) {
      return;
    }
    this.cachedTree = root;
    return root;
  }

  async getTrees() {
    await this.loadBoardNodes();
    const roots = this.findRoots();
    if (!roots) {
      return;
    }

    return Promise.all(
      roots.map((rootI) => {
        const rootNode: MiroNode = {
          id: rootI.id,
          node: rootI,
          children: [],
        };
        this.buildTree(rootNode);
        this.cachedTree = rootNode;
        return rootNode;
      }),
    );
  }

  async getTree() {
    await this.loadBoardNodes();
    const root = this.findRoot();
    if (!root) {
      return;
    }

    const rootNode: MiroNode = {
      id: root.id,
      node: root,
      children: [],
    };

    this.buildTree(rootNode);

    this.cachedTree = rootNode;
    return rootNode;
  }

  treeToLevels(root: MiroNode): MiroNode[][] {
    const levels: MiroNode[][] = [];
    let currentLevel = [root];
    while (currentLevel.length > 0) {
      currentLevel.sort((a, b) => a.node.y - b.node.y);
      levels.push(currentLevel);
      currentLevel = currentLevel.flatMap((node) => node.children);
    }
    return levels;
  }

  buildTree(rootNode: MiroNode) {
    const children = this.getChildren(rootNode.node);
    if (children.length === 0) {
      return;
    }

    children.forEach((child) => {
      const node: MiroNode = {
        id: child.id,
        node: child,
        children: [],
        // parent: rootNode,
      };
      rootNode.children.push(node);
      this.buildTree(node);
    });
  }

  getAllChildren(root: Shape) {
    const children: Shape[] = this.nodes.filter((node) => {
      return node.type === 'shape' && node.parentId === root.id;
    }) as never;
    return children.sort((a, b) => a.y - b.y);
  }

  getChildren(root: Shape): Shape[] {
    const connectors = this.getConnectors(root);
    const children = connectors.map((connector) =>
      connector.end?.item ? this.getById(connector.end.item) : null,
    );
    const validChildren = children.filter(
      (child, index) =>
        !!child &&
        child.type === 'shape' &&
        child.id != root.id &&
        children.indexOf(child) === index,
    ) as Shape[];
    validChildren.sort((a, b) => a.y - b.y);
    return validChildren as never;
  }

  getSelection() {
    return miro.board.getSelection();
  }

  // --- Hovering & Viewport

  private hoveringNode?: Shape;

  private handleMouseLeave() {
    this.emitEvent({
      type: 'node-leave',
      event: new MouseEvent('mouseleave'),
      node: this.hoveringNode as never,
    });
  }

  private viewport!: Rect;

  private async loadViewport() {
    this.viewport = await miro.board.viewport.get();
    // console.log('viewport', this.viewport);
    this.emitEvent({
      type: 'viewport-change',
      viewport: this.viewport,
    });
  }

  private async handleMouseMove(event: MouseEvent) {
    const { offsetX, offsetY } = event;

    const found = findHoveringItem({
      x: offsetX,
      y: offsetY,
      canvas: this.canvas,
      frames: this.getFrames(),
      nodes: this.nodes,
      viewport: this.viewport,
    });

    if (found) {
      if (found.node.id !== this.hoveringNode?.id) {
        this.hoveringNode = found.node;
        this.emitEvent({
          type: 'node-enter',
          event,
          node: found.node as never,
          rect: found.rect,
        });
      }
    } else {
      if (this.hoveringNode) {
        const node = this.hoveringNode;
        this.hoveringNode = undefined;
        this.emitEvent({
          type: 'node-leave',
          event,
          node: node as never,
        });
      }
    }
  }

  getNodeRectInCanvas(node: Shape) {
    return fromItemToCanvas({
      rect: node,
      frame: this.findFrame(node.parentId!),
      canvas: this.canvas,
      viewport: this.viewport,
    });
  }
}
