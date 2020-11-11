interface Resources {
  [x: string]: { Type: string };
}

interface AnalyticsDashboard {
  Type: 'AWS::CloudWatch::Dashboard';
  Properties: {
    DashboardName: string;
    DashboardBody: unknown;
  };
}

interface CFN {
  Resources: Resources;
  AnalyticsDashboard?: AnalyticsDashboard;
}

const createWidget = (region: string, lambdas: string[]) => [
  JSON.stringify(
    lambdas.map((lambda) => ({
      view: 'timeSeries',
      stacked: false,
      metrics: [
        [
          'AWS/Lambda',
          'Duration',
          'FunctionName',
          ['${', lambda, '}'].join(''),
        ],
      ],
      period: 300,
      region,
    }))
  ),
  lambdas.reduce(
    (acc, lambda) => ({
      ...acc,
      [lambda]: { Ref: lambda },
    }),
    {}
  ),
];

module.exports = (
  _: unknown,
  cfn: CFN,
  stage: 'staging' | 'production'
): CFN => {
  if (!process.env.AWS_REGION) {
    throw new Error('Please set the AWS region.');
  }

  const stageName = stage.replace(/^[a-z]/, (c) => c.toUpperCase());
  const lambdas = Object.entries(cfn.Resources)
    .filter(([, { Type: type }]) => type === 'AWS::Serverless::Function')
    .map(([lambda]) => lambda);

  cfn.AnalyticsDashboard = {
    Type: 'AWS::CloudWatch::Dashboard',
    Properties: {
      DashboardName: `${stageName}AnalyticsDashboard`,
      DashboardBody: {
        'Fn:Sub': createWidget(process.env.AWS_REGION, lambdas),
      },
    },
  };

  return cfn;
};
