import assert from "node:assert/strict";
import { test } from "node:test";
import { extractVimeoHash, extractVimeoId } from "./thumbnail.ts";

test("extractVimeoId accepts numeric IDs and watch URLs", () => {
  assert.equal(extractVimeoId("1216249852"), "1216249852");
  assert.equal(
    extractVimeoId("https://vimeo.com/1216249852"),
    "1216249852",
  );
  assert.equal(
    extractVimeoId("https://player.vimeo.com/video/1216249852"),
    "1216249852",
  );
  assert.equal(extractVimeoId("https://vimeo.com/1216249852/abc123def"), "1216249852");
  assert.equal(extractVimeoId(""), null);
  assert.equal(extractVimeoId("not-a-video"), null);
});

test("extractVimeoHash reads unlisted share URLs", () => {
  assert.equal(
    extractVimeoHash("https://vimeo.com/1216249852/abcdef0123"),
    "abcdef0123",
  );
  assert.equal(extractVimeoHash("https://vimeo.com/1216249852"), null);
  assert.equal(extractVimeoHash("1216249852"), null);
});
