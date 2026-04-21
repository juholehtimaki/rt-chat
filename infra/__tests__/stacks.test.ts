import * as cdk from "aws-cdk-lib";
import { Template } from "aws-cdk-lib/assertions";
import { describe, expect, it } from "vitest";
import { CertificateStack } from "../lib/certificate-stack";

describe("CertificateStack", () => {
	it("creates an ACM certificate with DNS validation", () => {
		const app = new cdk.App();
		const stack = new CertificateStack(app, "TestCertificateStack", {
			domainName: "test.example.com",
			hostedZoneName: "example.com",
			env: { account: "123456789012", region: "us-east-1" },
		});

		const template = Template.fromStack(stack);

		template.hasResourceProperties("AWS::CertificateManager::Certificate", {
			DomainName: "test.example.com",
			ValidationMethod: "DNS",
		});
	});

	it("exposes certificate as public property", () => {
		const app = new cdk.App();
		const stack = new CertificateStack(app, "TestCertificateStack", {
			domainName: "test.example.com",
			hostedZoneName: "example.com",
			env: { account: "123456789012", region: "us-east-1" },
		});

		expect(stack.certificate).toBeDefined();
	});
});
