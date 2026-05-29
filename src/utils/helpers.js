export const generateId = () => Math.random().toString(36).substr(2, 9);

export const getTodayStr = () => {
  const tzOffset = new Date().getTimezoneOffset() * 60000;
  return new Date(Date.now() - tzOffset).toISOString().split("T")[0];
};

export const isOverdue = (nextFollowUp, stage) => {
  if (!nextFollowUp || stage === "已成交" || stage === "已流失") return false;
  return nextFollowUp < getTodayStr();
};

export const isDormant = (customer, timeline) => {
  if (customer.stage === "已成交" || customer.stage === "已流失") return false;
  if (customer.level !== "A(核心)" && customer.level !== "B(重点)")
    return false;

  const custTimeline = timeline.filter((t) => t.customerId === customer.id);
  if (custTimeline.length === 0) return true; // No interactions

  const lastDate = new Date(custTimeline[0].date).getTime(); // Assuming sorted desc
  const daysSince = (Date.now() - lastDate) / (1000 * 3600 * 24);
  return daysSince > 14;
};
