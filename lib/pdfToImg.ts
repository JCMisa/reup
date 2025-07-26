// PDF.js type definitions
interface PdfJsLib {
  getDocument: (options: { data: ArrayBuffer }) => {
    promise: Promise<PdfDocument>;
  };
  GlobalWorkerOptions: { workerSrc: string };
}

interface PdfDocument {
  numPages: number;
  getPage: (pageNumber: number) => Promise<PdfPage>;
}

interface PdfPage {
  getViewport: (options: { scale: number }) => PdfViewport;
  render: (context: {
    canvasContext: CanvasRenderingContext2D;
    viewport: PdfViewport;
  }) => { promise: Promise<void> };
}

interface PdfViewport {
  width: number;
  height: number;
}

declare global {
  interface Window {
    pdfjsLib?: PdfJsLib;
  }
}

export interface ConvertPdfToImageOptions {
  page?: number; // Specific page to convert (1-based, default: 1)
  scale?: number; // Scale factor for the output image (default: 1.5)
  format?: "png" | "jpeg" | "webp"; // Output format (default: 'png')
  quality?: number; // Quality for JPEG/WebP (0-1, default: 0.95)
  width?: number; // Target width in pixels (optional)
  height?: number; // Target height in pixels (optional)
  backgroundColor?: string; // Background color for transparent areas (default: 'white')
}

export interface ConvertPdfToImageResult {
  success: boolean;
  imageData?: string; // Base64 encoded image data
  imageBlob?: Blob; // Image as Blob
  error?: string;
  pageCount?: number;
  convertedPage?: number;
  originalWidth?: number;
  originalHeight?: number;
  outputWidth?: number;
  outputHeight?: number;
}

/**
 * Loads PDF.js library dynamically
 */
async function loadPdfJs(): Promise<PdfJsLib> {
  try {
    // Try to use the built-in PDF.js from the browser
    if (typeof window !== "undefined" && window.pdfjsLib) {
      return window.pdfjsLib;
    }

    // Load PDF.js from CDN if not available
    const script = document.createElement("script");
    script.src =
      "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js";
    script.async = true;

    return new Promise<PdfJsLib>((resolve, reject) => {
      script.onload = () => {
        const pdfjsLib = window.pdfjsLib;
        if (pdfjsLib) {
          // Set worker source
          pdfjsLib.GlobalWorkerOptions.workerSrc =
            "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
          resolve(pdfjsLib);
        } else {
          reject(new Error("Failed to load PDF.js"));
        }
      };
      script.onerror = () => reject(new Error("Failed to load PDF.js"));
      document.head.appendChild(script);
    });
  } catch (error) {
    console.log(error);
    throw new Error("PDF.js is not available in this environment");
  }
}

/**
 * Converts a PDF file to an image using browser APIs
 * @param file - The PDF file to convert
 * @param options - Conversion options
 * @returns Promise with conversion result
 */
export async function convertPdfToImage(
  file: File,
  options: ConvertPdfToImageOptions = {}
): Promise<ConvertPdfToImageResult> {
  try {
    // Validate input file
    if (!file) {
      throw new Error("No file provided");
    }

    if (file.type !== "application/pdf") {
      throw new Error("File must be a PDF");
    }

    // Set default options
    const {
      page = 1,
      scale = 1.5,
      format = "png",
      quality = 0.95,
      width,
      height,
      backgroundColor = "white",
    } = options;

    // Validate options
    if (page < 1) {
      throw new Error("Page number must be 1 or greater");
    }

    if (scale <= 0 || scale > 5) {
      throw new Error("Scale must be between 0 and 5");
    }

    if (quality < 0 || quality > 1) {
      throw new Error("Quality must be between 0 and 1");
    }

    // Load PDF.js
    const pdfjsLib = await loadPdfJs();

    // Convert file to ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();

    // Load the PDF document
    const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
    const pdfDocument = await loadingTask.promise;

    // Validate page number
    const pageCount = pdfDocument.numPages;
    if (page > pageCount) {
      throw new Error(
        `Page ${page} does not exist. PDF has ${pageCount} pages.`
      );
    }

    // Get the specific page
    const pdfPage = await pdfDocument.getPage(page);

    // Get the original viewport
    const originalViewport = pdfPage.getViewport({ scale: 1 });

    // Calculate the viewport with the desired scale
    let viewport = pdfPage.getViewport({ scale });

    // If specific dimensions are provided, adjust the viewport
    if (width || height) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const aspectRatio = originalViewport.width / originalViewport.height;

      if (width && height) {
        // Both dimensions specified
        viewport = pdfPage.getViewport({
          scale: Math.min(
            width / originalViewport.width,
            height / originalViewport.height
          ),
        });
      } else if (width) {
        // Only width specified
        const newScale = width / originalViewport.width;
        viewport = pdfPage.getViewport({ scale: newScale });
      } else if (height) {
        // Only height specified
        const newScale = height / originalViewport.height;
        viewport = pdfPage.getViewport({ scale: newScale });
      }
    }

    // Create canvas
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");

    if (!context) {
      throw new Error("Failed to get canvas context");
    }

    // Set canvas dimensions
    canvas.width = viewport.width;
    canvas.height = viewport.height;

    // Fill background if specified
    if (backgroundColor && backgroundColor !== "transparent") {
      context.fillStyle = backgroundColor;
      context.fillRect(0, 0, canvas.width, canvas.height);
    }

    // Render the PDF page to canvas
    const renderContext = {
      canvasContext: context,
      viewport: viewport,
    };

    await pdfPage.render(renderContext).promise;

    // Convert canvas to blob
    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error("Failed to convert canvas to blob"));
          }
        },
        `image/${format}`,
        quality
      );
    });

    // Convert to base64
    const reader = new FileReader();
    const imageData = await new Promise<string>((resolve, reject) => {
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });

    return {
      success: true,
      imageData,
      imageBlob: blob,
      pageCount,
      convertedPage: page,
      originalWidth: originalViewport.width,
      originalHeight: originalViewport.height,
      outputWidth: viewport.width,
      outputHeight: viewport.height,
    };
  } catch (error) {
    console.error("PDF to image conversion error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

/**
 * Converts multiple pages of a PDF to images
 * @param file - The PDF file to convert
 * @param options - Conversion options
 * @returns Promise with array of conversion results
 */
export async function convertPdfToImages(
  file: File,
  options: ConvertPdfToImageOptions = {}
): Promise<ConvertPdfToImageResult[]> {
  try {
    // Validate input file
    if (!file) {
      throw new Error("No file provided");
    }

    if (file.type !== "application/pdf") {
      throw new Error("File must be a PDF");
    }

    // Load PDF.js
    const pdfjsLib = await loadPdfJs();

    // Convert file to ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();

    // Load the PDF document
    const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
    const pdfDocument = await loadingTask.promise;

    const pageCount = pdfDocument.numPages;
    const results: ConvertPdfToImageResult[] = [];

    // Convert each page
    for (let pageNum = 1; pageNum <= pageCount; pageNum++) {
      try {
        const result = await convertPdfToImage(file, {
          ...options,
          page: pageNum,
        });
        results.push(result);
      } catch (pageError) {
        results.push({
          success: false,
          error: `Failed to convert page ${pageNum}: ${
            pageError instanceof Error ? pageError.message : "Unknown error"
          }`,
          pageCount,
          convertedPage: pageNum,
        });
      }
    }

    return results;
  } catch (error) {
    console.error("PDF to images conversion error:", error);
    return [
      {
        success: false,
        error:
          error instanceof Error ? error.message : "Unknown error occurred",
      },
    ];
  }
}

/**
 * Utility function to get PDF page count
 * @param file - The PDF file
 * @returns Promise with page count
 */
export async function getPdfPageCount(file: File): Promise<number> {
  try {
    if (!file || file.type !== "application/pdf") {
      throw new Error("Invalid PDF file");
    }

    // Load PDF.js
    const pdfjsLib = await loadPdfJs();

    // Convert file to ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();

    // Load the PDF document
    const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
    const pdfDocument = await loadingTask.promise;

    return pdfDocument.numPages;
  } catch (error) {
    console.error("Error getting PDF page count:", error);
    throw error;
  }
}

/**
 * Utility function to get PDF page dimensions
 * @param file - The PDF file
 * @param page - Page number (1-based, default: 1)
 * @returns Promise with page dimensions
 */
export async function getPdfPageDimensions(
  file: File,
  page: number = 1
): Promise<{ width: number; height: number }> {
  try {
    if (!file || file.type !== "application/pdf") {
      throw new Error("Invalid PDF file");
    }

    // Load PDF.js
    const pdfjsLib = await loadPdfJs();

    // Convert file to ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();

    // Load the PDF document
    const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
    const pdfDocument = await loadingTask.promise;

    if (page < 1 || page > pdfDocument.numPages) {
      throw new Error(
        `Page ${page} does not exist. PDF has ${pdfDocument.numPages} pages.`
      );
    }

    // Get the page
    const pdfPage = await pdfDocument.getPage(page);
    const viewport = pdfPage.getViewport({ scale: 1 });

    return {
      width: viewport.width,
      height: viewport.height,
    };
  } catch (error) {
    console.error("Error getting PDF page dimensions:", error);
    throw error;
  }
}

// -----------------------------------------------------------------------------------

// /* eslint-disable @typescript-eslint/no-unused-vars */
// /* eslint-disable @typescript-eslint/no-explicit-any */

// export interface PdfConversionResult {
//     imageUrl: string;
//     file: File | null;
//     error?: string;
//   }

//   let pdfjsLib: any = null;
//   let isLoading = false;
//   let loadPromise: Promise<any> | null = null;

//   async function loadPdfJs(): Promise<any> {
//     if (pdfjsLib) return pdfjsLib;
//     if (loadPromise) return loadPromise;

//     isLoading = true;
//     // @ts-expect-error - pdfjs-dist/build/pdf.mjs is not a module
//     loadPromise = import("pdfjs-dist/build/pdf.mjs").then((lib) => {
//       // Set the worker source to use local file
//       lib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
//       pdfjsLib = lib;
//       isLoading = false;
//       return lib;
//     });

//     return loadPromise;
//   }

//   export async function convertPdfToImage(
//     file: File
//   ): Promise<PdfConversionResult> {
//     try {
//       const lib = await loadPdfJs();

//       const arrayBuffer = await file.arrayBuffer();
//       const pdf = await lib.getDocument({ data: arrayBuffer }).promise;
//       const page = await pdf.getPage(1);

//       const viewport = page.getViewport({ scale: 4 });
//       const canvas = document.createElement("canvas");
//       const context = canvas.getContext("2d");

//       canvas.width = viewport.width;
//       canvas.height = viewport.height;

//       if (context) {
//         context.imageSmoothingEnabled = true;
//         context.imageSmoothingQuality = "high";
//       }

//       await page.render({ canvasContext: context!, viewport }).promise;

//       return new Promise((resolve) => {
//         canvas.toBlob(
//           (blob) => {
//             if (blob) {
//               // Create a File from the blob with the same name as the pdf
//               const originalName = file.name.replace(/\.pdf$/i, "");
//               const imageFile = new File([blob], `${originalName}.png`, {
//                 type: "image/png",
//               });

//               resolve({
//                 imageUrl: URL.createObjectURL(blob),
//                 file: imageFile,
//               });
//             } else {
//               resolve({
//                 imageUrl: "",
//                 file: null,
//                 error: "Failed to create image blob",
//               });
//             }
//           },
//           "image/png",
//           1.0
//         ); // Set quality to maximum (1.0)
//       });
//     } catch (err) {
//       return {
//         imageUrl: "",
//         file: null,
//         error: `Failed to convert PDF: ${err}`,
//       };
//     }
//   }
