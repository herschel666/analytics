import {
  Chart,
  LinearScale,
  CategoryScale,
  LineController,
  PieController,
  PointElement,
  LineElement,
  ArcElement,
  Legend,
  Tooltip,
} from 'chart.js';

Chart.register(
  LinearScale,
  CategoryScale,
  LineController,
  PieController,
  PointElement,
  LineElement,
  ArcElement,
  Legend,
  Tooltip
);

export { Chart };
