import Chart from 'chart.js';

export const init = (canvas: HTMLCanvasElement): void => {
  const ctx = canvas.getContext('2d');
  const dates = JSON.parse(canvas.dataset.dates) as string[];
  const hits = JSON.parse(canvas.dataset.hits) as number[];

  new Chart(ctx, {
    type: 'line',
    data: {
      labels: dates,
      datasets: [
        {
          label: `Page Views of the last ${dates.length} days`,
          data: hits,
          lineTension: 0,
          backgroundColor: 'transparent',
          borderColor: 'rgba(43, 108, 176)',
          pointBorderColor: 'rgba(43, 108, 176, 0.7)',
          pointHoverBorderColor: 'rgba(43, 108, 176)',
          pointBorderWidth: 3,
        },
      ],
    },
  });
};
