import { describe, expect, it } from "vitest";
import { getInitial } from "../utils/getInitial";

describe("getInitial", () => {
	it("returns first letter from a name", () => {
		expect(getInitial("John")).toBe("J");
	});

	it("returns first letter uppercase", () => {
		expect(getInitial("john")).toBe("J");
	});

	it("handles empty string", () => {
		expect(getInitial("")).toBe("");
	});
});
