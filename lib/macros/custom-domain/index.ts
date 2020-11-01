import assert from 'assert';
import { ACM, Route53 } from 'aws-sdk';

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

const getDomainFromHostname = (hostname: string): string =>
  hostname.split('.').slice(-2).join('.');

const getHostedZoneId = async (hostname: string): Promise<string | null> => {
  const domain = getDomainFromHostname(hostname);
  const r53 = new Route53();

  try {
    const { HostedZones: zones } = await r53.listHostedZones().promise();
    const { Id: id } = zones.find(({ Name: n }) => n === `${domain}.`) || {};
    return typeof id === 'string' ? id.replace('/hostedzone/', '') : null;
  } catch (err) {
    console.log(
      'An error occurred while trying to retrieve the Hosted Zone ID...'
    );
    console.log(err);
    return null;
  }
};

const getCertificateArn = async (hostname: string): Promise<string | null> => {
  const domain = getDomainFromHostname(hostname);
  const acm = new ACM();

  try {
    const {
      CertificateSummaryList: list,
    } = await acm.listCertificates().promise();
    const { CertificateArn: arn } =
      list.find(({ DomainName: n }) => n === `*.${domain}`) || {};
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
  assert(process.env.HOSTNAME, 'Env var HOSTNAME is present');
  assert(process.env.AWS_PROFILE, 'Env var AWS_PROFILE is present');
  assert(process.env.AWS_REGION, 'Env var AWS_REGION is present');

  const [hostedZoneId, certificateArn] = await Promise.all([
    getHostedZoneId(process.env.HOSTNAME),
    getCertificateArn(process.env.HOSTNAME),
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
