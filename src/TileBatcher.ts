type DrawFn = (x: number, y: number, width: number, height: number) => void;

export class TileBatcher {
  private drawFn: DrawFn | undefined;
  private width = -1;
  private height = -1;
  private batchIndex = 0;
  private batchCompleteIndex: number | undefined;
  private readonly batchSize = 50;
  private animationFrame: number | undefined;

  private handleAnimationFrame = () => {
    const batchStart = Date.now();

    const { width, height, batchSize, drawFn } = this;
    const batchWidth = Math.ceil(this.width / batchSize);
    const batchHeight = Math.ceil(this.height / batchSize);
    const batchCount = batchWidth * batchHeight;

    let maxTime = 0;

    while (true) {
      const start = Date.now();
      const blockYIndex = (this.batchIndex / batchWidth) | 0;
      const blockXIndex = this.batchIndex - blockYIndex * batchWidth;

      const blockX = blockXIndex * batchSize;
      const blockY = blockYIndex * batchSize;

      const blockWidth = Math.min(blockX + batchSize, width) - blockX;
      const blockHeight = Math.min(blockY + batchSize, height) - blockY;

      drawFn!(blockX, blockY, blockWidth, blockHeight);

      this.batchIndex += 1;
      if (this.batchIndex >= batchCount) {
        this.batchIndex = 0;
      }

      if (this.batchIndex === this.batchCompleteIndex) {
        return;
      }

      const end = Date.now();
      const totalElapsedTime = end - batchStart;

      if (totalElapsedTime + 2 * maxTime > 1000 / 60) {
        this.animationFrame = requestAnimationFrame(this.handleAnimationFrame);
        return;
      }

      const time = end - start;
      maxTime = Math.max(time, maxTime);
    }
  };

  redraw(width: number, height: number, drawFn: DrawFn) {
    if (width !== this.width || height !== this.height) {
      this.width = width;
      this.height = height;
      this.batchIndex = 0;
      this.batchCompleteIndex = 0;
    } else {
      this.batchCompleteIndex = this.batchIndex;
    }

    this.drawFn = drawFn;

    cancelAnimationFrame(this.animationFrame!);
    this.animationFrame = requestAnimationFrame(this.handleAnimationFrame);
  }
}
