import { Injectable } from '@nestjs/common';
import { join } from 'path';
import { mkdir } from 'fs/promises';

type UploadedFile = Express.Multer.File;

@Injectable()
export class FileService {
  private readonly uploadDir = join(process.cwd(), 'uploads');

  constructor() {
    void this.ensureUploadDir();
  }

  /**
   * Возвращает публичный URL для сохранённого файла.
   * При отсутствии переменной окружения FILE_BASE_URL берём локальный адрес.
   */
  getFileUrl(fileName: string): string {
    const base =
      process.env.FILE_BASE_URL?.replace(/\/$/, '') ?? 'http://localhost:5000';
    return `${base}/uploads/${fileName}`;
  }

  /**
   * Сохраняет файл, возвращает метаданные и публичный URL.
   */
  handleUpload(file: UploadedFile) {
    if (!file) {
      throw new Error('Файл не найден в запросе');
    }

    return {
      fileName: file.filename,
      originalName: file.originalname,
      mimeType: file.mimetype,
      size: file.size,
      url: this.getFileUrl(file.filename),
    };
  }

  private async ensureUploadDir(): Promise<void> {
    await mkdir(this.uploadDir, { recursive: true });
  }
}
