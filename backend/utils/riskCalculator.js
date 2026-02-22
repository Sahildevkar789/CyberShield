module.exports.calculateOverallRisk = (
  websiteScans,
  portScans,
  passwordScans,
  phishingScans
) => {
  let score = 0;

  websiteScans.forEach(scan => {
    if (scan.risk_level === "High") score += 30;
    else if (scan.risk_level === "Medium") score += 15;
  });

  portScans.forEach(scan => {
    if (scan.risk_level === "High") score += 25;
    else if (scan.risk_level === "Medium") score += 10;
  });

  passwordScans.forEach(scan => {
    if (scan.strength === "Weak") score += 20;
  });

  phishingScans.forEach(scan => {
    if (scan.prediction === "Phishing")
      score += Math.round(scan.confidence * 30);
  });

  if (score > 100) score = 100;

  return score;
};
