import h from 'vhtml';
import type { HC } from 'vhtml';

interface Props {
  dates: string;
  hits: string;
}

export const LineChart: HC<Props> = ({ dates, hits }) => {
  return (
    <div class="line-chart">
      <canvas id="line-chart" data-dates={dates} data-hits={hits}></canvas>
    </div>
  );
};
