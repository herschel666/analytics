import type { ArcTableClient } from '@architect/functions';

export interface PageView {
  pageViews: number;
  date: string;
  pathname: string;
}

const increaseByOneDay = (date: string): string => {
  const [dayString, month, year] = date.split('-').reverse();
  const [second, first = '0'] = String(Number(dayString) + 1)
    .split('')
    .reverse();
  const day = `${first}${second}`;
  return `${year}-${month}-${day}`;
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
  to: string
): Promise<PageView[]> => {
  const { Items: items = [] } = await doc.query({
    KeyConditionExpression: `PK = :PK AND SK BETWEEN :from AND :to`,
    ProjectionExpression: '#page_views, #date, #pathname',
    ExpressionAttributeValues: {
      ':PK': `${owner}#${hostname}`,
      ':from': from,
      ':to': increaseByOneDay(to),
    },
    ExpressionAttributeNames: {
      '#page_views': 'PageViews',
      '#date': 'Date',
      '#pathname': 'Pathname',
    },
    ScanIndexForward: true,
  });
  return items.map(({ PageViews, Date: date, Pathname: pathname }) => ({
    pageViews: Number(PageViews),
    date,
    pathname,
  }));
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
