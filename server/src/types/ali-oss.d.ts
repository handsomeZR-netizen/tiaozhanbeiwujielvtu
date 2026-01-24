declare module 'ali-oss' {
  interface OSSOptions {
    region: string;
    accessKeyId: string;
    accessKeySecret: string;
    bucket: string;
  }

  interface PutObjectOptions {
    headers?: Record<string, string>;
  }

  interface PutObjectResult {
    url: string;
    name: string;
    res: any;
  }

  interface GetObjectResult {
    content: Buffer;
    res: any;
  }

  interface ListObjectResult {
    objects?: Array<{
      name: string;
      url: string;
      size: number;
    }>;
  }

  interface OSSConstructor {
    new (options: OSSOptions): OSSInstance;
  }

  interface OSSInstance {
    put(name: string, file: Buffer | string, options?: PutObjectOptions): Promise<PutObjectResult>;
    get(name: string): Promise<GetObjectResult>;
    delete(name: string): Promise<any>;
    list(query?: { prefix?: string; 'max-keys'?: number }): Promise<ListObjectResult>;
  }

  const OSS: OSSConstructor;
  export = OSS;
}
