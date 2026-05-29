import React from "react";

const StatusBadge = ({ stage }) => {
  const colors = {
    未联系: "bg-gray-100 text-gray-600",
    初步沟通: "bg-blue-100 text-blue-600",
    已报价: "bg-yellow-100 text-yellow-700",
    样品阶段: "bg-purple-100 text-purple-600",
    已成交: "bg-green-100 text-green-600",
    已流失: "bg-red-100 text-red-600",
  };
  return (
    <span
      className={`px-2.5 py-1 rounded-full text-xs font-medium ${colors[stage] || "bg-gray-100 text-gray-600"}`}
    >
      {stage}
    </span>
  );
};

export default StatusBadge;
