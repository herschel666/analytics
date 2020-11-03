import h from 'vhtml';
import type { HC } from 'vhtml';

type Type = 'devices' | 'referrers';

interface Props {
  site: string;
  type: Type;
  currentYear: number;
  currentMonth: number;
}

const MIN_YEAR = 2000;

const getLatestDate = (): [number, number] => {
  const [latestYear, latestMonth] = new Date()
    .toISOString()
    .split('T')
    .shift()
    .split('-')
    .slice(0, 2);

  if (
    !Boolean(String(latestYear).match(/^\d{4}$/)) ||
    !Boolean(String(latestMonth).match(/^\d{2}$/))
  ) {
    throw new Error('Could not get latest date.');
  }

  return [Number(latestYear), Number(latestMonth)];
};

const getUrlBase = (site: string, type: Type): string =>
  `/i/site/${site}/${type}`;

const padLeft = (i: number): string => `0${i}`.slice(-2);

const getPreviousMonthUrl = (
  site: string,
  type: Type,
  currentYear: number,
  currentMonth: number
): string | undefined => {
  const isSameYear = currentMonth > 1;
  const year = isSameYear ? currentYear : currentYear - 1;

  if (!isSameYear && year < MIN_YEAR) {
    return;
  }

  const month = isSameYear ? currentMonth - 1 : 12;
  return `${getUrlBase(site, type)}/${year}-${padLeft(month)}`;
};

const getNextMonthUrl = (
  site: string,
  type: Type,
  currentYear: number,
  currentMonth: number,
  latestYear: number,
  latestMonth: number
): string | undefined => {
  if (currentYear === latestYear && currentMonth === latestMonth) {
    return;
  }
  const isSameYear = currentMonth < 12;
  const year = isSameYear ? currentYear : currentYear + 1;
  const month = isSameYear ? currentMonth + 1 : 1;
  return `${getUrlBase(site, type)}/${year}-${padLeft(month)}`;
};

export const MonthNavigation: HC<Props> = ({
  site,
  type,
  currentYear,
  currentMonth,
}) => {
  const [latestYear, latestMonth] = getLatestDate();
  const previousMonthUrl = getPreviousMonthUrl(
    site,
    type,
    currentYear,
    currentMonth
  );
  const nextMonthUrl = getNextMonthUrl(
    site,
    type,
    currentYear,
    currentMonth,
    latestYear,
    latestMonth
  );

  return (
    <nav class="row my-5">
      <div class="col text-right">
        {Boolean(previousMonthUrl) && (
          <a href={previousMonthUrl}>Previous Month</a>
        )}
      </div>
      <h5 class="col text-center">
        {currentYear}/{currentMonth}
      </h5>
      <div class="col">
        {Boolean(nextMonthUrl) && <a href={nextMonthUrl}>Next Month</a>}
      </div>
    </nav>
  );
};
