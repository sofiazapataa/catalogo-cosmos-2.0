export function formatARS(value) {
  return Number(value || 0).toLocaleString("es-AR");
}

export function getPaymentConfig(product) {
  const defaults = {
    transfer: {
      enabled: true,
      discountPct: 0,
      label: "Transferencia",
      applyDiscount: true,
      showDiscountLabel: true,
    },
    cash: {
      enabled: true,
      discountPct: 0,
      label: "Efectivo",
      applyDiscount: true,
      showDiscountLabel: true,
    },
    other: {
      enabled: true,
      discountPct: 0,
      label: "Otro medio",
      applyDiscount: true,
      showDiscountLabel: true,
    },
  };

  return {
    ...defaults,
    ...(product.paymentOptions || {}),
    transfer: { ...defaults.transfer, ...(product.paymentOptions?.transfer || {}) },
    cash: { ...defaults.cash, ...(product.paymentOptions?.cash || {}) },
    other: { ...defaults.other, ...(product.paymentOptions?.other || {}) },
  };
}

export function getProductDiscountPrice(product) {
  const basePrice = Number(product.price || 0);
  const discountPct = Number(product.discount || 0);
  if (discountPct <= 0) return basePrice;
  return Math.round(basePrice * (1 - discountPct / 100));
}

export function getPaymentPrice(product, method) {
  const productPrice = getProductDiscountPrice(product);
  const payment = getPaymentConfig(product)[method];
  const paymentDiscount = Number(payment.discountPct || 0);
  if (!payment.enabled || !payment.applyDiscount || paymentDiscount <= 0) {
    return productPrice;
  }
  return Math.round(productPrice * (1 - paymentDiscount / 100));
}
