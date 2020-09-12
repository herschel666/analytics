import type { ArcTableClient } from '@architect/functions';

import { btoa, atob, firstCharToLower } from './util';
import { encrypt } from './crypto';

interface StartKey {
  ExclusiveStartKey: {
    PK: string;
    SK: string;
  };
}

export interface SiteEntry {
  createdAt: string;
  site: string;
  owner: string;
  hash: string;
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

const resultToSiteEntry = (result: Record<string, string>): SiteEntry | never =>
  ['CreatedAt', 'Site', 'Owner', 'Hash'].reduce(
    (acc: Partial<SiteEntry>, key) => {
      if (typeof result[key] !== 'string' || result[key].length === 0) {
        throw new Error(`Missing key "${key}" in result.`);
      }
      acc[firstCharToLower(key)] = result[key];
      return acc;
    },
    {}
  ) as SiteEntry;

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
  site: string,
  owner: string
): Promise<void> => {
  const ownerSite = `${owner}#${site}`;
  const hash = encrypt(ownerSite);
  const createdAt = new Date().toISOString();

  try {
    await doc.put({
      PK: `SITE#${ownerSite}`,
      SK: `SITE#${ownerSite}`,
      GSI1PK: 'SITE',
      GSI1SK: `SITE#${ownerSite}`,
      CreatedAt: createdAt,
      Site: site,
      Owner: owner,
      Hash: hash,
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
    IndexName: 'GSI1PK-GSI1SK-index',
    KeyConditionExpression: 'GSI1PK = :GSI1PK AND begins_with(GSI1SK, :GSI1SK)',
    ExpressionAttributeValues: {
      ':GSI1PK': 'SITE',
      ':GSI1SK': `SITE#${owner}`,
    },
  });
  return items.map(({ Site: site }) => site);
};

export const getSite = async (
  doc: ArcTableClient,
  site: string,
  owner: string
): Promise<SiteEntry> => {
  const key = `SITE#${owner}#${site}`;

  try {
    const result = await doc.get({
      PK: key,
      SK: key,
    });
    return resultToSiteEntry(result);
  } catch (err) {
    console.log(err);
  }
};

export const getPageViewsBySite = async (
  doc: ArcTableClient,
  site: string,
  owner: string,
  from: string,
  to: string,
  cursor?: string
): Promise<PageViewsBySite> => {
  const ownerSite = `${owner}#${site}`;
  const primaryKey = `SITE#${ownerSite}`;
  const exclusiveStartKey = getExclusiveStartKey(primaryKey, cursor);
  const {
    Items: items = [],
    LastEvaluatedKey: lastEvaluatedKey,
  } = await doc.query({
    KeyConditionExpression: 'PK = :PK AND SK BETWEEN :from AND :to',
    ProjectionExpression: '#page_views, #date, #pathname',
    ExpressionAttributeValues: {
      ':PK': primaryKey,
      ':from': `PAGEVIEW#${ownerSite}#${from}`,
      ':to': `PAGEVIEW#${ownerSite}#${increaseByOneDay(to)}`,
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
  site: string,
  owner: string,
  date: string
): Promise<PageView[]> => {
  const ownerSite = `${owner}#${site}`;
  const { Items: items = [] } = await doc.query({
    KeyConditionExpression: `PK = :PK AND begins_with(SK, :SK)`,
    ProjectionExpression: '#page_views, #date, #pathname',
    ExpressionAttributeValues: {
      ':PK': `SITE#${ownerSite}`,
      ':SK': `PAGEVIEW#${ownerSite}#${date}`,
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
  site: string,
  owner: string,
  resource: string,
  referrer: string | undefined,
  date: number = Date.now()
): Promise<void> => {
  const ownerSite = `${owner}#${site}`;
  const day = new Date(date).toISOString().split('T').shift();

  // TODO: save referrer
  Boolean(referrer) && console.log('Referrer', referrer);

  try {
    await doc.update({
      Key: {
        PK: `SITE#${ownerSite}`,
        SK: `PAGEVIEW#${ownerSite}#${day}#${resource}`,
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
