/* eslint-disable @typescript-eslint/no-explicit-any */
import { Connector, Shape, StrokeStyle } from '@mirohq/websdk-types';
import { LevelStyle, ModulePalette } from './common/board-styles';
import { MiroNode } from './MyMiro';
import { Mutable, set } from '@growth-toolkit/common-utils';
import { ModuleInfo, LicenseType } from '@/models/ModuleInfo';

export type InfoChangeRecord = {
  node: Shape;
  keyPath: keyof ModuleInfo | string[];
  value: any;
};

export class Stylist {
  constructor() {}

  getLineColor(licenseType?: LicenseType) {
    if (!licenseType) {
      return null;
    }
    return {
      [LicenseType.ANY]: ModulePalette.FREE,
      [LicenseType.NOT_SET]: null,
      [LicenseType.FREE]: ModulePalette.FREE,
      [LicenseType.PAID]: ModulePalette.PAID,
    }[licenseType];
  }

  getTextColor(licenseType?: LicenseType) {
    if (!licenseType) {
      return null;
    }
    return {
      [LicenseType.ANY]: ModulePalette.FREE,
      [LicenseType.NOT_SET]: null,
      [LicenseType.FREE]: ModulePalette.FREE,
      [LicenseType.PAID]: ModulePalette.PAID,
    }[licenseType];
  }

  applyStyles(params: {
    sync?: boolean;
    levels: MiroNode[][];
    styles: LevelStyle[];
    parentConnectorProvider: (node: Shape) => Connector | undefined;
    moduleInfoProvider: (node: Shape) => ModuleInfo;
  }) {
    const {
      levels,
      styles,
      parentConnectorProvider,
      moduleInfoProvider,
      sync,
    } = params;

    const changedItems: Set<Shape | Connector> = new Set();

    levels.map((level, index) => {
      level.map((miroNode) => {
        const style = styles[index];
        if (!style) {
          return;
        }
        const node = miroNode.node as Mutable<Shape>;

        const width = style.size[0]!;
        const height = style.size[1] || width;
        const info = moduleInfoProvider(node);

        // Sync document links
        const linkTo = node.linkedTo;
        if (sync) {
          if (linkTo && !info.docs.includes(linkTo)) {
            if (!info.docs[0]) {
              info.docs[0] = linkTo;
            } else {
              info.docs.unshift(linkTo);
            }
          }
        }
        if (!linkTo && info.docs.length > 0) {
          node.linkedTo = info.docs[0];
          changedItems.add(node);
        }

        // Line Style
        if (sync) {
          const isUnsupportedShape = node.style.borderStyle === 'dotted';
          if (isUnsupportedShape && info.basicAttributes.supported !== false) {
            set(info, ['basicAttributes', 'supported'], false);
          }
        }
        const lineStyle: StrokeStyle =
          info.basicAttributes.supported === false ? 'dotted' : 'normal';

        // Line Color
        if (sync) {
          const isPaidShape = node.style.borderColor === ModulePalette.PAID;
          const isFreeShape = node.style.borderColor === ModulePalette.FREE;
          if (
            isPaidShape &&
            info.basicAttributes.licenseType !== LicenseType.PAID
          ) {
            set(info, ['basicAttributes', 'licenseType'], LicenseType.PAID);
          } else if (
            isFreeShape &&
            info.basicAttributes.licenseType !== LicenseType.FREE
          ) {
            set(info, ['basicAttributes', 'licenseType'], LicenseType.FREE);
          }
        }
        const lineColor = this.getLineColor(info.basicAttributes.licenseType);

        // Color
        if (sync) {
          const isDifColor = node.style.borderColor !== node.style.color;
          if (isDifColor) {
            const isPaidText = node.style.color === ModulePalette.PAID;
            const isFreeText = node.style.color === ModulePalette.FREE;
            if (
              isPaidText &&
              info.basicAttributes.betterToBe !== LicenseType.PAID
            ) {
              set(info, ['basicAttributes', 'betterToBe'], LicenseType.PAID);
            } else if (
              isFreeText &&
              info.basicAttributes.betterToBe !== LicenseType.FREE
            ) {
              set(info, ['basicAttributes', 'betterToBe'], LicenseType.FREE);
            }
          } else {
            set(info, ['basicAttributes', 'betterToBe'], LicenseType.NOT_SET);
          }
        }

        let textColor = this.getTextColor(info.basicAttributes.betterToBe);
        if (!textColor) {
          textColor = lineColor;
        }

        // Set styles
        if (
          node.style.borderWidth !== style.lineWidth ||
          node.style.fontSize !== style.fontSize ||
          node.style.borderStyle !== lineStyle ||
          node.style.borderColor !== lineColor ||
          node.style.color !== textColor ||
          node.width !== width ||
          node.height !== height
        ) {
          node.style.borderWidth = style.lineWidth;
          node.style.borderStyle = lineStyle;
          if (lineColor) {
            node.style.borderColor = lineColor;
          }
          if (textColor) {
            node.style.color = textColor;
          }
          node.style.fontSize = style.fontSize;
          const offsetX = (width - node.width) / 2;
          const offsetY = (height - node.height) / 2;
          node.x += offsetX;
          node.y += offsetY;
          node.width = width;
          node.height = height;
          changedItems.add(node);
        }

        const parentConnector = parentConnectorProvider(node);
        if (parentConnector) {
          if (
            parentConnector.style.strokeWidth !== style.lineWidth ||
            parentConnector.style.strokeStyle !== lineStyle ||
            parentConnector.style.strokeColor !== lineColor
          ) {
            parentConnector.style.strokeWidth = style.lineWidth;
            parentConnector.style.strokeStyle = lineStyle;
            if (lineColor) {
              parentConnector.style.strokeColor = lineColor;
            }
            changedItems.add(parentConnector);
          }
        }
      });
    });

    return [...changedItems];
  }
}
