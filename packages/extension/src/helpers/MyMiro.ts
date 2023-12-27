/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  BoardNode,
  Connector,
  Frame,
  Item,
  Json,
  OneOrMany,
  Rect,
  Shape,
  ShapeType,
} from '@mirohq/websdk-types';
import {
  CustomEventEmitter,
  Typed,
  filterNull,
  set,
  toHex,
} from '@growth-toolkit/common-utils';
import { findHoveringItem, fromItemToCanvas } from './board-utils';
import { LEVEL_STYLES, MiroColor } from './common/board-styles';
import { Stylist } from './Stylist';
import {
  Competitor,
  ModuleInfo,
  generateDefaultModuleInfo,
} from '@/models/ModuleInfo';
import { getInnerText } from '@/utils/html-utils';

export type RawSegmentFilter = {
  id: string;
  name: string;
  attributes: {
    name: string;
    value: string;
  }[];
};

export type MyConfig = {
  segments: RawSegmentFilter[];
  competitors: Competitor[];
};

export type MiroNode = {
  id: string;
  node: Shape;
  children: MiroNode[];
  // parent?: MiroNode | null;
};

export type ModuleNode = {
  id: string;
  info: ModuleInfo;
  children: ModuleNode[];
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

export class MyMiro extends CustomEventEmitter<MyMiroEvent> {
  nodes: BoardNode[] = [];
  canvas!: HTMLCanvasElement;
  dataRootKey = 'data-root';
  collectionName = 'growth-toolkit';

  constructor() {
    super();
    this.handleMouseMove = this.handleMouseMove.bind(this) as never;
    this.handleMouseLeave = this.handleMouseLeave.bind(this) as never;
    this.loadViewport = this.loadViewport.bind(this) as never;

    this.init();
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

    this.canvas = this.findCanvas()!;
    this.canvas.addEventListener('mousemove', this.handleMouseMove);
    this.canvas.addEventListener('mouseenter', this.handleMouseMove);
    this.canvas.addEventListener('mouseleave', this.handleMouseLeave);
    // this.canvas.addEventListener('mouseup', this.loadViewport);
    window.addEventListener('viewportchange', this.loadViewport);

    miro.board.ui.on('items:create', async (event) => {
      const connectors: Connector[] = [];
      for (const item of event.items) {
        if (item.type === 'connector') {
          connectors.push(item);
        } else if (item.type === 'shape') {
          connectors.push(...(await item.getConnectors()));
        }
      }

      const validConnectors =
        connectors.length > 0 &&
        connectors.every((connector) => {
          const start = connector.start?.item;
          const end = connector.end?.item;
          return start && end && start !== end;
        });

      if (validConnectors) {
        await this.adjustStyles(true);
      }

      await this.loadConfig();
      this.notifyReady();
    });

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
    await this.loadConfig();

    const store = this.getStore();
    store.onValue(this.dataRootKey, async (value, version) => {
      if (!this.dataVersion || +version > this.dataVersion) {
        this.dataVersion = +version;
        this.dataRoot = value as never;
      }
    });

    (window as any).myMiro = this;

    this.notifyReady();
  }

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

  getNodeRectInCanvas(node: Shape) {
    return fromItemToCanvas({
      rect: node,
      frame: this.findFrame(node.parentId!),
      canvas: this.canvas,
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

  notifyReady() {
    this.emitEvent({
      type: 'ready',
    });
  }

  // --- Configurations

  config: MyConfig = {
    segments: [],
    competitors: [],
  };

  async loadConfig() {
    const attributesRoot = this.findByText('#Attributes');
    if (attributesRoot) {
      // const attributes = this.getChildren(attributesRoot);
      // console.log(attributes);
    }

    const segmentRoot = this.findByText('#Segments');
    if (segmentRoot) {
      const segmentNodes = this.getChildren(segmentRoot);
      const segments = segmentNodes
        .sort((a, b) => a.x - b.x)
        .map((alias) => {
          const name = getInnerText(alias.content);
          const attributeNodes = this.getChildren(alias);
          const attributes = attributeNodes.map((attribute) => {
            const rawAttribute = getInnerText(attribute.content);
            const [name = '', value = ''] = rawAttribute
              .split(':')
              .map((s) => s.trim());
            return {
              name,
              value,
            };
          });
          return {
            name,
            id: alias.id,
            attributes,
          };
        });
      this.config.segments = segments;
    }

    const competitorsFrame = this.getFrames().find(
      (frame) => frame.title === 'Competitors',
    );
    if (competitorsFrame) {
      const competitorShapes = this.getShapes(ShapeType.RoundRectangle).filter(
        (shape) => shape.parentId === competitorsFrame.id,
      );
      const competitors: Competitor[] = competitorShapes.map((shape) => ({
        links: filterNull([shape.linkedTo]),
        name: getInnerText(shape.content),
        type:
          shape.style.borderColor === MiroColor.PURPLE ? 'DIRECT' : 'INDIRECT',
        description: '',
      }));
      this.config.competitors = competitors;
    }

    console.log('> Config:', this.config);
  }

  // --- Storage

  dataRoot: Record<string, any> = {};

  dataVersion = 0;

  getStore() {
    return miro.board.storage.collection(this.collectionName);
  }

  private async loadDataRoot() {
    const store = this.getStore();
    const dataRoot =
      (await store.get<Record<string, any>>(this.dataRootKey)) || {};
    console.log('> Load data:', dataRoot);
    this.dataRoot = dataRoot;
    return dataRoot;
  }

  private async saveDataRoot() {
    this.dataVersion++;
    console.log('> Save data:', this.dataRoot);
    const store = this.getStore();
    await store.set(this.dataRootKey, this.dataRoot);
  }

  async clearDataRoot() {
    const store = this.getStore();
    await store.remove(this.dataRootKey);
  }

  async loadModuleInfo(node: Shape) {
    await this.loadDataRoot();
    return this.getModuleInfo(node);
  }

  getModuleInfo(node: Shape | string) {
    let moduleInfo: ModuleInfo | undefined;
    let nodeId = '';
    if (typeof node === 'string') {
      nodeId = node;
      moduleInfo = this.dataRoot[node] as ModuleInfo;
      if (!moduleInfo) {
        [nodeId, moduleInfo] = Object.entries(this.dataRoot).find(
          ([, value]) => value.id === node,
        );
      }
      if (!moduleInfo) {
        moduleInfo = generateDefaultModuleInfo();
      }
    } else {
      nodeId = node.id;
      moduleInfo = this.dataRoot[node.id] as ModuleInfo;
      if (!moduleInfo) {
        moduleInfo = generateDefaultModuleInfo();
      }
      moduleInfo.name = getInnerText(node.content);
    }
    if (nodeId) {
      this.dataRoot[nodeId] = moduleInfo;
    }
    return moduleInfo;
  }

  async saveModuleInfo(node: Shape, info: ModuleInfo) {
    return this.saveJson(node.id, info);
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

  async migrateModuleInfo() {
    //
  }

  async backup() {
    const store = this.getStore();
    const data = this.dataRoot;
    if (data) {
      await store.set('backup', data);
    }
  }

  // --- Board

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

  async putModuleInfo(
    node: Shape,
    keyPath: keyof ModuleInfo | string[],
    value: any,
  ) {
    const moduleInfo = this.getModuleInfo(node);
    set(moduleInfo, keyPath, value);
    await this.saveModuleInfo(node, moduleInfo);
  }

  async adjustStyles(sync = false) {
    const tree = await this.getTree();
    if (!tree) {
      return;
    }
    const levels = this.treeToLevels(tree);

    await this.loadDataRoot();

    const changedItems = new Stylist().applyStyles({
      sync,
      levels,
      styles: LEVEL_STYLES,
      parentConnectorProvider: this.getParentConnector.bind(this),
      moduleInfoProvider: this.getModuleInfo.bind(this),
    });

    if (sync) {
      this.indexModuleTree(tree);
      await this.saveDataRoot();
    }

    // TODO: Adjust positions
    // levels.map((level, index) => {
    //   level.map((miroNode) => {
    //   });
    // });

    for (const item of changedItems) {
      console.log('> Syncing node');
      await item.sync();
    }
  }

  indexModuleTree(tree: MiroNode) {
    const info = this.getModuleInfo(tree.node);
    const id = toHex(1);
    info.id = id;
    info.order = 1;
    const rootNode: ModuleNode = {
      id,
      info,
      children: [],
    };
    this.buildModuleTree(rootNode, tree);
    return rootNode;
  }

  buildModuleTree(root: ModuleNode, node: MiroNode) {
    node.children.forEach((child, index, arr) => {
      const info = this.getModuleInfo(child.node);
      info.order = index + 1;

      if (!info.id) {
        let tempIndex = index;
        do {
          const id = `${root.id}${toHex(tempIndex + 1)}`;
          const isValidId = arr.every(
            (nodeI) => this.getModuleInfo(nodeI.node).id !== id,
          );
          if (isValidId) {
            info.id = id;
          } else {
            tempIndex++;
          }
        } while (!info.id);
      }

      const childNode: ModuleNode = {
        id: info.id,
        info,
        children: [],
      };
      root.children.push(childNode);
      this.buildModuleTree(childNode, child);
    });
  }

  asExcel() {}

  async createShape() {
    const shape = await miro.board.createShape({
      content: '<p>This is a star shape.</p>',
      shape: 'rectangle',
      style: {
        color: '#ff0000', // Default text color: '#1a1a1a' (black)
        fillColor: '#ffff00', // Default shape fill color: transparent (no fill)
        fontFamily: 'arial', // Default font type for the text
        fontSize: 14, // Default font size for the text, in dp
        textAlign: 'center', // Default horizontal alignment for the text
        textAlignVertical: 'middle', // Default vertical alignment for the text
        borderStyle: 'normal', // Default border line style
        borderOpacity: 1.0, // Default border color opacity: no opacity
        borderColor: '#ff7400', // Default border color: '#ffffff` (white)
        borderWidth: 2, // Default border width
        fillOpacity: 1.0, // Default fill color opacity: no opacity
      },
      x: 0, // Default value: center of the board
      y: 0, // Default value: center of the board
      width: 24,
      height: 24,
    });
    await miro.board.viewport.zoomTo(shape);
  }

  async focus(item?: OneOrMany<Item>) {
    if (item) {
      await miro.board.viewport.zoomTo(item);
      return;
    }
    await miro.board.viewport.set({
      viewport: {
        x: 200, // top-left corner of the viewport, relative to the center of the board
        y: 100, // top-left corner of the viewport, relative to the center of the board
        width: 1280,
        height: 720,
      },
      padding: {
        top: 100,
        left: 200,
        bottom: 50,
        right: 20,
      },
      animationDurationInMs: 1000,
    });
  }
}

export const myMiro = new MyMiro();
