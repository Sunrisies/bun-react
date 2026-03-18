// src/workers/pdfPreviewWorker.ts
import * as pdfjsLib from "pdfjs-dist";

// 设置 Worker
// pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
//   "pdfjs-dist/build/pdf.worker.min.mjs",
//   import.meta.url,
// ).toString();
pdfjsLib.GlobalWorkerOptions.workerSrc = "";
interface PreviewPage {
  pageNumber: number;
  thumbnail: string;
}

//   ctx: CanvasRenderingContext2D;
//   canvas: HTMLCanvasElement;

self.onmessage = async (event: MessageEvent) => {
  const { pdfData, scale = 0.5 } = event.data;
  console.log("Worker收到消息，开始处理PDF预览", {
    pdfData,
    scale,
  });
  try {
    const pdf = await pdfjsLib.getDocument({ data: pdfData }).promise;
    const pageCount = pdf.numPages;

    const pages: PreviewPage[] = [];

    for (let i = 0; i < pageCount; i++) {
      try {
        const page = await pdf.getPage(i + 1);
        const viewport = page.getViewport({ scale });
        const canvas = new OffscreenCanvas(viewport.width, viewport.height);
        const ctx = canvas.getContext("2d");
        canvas.width = viewport.width;
        canvas.height = viewport.height;

        console.log(
          `页面 ${i + 1} 开始渲染，尺寸: ${canvas.width}x${canvas.height}`,
          page,
        );

        // 添加错误处理
        const renderTask = page.render({
          canvasContext: ctx,
          viewport,
        });

        // 等待渲染完成，并捕获可能的错误
        await renderTask.promise
          .then(() => {
            console.log(`页面 ${i + 1} 渲染完成`);
          })
          .catch((error) => {
            console.error(`页面 ${i + 1} 渲染失败:`, error);
            throw error;
          });

        console.log(`页面 ${i + 1} 准备生成缩略图`);

        // const thumbnail = canvas.transferToImageBitmap();
        // pages.push({
        //   pageNumber: i + 1,
        //   thumbnail: thumbnail as any,
        // });

        console.log(`页面 ${i + 1} 缩略图生成完成`);
      } catch (error) {
        console.error(`处理页面 ${i + 1} 时出错:`, error);
        // 可以选择跳过当前页面继续处理，或者中断整个流程
        continue;
      }
    }
    console.log("所有页面处理完成，发送结果回主线程");
    // self.postMessage({ pages, pageCount });
  } catch (error) {
    console.error("生成预览失败:", error);
    // self.postMessage({ error: (error as Error).message });
  }
};
