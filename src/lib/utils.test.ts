import { getDateKeyParis, validateThoughtContent } from './utils';

function test() {
    console.log("--- Running Tests ---");

    // Test getDateKeyParis
    const dateStr = getDateKeyParis(new Date("2026-01-16T10:00:00Z"));
    // In Paris (UTC+1), 10:00 UTC is 11:00. Date remains same.
    console.assert(dateStr === "2026-01-16", `Expected 2026-01-16, got ${dateStr}`);

    const lateNight = getDateKeyParis(new Date("2026-01-16T23:30:00Z"));
    // 23:30 UTC is 00:30 next day in Paris.
    console.assert(lateNight === "2026-01-17", `Expected 2026-01-17 for late night, got ${lateNight}`);

    // Test validateThoughtContent
    console.assert(validateThoughtContent("") !== null, "Empty content should be invalid");
    console.assert(validateThoughtContent("   ") !== null, "Whitespace content should be invalid");
    console.assert(validateThoughtContent("A".repeat(281)) !== null, "Exceeding 280 chars should be invalid");
    console.assert(validateThoughtContent("Ma pensée") === null, "Valid content should be valid");

    console.log("--- All tests passed! ---");
}

test();
