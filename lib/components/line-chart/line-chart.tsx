import h from 'vhtml';
import type { HC } from 'vhtml';

interface Props {
  site: string;
  dates: string;
  hits: string;
  from?: string;
  to?: string;
}

export const LineChart: HC<Props> = ({ site, dates, hits, from, to }) => {
  return (
    <div class="line-chart">
      <canvas
        id="line-chart"
        data-site={site}
        data-dates={dates}
        data-hits={hits}
        data-from={from}
        data-to={to}
      ></canvas>
    </div>
  );
};
