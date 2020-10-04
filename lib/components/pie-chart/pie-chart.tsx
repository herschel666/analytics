import h from 'vhtml';
import type { HC } from 'vhtml';

interface Props {
  numbers: number[];
  labels: string[];
}

export const PieChart: HC<Props> = ({ numbers, labels }) => {
  return (
    <div class="pie-chart">
      <canvas
        class="js-pie-chart"
        data-numbers={JSON.stringify(numbers)}
        data-labels={JSON.stringify(labels)}
      ></canvas>
    </div>
  );
};
