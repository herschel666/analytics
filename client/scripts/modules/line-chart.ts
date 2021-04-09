import { Chart } from './chart';

const niceMonthToNumber = (month: string): number | never => {
  const abbreviations = {
    Jan: 1,
    Feb: 2,
    Mar: 3,
    Apr: 4,
    May: 5,
    Jun: 6,
    Jul: 7,
    Aug: 8,
    Sep: 9,
    Oct: 10,
    Nov: 11,
    Dec: 12,
  };
  if (!abbreviations[month]) {
    throw new Error(`Invalid month "${month}" given.`);
  }
  return abbreviations[month];
};

const asc = (a, b) => a - b;

const padLeft = (i: number): string => `0${i}`.slice(-2);

export const init = (
  canvas: HTMLCanvasElement,
  prefetchSinglePage: (uri: string | null) => void,
  visit: (uri: string) => void
): void => {
  const ctx = canvas.getContext('2d');
  const site = canvas.dataset.site;
  const dates = JSON.parse(canvas.dataset.dates) as string[];
  const hits = JSON.parse(canvas.dataset.hits) as number[];
  const from = canvas.dataset.from;
  const to = canvas.dataset.to;
  const min = Math.max(0, [...hits].sort(asc).shift() - 1);
  const max = [...hits].sort(asc).pop() + 1;

  const getUriByIndex = (index: number): string => {
    const [day, month, year] = dates[index].replace('.', '').split(/\s+/);
    const date = `${year}-${padLeft(niceMonthToNumber(month))}-${day}`;
    const params =
      Boolean(from) && Boolean(to)
        ? `?range=${encodeURIComponent(btoa(JSON.stringify({ from, to })))}`
        : '';
    return `/i/site/${site}/date/${date}${params}`;
  };

  new Chart(ctx, {
    type: 'line',
    data: {
      labels: dates,
      datasets: [
        {
          label: `Page Views from ${from} to ${to}`,
          data: hits,
          tension: 0,
          backgroundColor: 'transparent',
          borderColor: 'rgba(13, 110, 253)',
          pointBorderColor: 'rgba(13, 110, 253, 0.7)',
          pointHoverBorderColor: 'rgba(13, 110, 253)',
          pointBorderWidth: 6,
        },
      ],
    },
    options: {
      scales: {
        y: { min, max, ticks: { stepSize: 1 } },
      },
      onHover: (_, [element]) => {
        const className = 'cursor-pointer';
        if (element && hits[element.index] > 0) {
          prefetchSinglePage(getUriByIndex(element.index));
          canvas.classList.add(className);
        } else {
          canvas.classList.remove(className);
        }
      },
      onClick: (_, [element]) => {
        if (!element || hits[element.index] === 0) {
          return;
        }
        visit(getUriByIndex(element.index));
      },
    },
  });
};
