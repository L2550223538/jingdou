import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  LayoutDashboard,
  Users,
  Globe,
  Briefcase,
  BarChart2,
  Settings,
  Search,
  Bell,
  Plus,
  MessageCircle,
  Mail,
  Phone,
  ChevronLeft,
  CheckCircle2,
  AlertCircle,
  Clock,
  X,
  Save,
  Download,
  Upload,
  Trash2,
  Tag,
  List,
  Edit2,
} from "lucide-react";

const StatsView = ({ data }) => {
  const stages = ["未联系", "初步沟通", "已报价", "样品阶段", "已成交"];
  const funnelData = stages.map((stage) => ({
    stage,
    count: data.customers.filter((c) => c.stage === stage).length,
  }));
  const maxFunnelCount = Math.max(...funnelData.map((d) => d.count), 1);

  const levelCounts = {
    "A(核心)": data.customers.filter((c) => c.level === "A(核心)").length,
    "B(重点)": data.customers.filter((c) => c.level === "B(重点)").length,
    "C(普通)": data.customers.filter((c) => c.level === "C(普通)").length,
    "D(潜在)": data.customers.filter((c) => c.level === "D(潜在)").length,
  };

  const commStats = {
    WhatsApp: data.timeline.filter((t) => t.type === "whatsapp").length,
    邮件: data.timeline.filter((t) => t.type === "mail").length,
    "电话/视频": data.timeline.filter((t) => t.type === "phone").length,
    面谈: data.timeline.filter((t) => t.type === "meeting").length,
  };

  return (
    <div className="p-6 h-full overflow-y-auto max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">数据看板</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <h3 className="font-bold text-gray-800 mb-6 border-b border-gray-100 pb-3 flex items-center gap-2">
            <BarChart2 className="w-5 h-5 text-blue-600" /> 客户转化漏斗 (动态)
          </h3>
          <div className="space-y-4">
            {funnelData.map((item) => (
              <div key={item.stage} className="flex items-center gap-4">
                <span className="w-20 text-sm font-medium text-gray-600 text-right">
                  {item.stage}
                </span>
                <div className="flex-1 bg-gray-100 rounded-r-full h-8 flex items-center">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-blue-400 h-full rounded-r-full flex items-center px-4 text-xs text-white font-bold transition-all duration-1000 ease-out"
                    style={{
                      width: `${maxFunnelCount === 0 ? 0 : Math.max((item.count / maxFunnelCount) * 100, 8)}%`,
                    }}
                  >
                    {item.count > 0 ? item.count : ""}
                  </div>
                </div>
                <span className="w-8 text-sm font-black text-gray-700">
                  {item.count}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <h3 className="font-bold text-gray-800 mb-4 border-b border-gray-100 pb-3 flex items-center gap-2">
              <Users className="w-5 h-5 text-purple-600" /> 客户等级分布
            </h3>
            <div className="grid grid-cols-2 gap-4">
              {Object.entries(levelCounts).map(([level, count], idx) => (
                <div
                  key={level}
                  className={`p-4 rounded-lg border ${idx === 0 ? "bg-red-50 border-red-100" : idx === 1 ? "bg-orange-50 border-orange-100" : idx === 2 ? "bg-blue-50 border-blue-100" : "bg-gray-50 border-gray-200"}`}
                >
                  <div className="text-xs font-bold text-gray-500 mb-1">
                    {level}
                  </div>
                  <div
                    className={`text-2xl font-black ${idx === 0 ? "text-red-600" : idx === 1 ? "text-orange-600" : idx === 2 ? "text-blue-600" : "text-gray-600"}`}
                  >
                    {count}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <h3 className="font-bold text-gray-800 mb-4 border-b border-gray-100 pb-3 flex items-center gap-2">
              <MessageCircle className="w-5 h-5 text-green-600" />{" "}
              团队跟进动作统计
            </h3>
            <div className="flex justify-around items-end h-32 pt-4">
              {Object.entries(commStats).map(([type, count]) => (
                <div
                  key={type}
                  className="flex flex-col items-center gap-2 w-1/4"
                >
                  <span className="text-xs font-bold text-gray-500">
                    {count}次
                  </span>
                  <div className="w-12 bg-green-100 rounded-t-md relative overflow-hidden flex flex-col justify-end h-24">
                    <div
                      className="w-full bg-green-500 transition-all duration-1000 ease-out"
                      style={{
                        height: `${Math.max(...Object.values(commStats)) === 0 ? 0 : (count / Math.max(...Object.values(commStats))) * 100}%`,
                      }}
                    ></div>
                  </div>
                  <span className="text-xs font-medium text-gray-600">
                    {type}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatsView;
