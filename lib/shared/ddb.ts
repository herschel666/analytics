import type { ArcTableClient, Data } from '@architect/functions';
import type { DocumentClient } from 'aws-sdk/clients/dynamodb';

import { btoa, atob, firstCharToLower } from './util';
import type { UserAgent } from './util';
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

export interface SiteRelatedEntry {
  entries: { PK: string; SK: string }[];
  cursor?: string;
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

export interface ReferrerHostEntry {
  count: number;
  hostname: string;
  month: string;
}

export interface ReferrerEntry {
  count: number;
  pathname: string;
  month: string;
}

export interface TableItem extends DocumentClient.AttributeMap {
  PK: string;
  SK: string;
}

export interface UABrowser {
  name: string;
  version: string;
  count: number;
}

export interface UAOs {
  name: string;
  version: string;
  count: number;
}

export interface UADevice {
  name: string;
  count: number;
}

export interface UserAgentEntries {
  browsers: UABrowser[];
  os: UAOs[];
  devices: UADevice[];
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const isTableItem = (item: any): item is TableItem =>
  typeof item === 'object' &&
  item !== null &&
  typeof item.PK === 'string' &&
  typeof item.SK === 'string';

const resultToEntry = <
  T extends Record<string extends keyof T ? string : never, string | number>
>(
  keys: string[],
  result: Record<string, string | number>
): T | never =>
  keys.reduce((acc: Partial<T>, key) => {
    if (typeof result[key] === 'undefined') {
      throw new Error(`Missing key "${key}" in result.`);
    }
    acc[firstCharToLower(key)] = result[key];
    return acc;
  }, {}) as T;

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

export const getTable = async (doc: ArcTableClient): Promise<TableItem[]> => {
  const result = await doc.scan({});

  return result.Items.filter((item) => isTableItem(item)) as TableItem[];
};

export const addSite = async (
  doc: ArcTableClient,
  site: string,
  owner: string
): Promise<void> => {
  const ownerSite = `${owner}#${site}`;
  const hash = encrypt(ownerSite);
  const createdAt = new Date().toISOString();

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
): Promise<SiteEntry | undefined> => {
  const key = `SITE#${owner}#${site}`;

  try {
    const result = await doc.get({
      PK: key,
      SK: key,
    });
    return (
      result &&
      resultToEntry<SiteEntry>(['CreatedAt', 'Site', 'Owner', 'Hash'], result)
    );
  } catch (err) {
    console.log(err);
  }
};

export const getAllSiteRelatedEntries = async (
  doc: ArcTableClient,
  owner: string,
  site: string,
  cursor?: string
): Promise<SiteRelatedEntry> => {
  const primaryKey = `SITE#${owner}#${site}`;
  const exclusiveStartKey = getExclusiveStartKey(primaryKey, cursor);
  const {
    Items: items = [],
    LastEvaluatedKey: lastEvaluatedKey,
  } = await doc.query({
    KeyConditionExpression: 'PK = :PK',
    ProjectionExpression: 'PK, SK',
    ExpressionAttributeValues: {
      ':PK': primaryKey,
    },
    ...exclusiveStartKey,
  });
  const newCursor =
    typeof lastEvaluatedKey === 'object' && lastEvaluatedKey !== null
      ? btoa(lastEvaluatedKey.SK)
      : undefined;
  const entries = items.map(({ PK, SK }) => ({ PK, SK }));

  return { entries, cursor: newCursor };
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

export const getReferrersBySite = async (
  doc: ArcTableClient,
  site: string,
  owner: string,
  date: string
): Promise<ReferrerHostEntry[]> => {
  const ownerSite = `${owner}#${site}`;
  const [yyyy, mm, , month = `${yyyy}-${mm}`] = date.split('-');

  try {
    const { Items: items = [] } = await doc.query({
      KeyConditionExpression: 'PK = :PK AND begins_with(SK, :SK)',
      ProjectionExpression: '#count, #hostname',
      ExpressionAttributeValues: {
        ':PK': `SITE#${ownerSite}`,
        ':SK': `REFERRER_HOST#${ownerSite}#${month}`,
      },
      ExpressionAttributeNames: {
        '#count': 'Count',
        '#hostname': 'Hostname',
      },
      ScanIndexForward: false,
    });
    return items.map((item) =>
      resultToEntry<ReferrerHostEntry>(['Count', 'Hostname'], item)
    );
  } catch (err) {
    console.log(err);
  }
};

export const getReferrersBySiteAndHost = async (
  doc: ArcTableClient,
  site: string,
  owner: string,
  host: string
): Promise<ReferrerEntry[]> => {
  const ownerSite = `${owner}#${site}`;
  const [yyyy, mm, , month = `${yyyy}-${mm}`] = new Date()
    .toISOString()
    .split('T')
    .shift()
    .split('-');

  try {
    const { Items: items = [] } = await doc.query({
      KeyConditionExpression: 'PK = :PK AND begins_with(SK, :SK)',
      ProjectionExpression: '#count, #pathname',
      ExpressionAttributeValues: {
        ':PK': `SITE#${ownerSite}`,
        ':SK': `REFERRER#${ownerSite}#${month}#${host}`,
      },
      ExpressionAttributeNames: {
        '#count': 'Count',
        '#pathname': 'Pathname',
      },
      ScanIndexForward: false,
    });
    return items.map((item) =>
      resultToEntry<ReferrerEntry>(['Count', 'Pathname'], item)
    );
  } catch (err) {
    console.log(err);
  }
};

export const getUserAgentEntriesBySiteAndDate = async (
  doc: ArcTableClient,
  site: string,
  owner: string,
  date: string
): Promise<UserAgentEntries> => {
  const ownerSite = `${owner}#${site}`;

  try {
    const { Items: items = [] } = await doc.query({
      KeyConditionExpression: 'PK = :PK AND begins_with(SK, :SK)',
      ProjectionExpression:
        '#count, #type, #browser_name, #os_name, #browser_version, #os_version, #device',
      ExpressionAttributeValues: {
        ':PK': `SITE#${ownerSite}`,
        ':SK': `UA#${ownerSite}#${date}`,
      },
      ExpressionAttributeNames: {
        '#count': 'Count',
        '#type': 'Type',
        '#browser_name': 'BrowserName',
        '#browser_version': 'BrowserVersion',
        '#os_name': 'OsName',
        '#os_version': 'OsVersion',
        '#device': 'Device',
      },
      ScanIndexForward: false,
    });
    const browsers = items
      .filter(({ Type: type }) => type === 'BROWSER')
      .map(({ BrowserName: name, BrowserVersion: version, Count: count }) => ({
        name,
        version,
        count,
      })) as UABrowser[];
    const os = items
      .filter(({ Type: type }) => type === 'OS')
      .map(({ OsName: name, OsVersion: version, Count: count }) => ({
        name,
        version,
        count,
      })) as UAOs[];
    const devices = items
      .filter(({ Type: type }) => type === 'DEVICE')
      .map(({ Device: name, Count: count }) => ({
        name,
        count,
      })) as UADevice[];

    return {
      browsers,
      os,
      devices,
    };
  } catch (err) {
    console.log(err);
  }
};

export const addPageView = async (
  data: Data,
  site: string,
  owner: string,
  resource: string,
  userAgent: UserAgent,
  referrer: string | undefined,
  date: number = Date.now()
): Promise<void> => {
  const ownerSite = `${owner}#${site}`;
  const day = new Date(date).toISOString().split('T').shift();
  const [yyyy, mm, , month = `${yyyy}-${mm}`] = day.split('-');
  const {
    browserName,
    browserVersion,
    osName,
    osVersion,
    device: deviceType,
  } = userAgent;
  const pageView: DocumentClient.TransactWriteItem = {
    Update: {
      TableName: data._name('analytics'),
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
    },
  };
  const browser = {
    Update: {
      TableName: data._name('analytics'),
      Key: {
        PK: `SITE#${ownerSite}`,
        SK: `UA#${ownerSite}#${month}#${browserName}#${browserVersion}`,
      },
      UpdateExpression:
        'SET #count = if_not_exists(#count, :zero) + :incr, #date = :date, #type = :type, #browser_name = :browser_name, #browser_version = :browser_version',
      ExpressionAttributeValues: {
        ':zero': 0,
        ':incr': 1,
        ':date': month,
        ':type': 'BROWSER',
        ':browser_name': browserName,
        ':browser_version': browserVersion,
      },
      ExpressionAttributeNames: {
        '#count': 'Count',
        '#date': 'Date',
        '#type': 'Type',
        '#browser_name': 'BrowserName',
        '#browser_version': 'BrowserVersion',
      },
    },
  };
  const os = {
    Update: {
      TableName: data._name('analytics'),
      Key: {
        PK: `SITE#${ownerSite}`,
        SK: `UA#${ownerSite}#${month}#${osName}#${osVersion}`,
      },
      UpdateExpression:
        'SET #count = if_not_exists(#count, :zero) + :incr, #date = :date, #type = :type, #os_name = :os_name, #os_version = :os_version',
      ExpressionAttributeValues: {
        ':zero': 0,
        ':incr': 1,
        ':date': month,
        ':type': 'OS',
        ':os_name': osName,
        ':os_version': osVersion,
      },
      ExpressionAttributeNames: {
        '#count': 'Count',
        '#date': 'Date',
        '#type': 'Type',
        '#os_name': 'OsName',
        '#os_version': 'OsVersion',
      },
    },
  };
  const device = {
    Update: {
      TableName: data._name('analytics'),
      Key: {
        PK: `SITE#${ownerSite}`,
        SK: `UA#${ownerSite}#${month}#${deviceType}`,
      },
      UpdateExpression:
        'SET #count = if_not_exists(#count, :zero) + :incr, #date = :date, #type = :type, #device = :device',
      ExpressionAttributeValues: {
        ':zero': 0,
        ':incr': 1,
        ':date': month,
        ':type': 'DEVICE',
        ':device': deviceType,
      },
      ExpressionAttributeNames: {
        '#count': 'Count',
        '#date': 'Date',
        '#type': 'Type',
        '#device': 'Device',
      },
    },
  };
  const transactItems = [pageView, browser, os, device];

  if (referrer) {
    const [yyyy, mm, , month = `${yyyy}-${mm}`] = day.split('-');
    const { hostname, pathname, search } = new URL(referrer);
    const referrerHostItem: DocumentClient.TransactWriteItem = {
      Update: {
        TableName: data._name('analytics'),
        Key: {
          PK: `SITE#${ownerSite}`,
          SK: `REFERRER_HOST#${ownerSite}#${month}#${hostname}`,
        },
        UpdateExpression:
          'SET #count = if_not_exists(#count, :zero) + :incr, #hostname = :hostname, #month = :month',
        ExpressionAttributeValues: {
          ':zero': 0,
          ':incr': 1,
          ':hostname': hostname,
          ':month': month,
        },
        ExpressionAttributeNames: {
          '#count': 'Count',
          '#hostname': 'Hostname',
          '#month': 'Month',
        },
      },
    };
    const referrerItem: DocumentClient.TransactWriteItem = {
      Update: {
        TableName: data._name('analytics'),
        Key: {
          PK: `SITE#${ownerSite}`,
          SK: `REFERRER#${ownerSite}#${month}#${hostname}#${pathname}${search}`,
        },
        UpdateExpression:
          'SET #count = if_not_exists(#count, :zero) + :incr, #pathname = :pathname, #hostname = :hostname, #month = :month',
        ExpressionAttributeValues: {
          ':zero': 0,
          ':incr': 1,
          ':hostname': hostname,
          ':pathname': `${pathname}${search}`,
          ':month': month,
        },
        ExpressionAttributeNames: {
          '#count': 'Count',
          '#hostname': 'Hostname',
          '#pathname': 'Pathname',
          '#month': 'Month',
        },
      },
    };
    transactItems.push(referrerHostItem, referrerItem);
  }
  try {
    await data._doc
      .transactWrite({
        TransactItems: transactItems,
      })
      .promise();
  } catch (err) {
    console.log(err);
  }
};
