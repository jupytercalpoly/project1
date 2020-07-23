import { h, VirtualDOM } from '@lumino/virtualdom';
import { Drag } from 'tde-dragdrop';
import { MimeData } from '@lumino/coreutils';

const SHADOW = '.lm-DataGrid-select-shadow';
function createRectange(height: number, width: number): HTMLElement {
  return VirtualDOM.realize(
    h.div({
      className: SHADOW,
      style: {
        width: width.toString() + 'px',
        height: height.toString() + 'px'
      }
    })
  );
}
export function renderSelection(
  r1: number,
  r2: number,
  c1: number,
  c2: number,
  x: number,
  y: number,
  boundingRegion: IBoundingRegion
): void {
  const height = r2 - r1;
  const width = c2 - c1;
  const mouseOffsetX = x - c1;
  const mouseOffsetY = y - r1;
  const target = createRectange(height, width);
  const drag = new BoundedDrag({
    mimeData: new MimeData(),
    dragImage: target,
    proposedAction: 'move',
    boundingRegion,
    mouseOffsetX,
    mouseOffsetY
  });
  drag.start(x, y).then(() => {
    return;
  });
}

export class BoundedDrag extends Drag {
  private _mouseOffsetX: number;
  private _mouseOffsetY: number;
  constructor(options: BoundedDrag.IOptions) {
    super(options);
    this._boundingRegion = options.boundingRegion;
    this._mouseOffsetX = options.mouseOffsetX;
    this._mouseOffsetY = options.mouseOffsetY;
  }

  moveDragImage(clientX: number, clientY: number): void {
    if (!this.dragImage) {
      return;
    }
    let sudoClientX = clientX - this._mouseOffsetX;
    let sudoClientY = clientY - this._mouseOffsetY;
    [sudoClientX, sudoClientY] = this.bound(sudoClientX, sudoClientY);
    const style = this.dragImage.style;
    style.top = `${sudoClientY}px`;
    style.left = `${sudoClientX}px`;
  }

  bound(x: number, y: number): Array<number> {
    // unpack the bounding region
    const {
      upperBound,
      lowerBound,
      leftBound,
      rightBound
    } = this._boundingRegion;
    x = Math.min(x, rightBound);
    x = Math.max(x, leftBound);
    y = Math.max(y, upperBound);
    y = Math.min(y, lowerBound);
    return [x, y];
  }
  private _boundingRegion: IBoundingRegion;
}

export interface IBoundingRegion {
  upperBound: number;
  lowerBound: number;
  leftBound: number;
  rightBound: number;
}
export namespace BoundedDrag {
  export interface IOptions extends Drag.IOptions {
    boundingRegion: IBoundingRegion;
    mouseOffsetX: number;
    mouseOffsetY: number;
  }
}
