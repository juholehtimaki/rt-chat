#!/usr/bin/env node
import * as cdk from "aws-cdk-lib/core";
import { CertificateStack } from "./lib/certificate-stack";
import { WebsiteStack } from "./lib/website-stack";

const DOMAIN_NAME = "rt-chat.juholehtimaki.com";
const HOSTED_ZONE_NAME = "juholehtimaki.com";

const app = new cdk.App();

const certificateStack = new CertificateStack(app, "CertificateStack", {
	domainName: DOMAIN_NAME,
	hostedZoneName: HOSTED_ZONE_NAME,
	env: {
		account: process.env.CDK_DEFAULT_ACCOUNT,
		region: "us-east-1",
	},
	crossRegionReferences: true,
});

new WebsiteStack(app, "WebsiteStack", {
	domainName: DOMAIN_NAME,
	hostedZoneName: HOSTED_ZONE_NAME,
	certificate: certificateStack.certificate,
	env: {
		account: process.env.CDK_DEFAULT_ACCOUNT,
		region: "eu-west-1",
	},
	crossRegionReferences: true,
});
