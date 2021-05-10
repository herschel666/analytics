import assert from 'assert';
import { ACM, Route53 } from 'aws-sdk';

import { truthy } from '../../shared/util';

interface CFN {
  Resources: {
    HTTP: {
      Properties: {
        Domain: {
          CertificateArn: string;
          DomainName: string;
          Route53: {
            HostedZoneId: string;
          };
        };
      };
    };
  };
}

const assertCredentials = (
  { AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_PROFILE }: NodeJS.ProcessEnv,
  message: string
): void | never => {
  assert(
    (truthy(AWS_ACCESS_KEY_ID) && truthy(AWS_SECRET_ACCESS_KEY)) ||
      truthy(AWS_PROFILE),
    message
  );
};

const getDomainFromHostname = (hostname: string): string =>
  hostname.split('.').slice(-2).join('.');

const getHostedZoneId = async (hostname: string): Promise<string | null> => {
  const domain = getDomainFromHostname(hostname);
  const r53 = new Route53();

  try {
    const { HostedZones: zones } = await r53.listHostedZones().promise();

    console.log('Retrieved %s zones', zones.length);

    const { Id: id } = zones.find(({ Name: n }) => n === `${domain}.`) || {};

    console.log('Retrieved hosted zone ID: %s', typeof id === 'string');

    return typeof id === 'string' ? id.replace('/hostedzone/', '') : null;
  } catch (err) {
    console.log(
      'An error occurred while trying to retrieve the Hosted Zone ID...'
    );
    console.log(err);
    return null;
  }
};

const getCertificateArn = async (
  region: string,
  hostname: string
): Promise<string | null> => {
  const domain = getDomainFromHostname(hostname);
  const acm = new ACM({ region });

  try {
    const { CertificateSummaryList: list } = await acm
      .listCertificates()
      .promise();
    const { CertificateArn: arn } =
      list.find(({ DomainName: n }) => n === `*.${domain}`) || {};

    console.log('Retrieved certificate arn: %s', typeof arn === 'string');

    return arn || null;
  } catch (err) {
    console.log(
      'An error occurred while trying to retrieve the Certificate ARN...'
    );
    console.log(err);
    return null;
  }
};

module.exports = async (_: unknown, cfn: CFN): Promise<CFN> | never => {
  assert(truthy(process.env.HOSTNAME), 'Env var HOSTNAME is present');
  assert(truthy(process.env.AWS_REGION), 'Env var AWS_REGION is present');
  assertCredentials(
    process.env,
    'AWS credentials are given explicitly or via profile'
  );

  const [hostedZoneId, certificateArn] = await Promise.all([
    getHostedZoneId(process.env.HOSTNAME),
    getCertificateArn(process.env.AWS_REGION, process.env.HOSTNAME),
  ]);

  if (!hostedZoneId || !certificateArn) {
    throw new Error('Missing Hosted Zone ID or Certificate Arn.');
  }

  cfn.Resources.HTTP.Properties.Domain = {
    CertificateArn: certificateArn,
    DomainName: process.env.HOSTNAME,
    Route53: {
      HostedZoneId: hostedZoneId,
    },
  };

  return cfn;
};
