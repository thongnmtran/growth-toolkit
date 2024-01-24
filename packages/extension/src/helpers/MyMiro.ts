/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  Connector,
  Item,
  OneOrMany,
  Shape,
  ShapeType,
} from '@mirohq/websdk-types';
import { filterNull, set, toHex } from '@growth-toolkit/common-utils';
import { LEVEL_STYLES, MiroColor } from './common/board-styles';
import { Stylist } from './Stylist';
import {
  Competitor,
  ModuleInfo,
  generateDefaultModuleInfo,
} from '@/models/ModuleInfo';
import { getInnerText } from '@/utils/html-utils';
import { MiroBase, MiroNode } from './MiroBase';

export type ModuleNode = {
  id: string;
  info: ModuleInfo;
  children: ModuleNode[];
};

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

export class MyMiro extends MiroBase {
  constructor() {
    super();
  }

  override async init() {
    await super.init();

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

    miro.board.ui.on('experimental:items:update', async (event) => {
      // console.log('> Experimental update', event);
      // const shouldSync = event.items.some((item) => item.type === 'shape');
      // if (shouldSync) {
      //   await this.adjustStyles(true);
      //   await this.loadConfig();
      //   this.notifyReady();
      // }
      const isRelated = event.items.some(
        (item) => item.type === 'shape' || item.type === 'connector',
      );
      if (isRelated) {
        await this.loadBoardNodes();
      }
    });

    await this.loadConfig();
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
        .sort((a, b) => a.y - b.y || a.x - b.x)
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
      const competitorShapes = this.getShapes(ShapeType.RoundRectangle)
        .filter((shape) => shape.parentId === competitorsFrame.id)
        .sort((a, b) => a.y - b.y || b.x - a.x);
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

  async loadModuleInfo(node: Shape) {
    await this.loadDataRoot();
    return this.getModuleInfo(node);
  }

  async getModuleInfos() {
    const nodes = await this.getModuleNodes();
    const infos = nodes.map((node) => this.getModuleInfo(node));
    return infos;
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
    } else if (node) {
      nodeId = node.id;
      moduleInfo = this.dataRoot[node.id] as ModuleInfo;
      if (!moduleInfo) {
        moduleInfo = generateDefaultModuleInfo();
      }
      moduleInfo.name = getInnerText(node.content);
    } else {
      moduleInfo = generateDefaultModuleInfo();
    }
    if (nodeId) {
      this.dataRoot[nodeId] = moduleInfo;
    }
    return moduleInfo;
  }

  async saveModuleInfo(node: Shape, info: ModuleInfo) {
    return this.saveJson(node.id, info);
  }

  async migrate() {
    const infos = await this.getModuleInfos();
    infos.forEach((info) => {
      if (!info.competitors) {
        info.competitors = [];
      }
    });
    await this.saveDataRoot();
  }

  async importData() {}

  // --- Board

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
