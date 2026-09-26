/**
 * Refuse requests to write, debug, or explain code before the model runs.
 * Phrase-shaped so "what languages does he use" and "error code" stay in bounds.
 */

const CODING_REQUEST =
    /(?:\b(?:write|debug|fix|implement|refactor)\s+(?:me\s+)?(?:a\s+|an\s+|some\s+|the\s+|this\s+|my\s+)?(?:python|javascript|typescript|java|rust|golang|sql|react|function|script|program|component|algorithm|snippet|class|regex)\b|\b(?:python|javascript|typescript|java|rust|golang|sql)\s+(?:function|script|code|program|class|snippet)\b|\b(?:fix|debug)\s+(?:this|my)\s+(?:code|script|function|bug|program)\b|\bwrite\s+(?:me\s+)?(?:some\s+)?code\b|\bsource\s+code\b|\bleetcode\b)/i

export function asksForCodingHelp(message: string): boolean {
    return CODING_REQUEST.test(message.trim())
}

export function codingRefusal(topic: string): string {
    return `I don't write, debug, or explain code. I can help with ${topic}.`
}
