import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { buildHref } from "./href.ts";

describe("buildHref", () => {
  it("monta rota dinâmica e query", () => {
    assert.equal(buildHref("/patrimonios/$tag", { tag: "12316" }), "/patrimonios/12316");
    assert.equal(
      buildHref("/cadastros", undefined, { lista: "filiais" }),
      "/cadastros?lista=filiais",
    );
    assert.equal(buildHref("/patrimonios/plaqueta", undefined, {}), "/patrimonios/plaqueta");
  });
});
