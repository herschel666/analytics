import type { ArcTableClient } from '@architect/functions';

import { btoa, atob } from './util';

interface StartKey {
  ExclusiveStartKey: {
    PK: string;
    SK: string;
  };
}

export interface PageView {
  pageViews: number;
  date: string;
  pathname: string;
}

export interface PageViewsBySite {
  views: PageView[];
  cursor?: string;
}

const increaseByOneDay = (date: string): string => {
  const [dayString, month, year] = date.split('-').reverse();
  const [second, first = '0'] = String(Number(dayString) + 1)
    .split('')
    .reverse();
  const day = `${first}${second}`;
  return `${year}-${month}-${day}`;
};

const getExclusiveStartKey = (
  primaryKey: string,
  cursor?: string
): StartKey | void => {
  const [startKey] = [cursor].filter(Boolean).map((c) => {
    try {
      return {
        ExclusiveStartKey: {
          PK: primaryKey,
          SK: atob(c),
        },
      };
    } catch {
      return undefined;
    }
  });
  return startKey;
};

export const getTable = async (doc: ArcTableClient): Promise<string> => {
  const result = await doc.scan({});

  return JSON.stringify(result.Items, null, 2);
};

export const addSite = async (
  doc: ArcTableClient,
  hostname: string,
  owner: string
): Promise<void> => {
  try {
    await doc.put({
      PK: 'site',
      SK: `${owner}#${hostname}`,
      Site: hostname,
      Owner: owner,
    });
  } catch (err) {
    console.log(err);
  }
};

export const getSites = async (
  doc: ArcTableClient,
  owner: string
): Promise<string[]> => {
  const { Items: items = [] } = await doc.query({
    KeyConditionExpression: 'PK = :site AND begins_with(SK, :owner)',
    ExpressionAttributeValues: {
      ':site': 'site',
      ':owner': owner,
    },
  });
  return items.map(({ Site: site }) => site);
};

export const getPageViewsBySite = async (
  doc: ArcTableClient,
  hostname: string,
  owner: string,
  from: string,
  to: string,
  cursor?: string
): Promise<PageViewsBySite> => {
  const primaryKey = `${owner}#${hostname}`;
  const exclusiveStartKey = getExclusiveStartKey(primaryKey, cursor);
  const {
    Items: items = [],
    LastEvaluatedKey: lastEvaluatedKey,
  } = await doc.query({
    KeyConditionExpression: `PK = :PK AND SK BETWEEN :from AND :to`,
    ProjectionExpression: '#page_views, #date, #pathname',
    ExpressionAttributeValues: {
      ':PK': primaryKey,
      ':from': from,
      ':to': increaseByOneDay(to),
    },
    ExpressionAttributeNames: {
      '#page_views': 'PageViews',
      '#date': 'Date',
      '#pathname': 'Pathname',
    },
    ScanIndexForward: false,
    ...exclusiveStartKey,
  });
  const newCursor =
    typeof lastEvaluatedKey === 'object' && lastEvaluatedKey !== null
      ? btoa(lastEvaluatedKey.SK)
      : undefined;
  const views = items.map(({ PageViews, Date: date, Pathname: pathname }) => ({
    pageViews: Number(PageViews),
    date,
    pathname,
  }));

  return { views, cursor: newCursor };
};

export const getPageViewsBySiteAndDate = async (
  doc: ArcTableClient,
  hostname: string,
  owner: string,
  date: string
): Promise<PageView[]> => {
  const { Items: items = [] } = await doc.query({
    KeyConditionExpression: `PK = :PK AND begins_with(SK, :date)`,
    ProjectionExpression: '#page_views, #date, #pathname',
    ExpressionAttributeValues: {
      ':PK': `${owner}#${hostname}`,
      ':date': date,
    },
    ExpressionAttributeNames: {
      '#page_views': 'PageViews',
      '#date': 'Date',
      '#pathname': 'Pathname',
    },
    ScanIndexForward: false,
  });
  return items.map(({ PageViews, Date: date, Pathname: pathname }) => ({
    pageViews: Number(PageViews),
    date,
    pathname,
  }));
};

export const addPageView = async (
  doc: ArcTableClient,
  hostname: string,
  owner: string,
  resource: string,
  date: number = Date.now()
): Promise<void> => {
  const day = new Date(date).toISOString().split('T').shift();

  try {
    await doc.update({
      Key: {
        PK: `${owner}#${hostname}`,
        SK: `${day}#${resource}`,
      },
      UpdateExpression:
        'SET #page_views = if_not_exists(#page_views, :zero) + :incr, #date = :date, #pathname = :pathname',
      ExpressionAttributeValues: {
        ':zero': 0,
        ':incr': 1,
        ':date': day,
        ':pathname': resource,
      },
      ExpressionAttributeNames: {
        '#page_views': 'PageViews',
        '#date': 'Date',
        '#pathname': 'Pathname',
      },
      ReturnValues: 'NONE',
    });
  } catch (err) {
    console.log(err);
  }
};
