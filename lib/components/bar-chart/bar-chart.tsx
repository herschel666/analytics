import h from 'vhtml';
import type { HC } from 'vhtml';
import type { PageView } from '../../shared/ddb';
import { getParams } from '../../shared/util';
import * as styled from './styled';

export type AggregatedPageView = Pick<PageView, 'date' | 'pageViews'>;

interface Props {
  aggregatedPageViews: AggregatedPageView[];
  site: string;
  debug: boolean;
}

const getMaxPageViews = (pageViews: AggregatedPageView[]): number =>
  pageViews.reduce(
    (max: number, { pageViews }: AggregatedPageView) =>
      Math.max(max, pageViews),
    0
  );

const formatDate = (date: string): string => {
  const [year, month, day] = date.split('-');
  const abbreviations = {
    '01': 'Jan',
    '02': 'Feb',
    '03': 'Mar',
    '04': 'Apr',
    '05': 'May',
    '06': 'Jun',
    '07': 'Jul',
    '08': 'Aug',
    '09': 'Sep',
    '10': 'Oct',
    '11': 'Nov',
    '12': 'Dec',
  };
  return `${day}.\n${abbreviations[month]}\n${year}`;
};

const columnOffset = (columns: number, count): string =>
  ((100 / columns) * count).toFixed(6);

const columnHeight = (maxPageViews: number, pageViews: number): string =>
  ((100 / maxPageViews) * pageViews).toFixed(6);

export const BarChart: HC<Props> = ({
  aggregatedPageViews: pageViews,
  site,
  debug,
}) => {
  const maxPageViews = getMaxPageViews(pageViews);
  const columns = pageViews.length;

  return (
    <styled.BarChart class="bar-chart">
      <styled.Caption class="bar-chart__caption">
        Page Views of the last 14 days
      </styled.Caption>
      <styled.Head>
        <tr>
          <th></th>
          <th>Page Views</th>
        </tr>
      </styled.Head>
      <styled.Body class="bar-chart__body">
        {pageViews.map(({ pageViews, date: pageViewDate }, i) => (
          <styled.Bar
            class="bar-chart__column-wrap"
            style={`left: ${columnOffset(columns, i)}%`}
          >
            <styled.BarCaption class="bar-chart__column-caption" scope="row">
              <a href={`/${getParams(debug, site, pageViewDate)}`}>
                {formatDate(pageViewDate)}
              </a>
            </styled.BarCaption>
            <styled.BarValue
              class="bar-chart__column"
              style={`height: ${columnHeight(maxPageViews, pageViews)}%`}
            >
              {pageViews}
            </styled.BarValue>
          </styled.Bar>
        ))}
      </styled.Body>
    </styled.BarChart>
  );
};
