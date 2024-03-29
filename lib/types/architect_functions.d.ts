// TODO: switch to @types/architect__functions when it's not just a bunch of anys anymore
declare module '@architect/functions' {
  import type { DocumentClient } from 'aws-sdk/clients/dynamodb';
  import type {
    APIGatewayEvent as OrigAPIGatewayEvent,
    APIGatewayProxyResult,
  } from 'aws-lambda';

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
    delete(
      key: DocumentClient.DeleteItemInput['Key']
    ): Promise<DocumentClient.DeleteItemOutput>;
  }

  export interface Data {
    _doc: DocumentClient;
    _name(name: string): string;
    [table: string]: ArcTableClient;
  }

  type Obj = Record<string, string>;
  type AGWResult = Omit<APIGatewayProxyResult, 'body'>;

  export interface APIGatewayResult extends AGWResult {
    body?: string;
  }

  export interface Session {
    write: (data: Obj) => Promise<string>;
    read: <T = Obj>(req: OrigAPIGatewayEvent) => Promise<T>;
  }

  interface Locals {
    locals?: Record<string, string>;
  }

  export interface AsyncHandlerEvent extends OrigAPIGatewayEvent {
    session: Record<string, string>;
  }

  export type SubsequentAsyncHandlerEvent = AsyncHandlerEvent & Locals;

  export type AsyncHandlerResult = Promise<
    (AsyncHandlerEvent & Locals) | APIGatewayResult | void
  >;

  type FirstAsyncHandler = (event: AsyncHandlerEvent) => AsyncHandlerResult;
  type SubsequentAsyncHandler = (
    event: SubsequentAsyncHandlerEvent
  ) => AsyncHandlerResult;
  type Async = (
    handler: FirstAsyncHandler,
    ...handlers: SubsequentAsyncHandler[]
  ) => Promise<APIGatewayResult>;

  export interface ArcQueues {
    publish(event: {
      name: string;
      payload: Record<string, string | number | boolean>;
    }): Promise<void>;
  }

  interface Http {
    session: Session;
    async: Async;
    helpers: {
      url(pathname: string): string;
      bodyParser<T = Record<string, unknown>>(req: OrigAPIGatewayEvent): T;
    };
  }

  export const http: Http;
  export const queues: ArcQueues;
  export const tables: () => Promise<Data>;
  export const static: (filename: string) => string;
}
