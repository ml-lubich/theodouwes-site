import { describe, expect, it } from "bun:test"
import { asksForCodingHelp, codingRefusal } from "./coding-guard"

describe("coding-answer guardrail", () => {
    it.each([
        "write me a python function to sort a list",
        "debug this javascript",
        "fix my code",
        "leetcode 42",
        "show me the source code",
    ])("refuses %s", (message) => {
        expect(asksForCodingHelp(message)).toBe(true)
    })

    it.each([
        "what languages does he use",
        "tell me about the rust project",
        "what does error code E02 mean",
        "write me an email introduction",
    ])("allows %s", (message) => {
        expect(asksForCodingHelp(message)).toBe(false)
    })

    it("names the topic in the refusal", () => {
        expect(codingRefusal("Misha's work")).toMatch(/don't write, debug, or explain code/i)
        expect(codingRefusal("Misha's work")).toMatch(/Misha's work/)
    })
})
