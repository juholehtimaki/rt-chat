import { describe, expect, it } from "vitest";
import { getInitials } from "../utils/getInitials";

describe("getInitials", () => {
	it("returns initials from a single name", () => {
		expect(getInitials("John")).toBe("J");
	});

	it("returns initials from two names", () => {
		expect(getInitials("John Doe")).toBe("JD");
	});

	it("returns only first two initials from multiple names", () => {
		expect(getInitials("John Michael Doe")).toBe("JM");
	});

	it("returns uppercase initials", () => {
		expect(getInitials("john doe")).toBe("JD");
	});

	it("handles empty string", () => {
		expect(getInitials("")).toBe("");
	});
});
