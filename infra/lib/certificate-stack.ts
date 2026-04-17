import * as cdk from "aws-cdk-lib";
import * as acm from "aws-cdk-lib/aws-certificatemanager";
import * as route53 from "aws-cdk-lib/aws-route53";
import type { Construct } from "constructs";

type CertificateStackProps = cdk.StackProps & {
	domainName: string;
	hostedZoneName: string;
};

export class CertificateStack extends cdk.Stack {
	public readonly certificate: acm.Certificate;

	constructor(scope: Construct, id: string, props: CertificateStackProps) {
		super(scope, id, props);

		const hostedZone = route53.HostedZone.fromLookup(this, "HostedZone", {
			domainName: props.hostedZoneName,
		});

		this.certificate = new acm.Certificate(this, "Certificate", {
			domainName: props.domainName,
			validation: acm.CertificateValidation.fromDns(hostedZone),
		});
	}
}
