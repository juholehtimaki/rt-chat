#!/usr/bin/env node
import "dotenv/config";
import * as cdk from "aws-cdk-lib/core";
import { CertificateStack } from "./lib/certificate-stack";
import { WebsiteStack } from "./lib/website-stack";

const DOMAIN_NAME = process.env.DOMAIN_NAME;
const HOSTED_ZONE_NAME = process.env.HOSTED_ZONE_NAME;
const FIREBASE_PROJECT_ID = process.env.FIREBASE_PROJECT_ID;

if (!DOMAIN_NAME || !HOSTED_ZONE_NAME || !FIREBASE_PROJECT_ID) {
	throw new Error(
		"Missing required environment variables: DOMAIN_NAME, HOSTED_ZONE_NAME, FIREBASE_PROJECT_ID",
	);
}

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
	firebaseProjectId: FIREBASE_PROJECT_ID,
	certificate: certificateStack.certificate,
	env: {
		account: process.env.CDK_DEFAULT_ACCOUNT,
		region: "eu-west-1",
	},
	crossRegionReferences: true,
});
