// lib/file-processor.ts
export interface FileProcessingResult {
  success: boolean;
  text?: string;
  error?: string;
  fileName: string;
  fileSize: number;
  fileType: string;
}

export class FileProcessor {
  private static supportedTypes = ['.pdf', '.docx', '.txt'];
  private static maxSize = 10 * 1024 * 1024; // 10MB

  static async processFile(file: File): Promise<FileProcessingResult> {
    const result: FileProcessingResult = {
      success: false,
      fileName: file.name,
      fileSize: file.size,
      fileType: this.getFileType(file.name),
    };

    try {
      // Validate file size
      if (file.size > this.maxSize) {
        result.error = 'File size exceeds 10MB limit';
        return result;
      }

      // Validate file type
      const fileType = this.getFileType(file.name);
      if (!this.supportedTypes.includes(fileType)) {
        result.error = 'Unsupported file type. Please use PDF, DOCX, or TXT files.';
        return result;
      }

      // Process based on file type
      switch (fileType) {
        case '.pdf':
          result.text = await this.processPDF(file);
          break;
        case '.docx':
          result.text = await this.processDOCX(file);
          break;
        case '.txt':
          result.text = await this.processTXT(file);
          break;
        default:
          throw new Error('Unsupported file type');
      }

      if (result.text && result.text.trim()) {
        result.success = true;
      } else {
        result.error = 'No text content could be extracted from the file';
      }

    } catch (error) {
      result.error = error instanceof Error ? error.message : 'Unknown error occurred';
    }

    return result;
  }

  private static getFileType(fileName: string): string {
    return '.' + fileName.split('.').pop()?.toLowerCase() || '';
  }

  private static async processTXT(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (event) => {
        const text = event.target?.result as string;
        resolve(text);
      };
      
      reader.onerror = () => {
        reject(new Error('Failed to read text file'));
      };
      
      reader.readAsText(file);
    });
  }

  private static async processPDF(file: File): Promise<string> {
    // Note: For PDF processing in the browser, you would typically use pdf-lib or PDF.js
    // This is a placeholder implementation
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = async (event) => {
        try {
          // In a real implementation, you would use PDF.js or similar library
          // For now, we'll simulate PDF processing
          const arrayBuffer = event.target?.result as ArrayBuffer;
          
          if (typeof window !== 'undefined' && (window as any).pdfjsLib) {
            // If PDF.js is loaded, use it
            const pdf = await (window as any).pdfjsLib.getDocument({ data: arrayBuffer }).promise;
            let fullText = '';
            
            for (let i = 1; i <= pdf.numPages; i++) {
              const page = await pdf.getPage(i);
              const textContent = await page.getTextContent();
              const pageText = textContent.items.map((item: any) => item.str).join(' ');
              fullText += pageText + '\n';
            }
            
            resolve(fullText.trim());
          } else {
            // Fallback: return a message indicating PDF processing needs server-side implementation
            resolve('PDF processing requires server-side implementation. Please convert to TXT or DOCX format.');
          }
        } catch (error) {
          reject(new Error('Failed to process PDF file'));
        }
      };
      
      reader.onerror = () => {
        reject(new Error('Failed to read PDF file'));
      };
      
      reader.readAsArrayBuffer(file);
    });
  }

  private static async processDOCX(file: File): Promise<string> {
    // Note: For DOCX processing in the browser, you would typically use mammoth.js
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = async (event) => {
        try {
          const arrayBuffer = event.target?.result as ArrayBuffer;
          
          if (typeof window !== 'undefined' && (window as any).mammoth) {
            // If mammoth is loaded, use it
            const result = await (window as any).mammoth.extractRawText({ arrayBuffer });
            resolve(result.value);
          } else {
            // Fallback implementation
            resolve('DOCX processing requires mammoth.js library. Please convert to TXT format or implement server-side processing.');
          }
        } catch (error) {
          reject(new Error('Failed to process DOCX file'));
        }
      };
      
      reader.onerror = () => {
        reject(new Error('Failed to read DOCX file'));
      };
      
      reader.readAsArrayBuffer(file);
    });
  }

  static validateFile(file: File): { valid: boolean; error?: string } {
    if (file.size > this.maxSize) {
      return {
        valid: false,
        error: `File size (${(file.size / 1024 / 1024).toFixed(2)}MB) exceeds the 10MB limit`
      };
    }

    const fileType = this.getFileType(file.name);
    if (!this.supportedTypes.includes(fileType)) {
      return {
        valid: false,
        error: `File type ${fileType} is not supported. Please use ${this.supportedTypes.join(', ')} files.`
      };
    }

    return { valid: true };
  }

  static getSupportedTypes(): string[] {
    return [...this.supportedTypes];
  }

  static getMaxSize(): number {
    return this.maxSize;
  }
}