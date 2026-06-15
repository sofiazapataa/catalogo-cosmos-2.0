import { describe, it, expect } from "vitest";
import {
  formatARS,
  getProductDiscountPrice,
  getPaymentPrice,
  getPaymentConfig,
} from "./pricing";

// ─── formatARS ───────────────────────────────────────────────────────────────
describe("formatARS", () => {
  it("formats integer prices with Argentine locale", () => {
    // es-AR uses period as thousands separator
    const result = formatARS(1000);
    expect(result).toMatch(/1[.,]000/);
  });

  it("returns '0' for falsy values", () => {
    expect(formatARS(0)).toBe("0");
    expect(formatARS(null)).toBe("0");
    expect(formatARS(undefined)).toBe("0");
  });

  it("handles string numbers", () => {
    const result = formatARS("500");
    expect(result).toBe("500");
  });
});

// ─── getProductDiscountPrice ─────────────────────────────────────────────────
describe("getProductDiscountPrice", () => {
  it("returns base price when no discount", () => {
    expect(getProductDiscountPrice({ price: 1000, discount: 0 })).toBe(1000);
    expect(getProductDiscountPrice({ price: 1000 })).toBe(1000);
  });

  it("applies percentage discount correctly", () => {
    expect(getProductDiscountPrice({ price: 1000, discount: 10 })).toBe(900);
    expect(getProductDiscountPrice({ price: 1000, discount: 25 })).toBe(750);
    expect(getProductDiscountPrice({ price: 1000, discount: 100 })).toBe(0);
  });

  it("rounds to nearest integer", () => {
    // 1000 * (1 - 33/100) = 670
    expect(getProductDiscountPrice({ price: 1000, discount: 33 })).toBe(670);
  });

  it("returns 0 for missing price", () => {
    expect(getProductDiscountPrice({ discount: 10 })).toBe(0);
    expect(getProductDiscountPrice({})).toBe(0);
  });

  it("ignores negative discounts", () => {
    expect(getProductDiscountPrice({ price: 1000, discount: -5 })).toBe(1000);
  });
});

// ─── getPaymentConfig ─────────────────────────────────────────────────────────
describe("getPaymentConfig", () => {
  it("returns default config when no paymentOptions", () => {
    const config = getPaymentConfig({ price: 1000 });
    expect(config.transfer.enabled).toBe(true);
    expect(config.transfer.discountPct).toBe(0);
    expect(config.cash.enabled).toBe(true);
    expect(config.other.enabled).toBe(true);
  });

  it("merges product paymentOptions over defaults", () => {
    const product = {
      price: 1000,
      paymentOptions: {
        transfer: { discountPct: 5, showDiscountLabel: false },
      },
    };
    const config = getPaymentConfig(product);
    expect(config.transfer.discountPct).toBe(5);
    expect(config.transfer.showDiscountLabel).toBe(false);
    expect(config.transfer.enabled).toBe(true); // default preserved
    expect(config.cash.discountPct).toBe(0);    // other methods unchanged
  });
});

// ─── getPaymentPrice ─────────────────────────────────────────────────────────
describe("getPaymentPrice", () => {
  const baseProduct = { price: 1000, discount: 0 };

  it("returns product price when payment has no extra discount", () => {
    expect(getPaymentPrice(baseProduct, "transfer")).toBe(1000);
    expect(getPaymentPrice(baseProduct, "cash")).toBe(1000);
  });

  it("applies payment discount on top of product price", () => {
    const product = {
      price: 1000,
      discount: 0,
      paymentOptions: {
        transfer: { enabled: true, discountPct: 5, applyDiscount: true, showDiscountLabel: true, label: "Transferencia" },
      },
    };
    expect(getPaymentPrice(product, "transfer")).toBe(950);
  });

  it("stacks payment discount on top of product discount", () => {
    const product = {
      price: 1000,
      discount: 10, // → 900
      paymentOptions: {
        transfer: { enabled: true, discountPct: 5, applyDiscount: true, showDiscountLabel: true, label: "Transferencia" },
      },
    };
    // 900 * 0.95 = 855
    expect(getPaymentPrice(product, "transfer")).toBe(855);
  });

  it("returns product price when payment discount is disabled", () => {
    const product = {
      price: 1000,
      discount: 0,
      paymentOptions: {
        transfer: { enabled: true, discountPct: 5, applyDiscount: false, showDiscountLabel: true, label: "Transferencia" },
      },
    };
    expect(getPaymentPrice(product, "transfer")).toBe(1000);
  });
});
