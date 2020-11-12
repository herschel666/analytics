interface AnalyticsDashboard {
  Type: 'AWS::CloudWatch::Dashboard';
  Properties: {
    DashboardName: string;
    DashboardBody: unknown;
  };
}

interface Resources {
  AnalyticsDashboard?: AnalyticsDashboard;
  [x: string]: { Type: string };
}

interface CFN {
  Resources: Resources;
}

const createWidget = (lambdas: string[]) => [
  JSON.stringify({
    widgets: [
      {
        type: 'metric',
        x: 0,
        y: 0,
        width: 9,
        height: 9,
        properties: {
          view: 'timeSeries',
          stacked: false,
          metrics: lambdas.map((lambda) => [
            'AWS/Lambda',
            'Duration',
            'FunctionName',
            ['${', lambda, '}'].join(''),
          ]),
          period: 300,
          region: '${AWS::Region}',
        },
      },
    ],
  }),
  lambdas.reduce(
    (acc, lambda) => ({
      ...acc,
      [lambda]: { Ref: lambda },
    }),
    []
  ),
];

module.exports = (
  _: unknown,
  cfn: CFN,
  stage: 'staging' | 'production'
): CFN => {
  const stageName = stage.replace(/^[a-z]/, (c) => c.toUpperCase());
  const lambdas = Object.entries(cfn.Resources)
    .filter(([, { Type: type }]) => type === 'AWS::Serverless::Function')
    .map(([lambda]) => lambda);

  cfn.Resources.AnalyticsDashboard = {
    Type: 'AWS::CloudWatch::Dashboard',
    Properties: {
      DashboardName: `${stageName}AnalyticsDashboard`,
      DashboardBody: {
        'Fn::Sub': createWidget(lambdas),
      },
    },
  };

  return cfn;
};
