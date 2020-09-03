declare module '@architect/functions' {
  import type { DocumentClient } from 'aws-sdk/clients/dynamodb';

  export interface ArcTableClient {
    get(
      key: DocumentClient.GetItemInput['Key']
    ): Promise<DocumentClient.GetItemOutput['Item']>;
    query(
      params: Omit<DocumentClient.QueryInput, 'TableName'>
    ): Promise<DocumentClient.QueryOutput>;
    put(
      params: DocumentClient.PutItemInput['Item']
    ): Promise<DocumentClient.PutItemInput['Item']>;
    scan(
      param: Omit<DocumentClient.ScanInput, 'TableName'>
    ): Promise<DocumentClient.ScanOutput>;
    update(
      param: Omit<DocumentClient.UpdateItemInput, 'TableName'>
    ): Promise<DocumentClient.UpdateItemOutput>;
  }

  interface Data {
    [table: string]: ArcTableClient;
  }

  interface Session {
    write: (data: Record<string, string>) => Promise<string>;
    read: <R = Record<string, string>, T = Record<string, string>>(
      req: R
    ) => Promise<T>;
  }

  interface Http {
    session: Session;
    helpers: {
      static(filename: string): string;
      url(pathname: string): string;
      bodyParser<
        R = Record<string, unknown> & { body: string | null },
        T = Record<string, unknown>
      >(
        req: R
      ): T;
    };
  }

  interface Arc {
    http: Http;
    tables(): Promise<Data>;
  }

  const arc: Arc;

  export default arc;
}
