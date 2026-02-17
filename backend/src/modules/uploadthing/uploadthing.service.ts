import { Injectable } from '@nestjs/common';
import { UTApi } from 'uploadthing/server';

@Injectable()
export class UploadthingService {
  private utapi = new UTApi({
    token: process.env.UPLOADTHING_TOKEN,
  });

  private getKeyFromUrl(ufsUrl: string): string {
    return ufsUrl.split('/f/').pop()!;
  }

  async deleteFile(ufsUrl: string): Promise<void> {
    const fileKey = this.getKeyFromUrl(ufsUrl);
    await this.utapi.deleteFiles(fileKey);
  }

  async deleteFiles(ufsUrls: string[]): Promise<void> {
    const fileKeys = ufsUrls.map((url) => this.getKeyFromUrl(url));
    await this.utapi.deleteFiles(fileKeys);
  }
}
