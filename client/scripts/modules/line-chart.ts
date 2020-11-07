import Chart from 'chart.js';

interface PseudoChartElement {
  _index: number;
}

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

const padLeft = (i: number): string => `0${i}`.slice(-2);

export const init = (
  canvas: HTMLCanvasElement,
  visit: (uri: string) => void
): void => {
  const ctx = canvas.getContext('2d');
  const site = canvas.dataset.site;
  const dates = JSON.parse(canvas.dataset.dates) as string[];
  const hits = JSON.parse(canvas.dataset.hits) as number[];
  const from = canvas.dataset.from;
  const to = canvas.dataset.to;
  const min = Math.max(0, [...hits].sort().shift() - 1);
  const max = [...hits].sort().pop() + 1;

  new Chart(ctx, {
    type: 'line',
    data: {
      labels: dates,
      datasets: [
        {
          label: `Page Views from ${from} to ${to}`,
          data: hits,
          lineTension: 0,
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
        yAxes: [{ ticks: { min, max, stepSize: 1 } }],
      },
      onHover: (_: PointerEvent, [element]: PseudoChartElement[]): void => {
        const className = 'cursor-pointer';
        if (element && hits[element._index] > 0) {
          canvas.classList.add(className);
        } else {
          canvas.classList.remove(className);
        }
      },
      onClick: (_: PointerEvent, [element]: PseudoChartElement[]): void => {
        if (!element || hits[element._index] === 0) {
          return;
        }
        const [day, month, year] = dates[element._index]
          .replace('.', '')
          .split(/\s+/);
        const date = `${year}-${padLeft(niceMonthToNumber(month))}-${day}`;
        const params =
          Boolean(from) && Boolean(to)
            ? `?range=${encodeURIComponent(btoa(JSON.stringify({ from, to })))}`
            : '';

        visit(`/i/site/${site}/date/${date}${params}`);
      },
    },
  });
};
