import Chart from 'chart.js';

const colors = [
  '#0d6efd',
  '#6c757d',
  '#198754',
  '#dc3545',
  '#ffc107',
  '#0dcaf0',
  '#343a40',
];

export const init = (canvas: HTMLCanvasElement): void => {
  const ctx = canvas.getContext('2d');
  const numbers = JSON.parse(canvas.dataset.numbers) as number[];
  const labels = JSON.parse(canvas.dataset.labels) as string[];

  new Chart(ctx, {
    type: 'pie',
    data: {
      datasets: [
        {
          data: numbers,
          backgroundColor: numbers.map((_: number, i: number) => colors[i]),
        },
      ],
      labels,
    },
  });
};
