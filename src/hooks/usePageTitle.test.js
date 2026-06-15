import { describe, it, expect, afterEach } from "vitest";
import { renderHook } from "@testing-library/react";
import { usePageTitle } from "./usePageTitle";

const BRAND = "Kosmos";

afterEach(() => {
  document.title = BRAND;
});

describe("usePageTitle", () => {
  it("sets document.title with brand suffix when title provided", () => {
    renderHook(() => usePageTitle("Catálogo"));
    expect(document.title).toBe(`Catálogo | ${BRAND}`);
  });

  it("sets document.title to brand only when no title", () => {
    renderHook(() => usePageTitle(undefined));
    expect(document.title).toBe(BRAND);
  });

  it("sets document.title to brand only for empty string", () => {
    renderHook(() => usePageTitle(""));
    expect(document.title).toBe(BRAND);
  });

  it("updates title when hook argument changes", () => {
    const { rerender } = renderHook(({ title }) => usePageTitle(title), {
      initialProps: { title: "Página A" },
    });
    expect(document.title).toBe(`Página A | ${BRAND}`);

    rerender({ title: "Página B" });
    expect(document.title).toBe(`Página B | ${BRAND}`);
  });

  it("resets to brand name on unmount", () => {
    const { unmount } = renderHook(() => usePageTitle("Producto"));
    expect(document.title).toBe(`Producto | ${BRAND}`);
    unmount();
    expect(document.title).toBe(BRAND);
  });
});
