import * as cdk from "aws-cdk-lib";
import type * as acm from "aws-cdk-lib/aws-certificatemanager";
import * as cloudfront from "aws-cdk-lib/aws-cloudfront";
import * as origins from "aws-cdk-lib/aws-cloudfront-origins";
import * as route53 from "aws-cdk-lib/aws-route53";
import * as targets from "aws-cdk-lib/aws-route53-targets";
import * as s3 from "aws-cdk-lib/aws-s3";
import * as s3deploy from "aws-cdk-lib/aws-s3-deployment";
import type { Construct } from "constructs";

type WebsiteStackProps = cdk.StackProps & {
	domainName: string;
	hostedZoneName: string;
	firebaseProjectId: string;
	certificate: acm.ICertificate;
};

export class WebsiteStack extends cdk.Stack {
	public readonly distribution: cloudfront.Distribution;

	constructor(scope: Construct, id: string, props: WebsiteStackProps) {
		super(scope, id, props);

		const hostedZone = route53.HostedZone.fromLookup(this, "HostedZone", {
			domainName: props.hostedZoneName,
		});

		const websiteBucket = new s3.Bucket(this, "WebsiteBucket", {
			blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
			removalPolicy: cdk.RemovalPolicy.DESTROY,
			autoDeleteObjects: true,
		});

		const cspPolicy = [
			"default-src 'self'",
			"script-src 'self' https://www.gstatic.com",
			"style-src 'self' 'unsafe-inline'",
			"font-src 'self' data:",
			"img-src 'self' data:",
			[
				"connect-src 'self'",
				`https://${props.firebaseProjectId}.firebaseapp.com`,
				"https://identitytoolkit.googleapis.com",
				"https://securetoken.googleapis.com",
				"https://www.googleapis.com",
				"https://firestore.googleapis.com",
				"wss://firestore.googleapis.com",
				"https://firebaselists.googleapis.com",
				"https://www.google-analytics.com",
				"https://analytics.google.com",
				"https://firebaselogging.googleapis.com",
				`https://${props.firebaseProjectId}.firebasestorage.app`,
				"https://firebase.google.com",
			].join(" "),
			"frame-ancestors 'none'",
			"base-uri 'self'",
			"form-action 'self'",
		].join("; ");

		const securityHeaders = new cloudfront.ResponseHeadersPolicy(
			this,
			"SecurityHeaders",
			{
				securityHeadersBehavior: {
					contentSecurityPolicy: {
						contentSecurityPolicy: cspPolicy,
						override: true,
					},
					contentTypeOptions: { override: true },
					frameOptions: {
						frameOption: cloudfront.HeadersFrameOption.DENY,
						override: true,
					},
					referrerPolicy: {
						referrerPolicy:
							cloudfront.HeadersReferrerPolicy.STRICT_ORIGIN_WHEN_CROSS_ORIGIN,
						override: true,
					},
					strictTransportSecurity: {
						accessControlMaxAge: cdk.Duration.days(365),
						includeSubdomains: true,
						override: true,
					},
					xssProtection: {
						protection: true,
						modeBlock: true,
						override: true,
					},
				},
			},
		);

		this.distribution = new cloudfront.Distribution(this, "Distribution", {
			defaultRootObject: "index.html",
			domainNames: [props.domainName],
			certificate: props.certificate,
			minimumProtocolVersion: cloudfront.SecurityPolicyProtocol.TLS_V1_2_2021,
			defaultBehavior: {
				origin: origins.S3BucketOrigin.withOriginAccessControl(websiteBucket),
				compress: true,
				allowedMethods: cloudfront.AllowedMethods.ALLOW_GET_HEAD_OPTIONS,
				viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
				responseHeadersPolicy: securityHeaders,
			},
			errorResponses: [
				{
					httpStatus: 403,
					responseHttpStatus: 200,
					responsePagePath: "/index.html",
				},
			],
		});

		new route53.ARecord(this, "AliasRecord", {
			zone: hostedZone,
			recordName: props.domainName,
			target: route53.RecordTarget.fromAlias(
				new targets.CloudFrontTarget(this.distribution),
			),
		});

		new s3deploy.BucketDeployment(this, "DeployWebsite", {
			sources: [s3deploy.Source.asset("../apps/web/dist")],
			destinationBucket: websiteBucket,
			distribution: this.distribution,
			distributionPaths: ["/*"],
		});
	}
}
