type Obj = Record<string, string>;

export interface Request<P = Obj, Q = Obj, H = Obj> {
  resource: string;
  pathParameters: P;
  queryStringParameters: Q | null;
  headers: H;
  body: string | null;
}

export interface Response {
  statusCode: number;
  headers?: Record<string, string>;
  body?: string;
  isBase64Encoded?: boolean;
}
