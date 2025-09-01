// Format price in Nepali Rupees
export const formatNRS = (amount) => {
  return `Rs. ${amount.toLocaleString("en-IN")}`;
};

// Get prices in Nepali Rupees
export const getPrices = (nrsPrice, discount = 0) => {
  const discountedNRS =
    discount > 0 ? nrsPrice - (nrsPrice * discount) / 100 : nrsPrice;

  return {
    nrs: formatNRS(discountedNRS),
    originalNRS: discount > 0 ? formatNRS(nrsPrice) : null,
    discountedAmount: discountedNRS,
    originalAmount: nrsPrice,
  };
};
