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

import { getTodayStr, isOverdue, isDormant } from "../utils/helpers";
const CustomerListView = ({ data, actions, setSelectedCustomer }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState("list"); // 'list' or 'kanban'
  const [filterLevel, setFilterLevel] = useState("");
  const [filterStage, setFilterStage] = useState("");

  const filtered = data.customers.filter((c) => {
    const matchSearch =
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.country &&
        c.country.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (c.tags &&
        c.tags.some((t) =>
          t.toLowerCase().includes(searchQuery.toLowerCase()),
        ));
    const matchLevel = filterLevel ? c.level === filterLevel : true;
    const matchStage = filterStage ? c.stage === filterStage : true;
    return matchSearch && matchLevel && matchStage;
  });

  const renderTags = (tags) => {
    if (!tags || tags.length === 0) return null;
    return (
      <div className="flex gap-1 mt-1 flex-wrap">
        {tags.map((t) => (
          <span
            key={t}
            className="text-[10px] bg-blue-50 text-blue-600 border border-blue-100 px-1 rounded"
          >
            {t}
          </span>
        ))}
      </div>
    );
  };

  const renderList = () => (
    <div className="bg-white rounded-xl border shadow-sm flex-1 overflow-hidden flex flex-col">
      <div className="overflow-x-auto flex-1">
        <table className="w-full text-left border-collapse min-w-[800px]">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase">
                客户名称/标签
              </th>
              <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase">
                国家
              </th>
              <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase">
                等级
              </th>
              <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase">
                阶段
              </th>
              <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase">
                下次提醒
              </th>
              <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase text-right">
                操作
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.map((c) => (
              <tr key={c.id} className="hover:bg-blue-50">
                <td className="px-6 py-3">
                  <div
                    className="font-bold text-blue-600 flex items-center gap-2 cursor-pointer hover:underline"
                    onClick={() => setSelectedCustomer(c)}
                  >
                    {c.name}
                    {isDormant(c, data.timeline) && (
                      <span
                        className="bg-purple-500 w-2 h-2 rounded-full"
                        title="沉睡高优客户"
                      ></span>
                    )}
                  </div>
                  {renderTags(c.tags)}
                </td>
                <td className="px-6 py-3 text-sm">{c.country || "-"}</td>
                <td className="px-6 py-3 text-sm">
                  <select
                    value={c.level}
                    onChange={(e) =>
                      actions.updateCustomer(c.id, { level: e.target.value })
                    }
                    className="bg-transparent hover:bg-gray-100 border border-transparent hover:border-gray-300 rounded px-1 py-0.5 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                  >
                    <option value="A(核心)">A(核心)</option>
                    <option value="B(重点)">B(重点)</option>
                    <option value="C(普通)">C(普通)</option>
                    <option value="D(潜在)">D(潜在)</option>
                  </select>
                </td>
                <td className="px-6 py-3">
                  <select
                    value={c.stage}
                    onChange={(e) =>
                      actions.updateCustomer(c.id, { stage: e.target.value })
                    }
                    className="bg-transparent hover:bg-gray-100 border border-transparent hover:border-gray-300 rounded px-1 py-0.5 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors text-xs font-medium"
                  >
                    <option value="未联系">未联系</option>
                    <option value="初步沟通">初步沟通</option>
                    <option value="已报价">已报价</option>
                    <option value="样品阶段">样品阶段</option>
                    <option value="已成交">已成交</option>
                    <option value="已流失">已流失</option>
                  </select>
                </td>
                <td className="px-6 py-3 text-sm">
                  <input
                    type="date"
                    value={c.nextFollowUp || ""}
                    onChange={(e) =>
                      actions.updateCustomer(c.id, {
                        nextFollowUp: e.target.value,
                      })
                    }
                    className="bg-transparent hover:bg-gray-100 border border-transparent hover:border-gray-300 rounded px-1 py-0.5 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors text-xs"
                  />
                </td>
                <td className="px-6 py-3 text-right flex justify-end gap-1">
                  <button
                    onClick={() => actions.openEditCustomer(c)}
                    className="p-1 text-gray-400 hover:text-blue-600 rounded hover:bg-blue-50"
                    title="编辑客户"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      if (window.confirm("确定删除该客户及其所有相关数据？"))
                        actions.deleteCustomer(c.id);
                    }}
                    className="p-1 text-gray-400 hover:text-red-600 rounded hover:bg-red-50"
                    title="删除客户"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderKanban = () => {
    const stages = ["未联系", "初步沟通", "已报价", "样品阶段", "已成交"];
    return (
      <div className="flex-1 flex gap-4 overflow-x-auto pb-4">
        {stages.map((stage) => {
          const stageCustomers = filtered.filter((c) => c.stage === stage);
          return (
            <div
              key={stage}
              className="bg-gray-200/50 rounded-xl p-3 min-w-[280px] w-[280px] flex flex-col"
            >
              <div className="flex justify-between items-center mb-3 px-1">
                <h4 className="font-bold text-gray-700 text-sm">{stage}</h4>
                <span className="text-xs font-bold text-gray-500 bg-gray-200 px-2 py-0.5 rounded-full">
                  {stageCustomers.length}
                </span>
              </div>
              <div className="flex-1 overflow-y-auto space-y-3 pr-1">
                {stageCustomers.map((c) => (
                  <div
                    key={c.id}
                    onClick={() => setSelectedCustomer(c)}
                    className="bg-white p-3 rounded-lg shadow-sm border border-gray-200 hover:border-blue-300 cursor-pointer transition-colors"
                  >
                    <div className="font-bold text-sm text-gray-800 mb-1 truncate">
                      {c.name}
                    </div>
                    <div className="flex justify-between items-center text-xs text-gray-500 mb-2">
                      <span>{c.country || "未知国家"}</span>
                      <span className="font-medium text-gray-700">
                        {c.level}
                      </span>
                    </div>
                    {renderTags(c.tags)}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="p-6 h-full flex flex-col max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">我的客户</h1>
        <div className="flex gap-3">
          <div className="flex gap-2">
            <select
              value={filterLevel}
              onChange={(e) => setFilterLevel(e.target.value)}
              className="border rounded-lg text-sm px-2 py-2 bg-white text-gray-600 outline-none"
            >
              <option value="">全部等级</option>
              <option value="A(核心)">A(核心)</option>
              <option value="B(重点)">B(重点)</option>
              <option value="C(普通)">C(普通)</option>
              <option value="D(潜在)">D(潜在)</option>
            </select>
            <select
              value={filterStage}
              onChange={(e) => setFilterStage(e.target.value)}
              className="border rounded-lg text-sm px-2 py-2 bg-white text-gray-600 outline-none"
            >
              <option value="">全部阶段</option>
              <option value="未联系">未联系</option>
              <option value="初步沟通">初步沟通</option>
              <option value="已报价">已报价</option>
              <option value="样品阶段">样品阶段</option>
              <option value="已成交">已成交</option>
              <option value="已流失">已流失</option>
            </select>
          </div>
          <div className="flex bg-white border rounded-lg p-1">
            <button
              onClick={() => setViewMode("list")}
              className={`p-1.5 rounded ${viewMode === "list" ? "bg-blue-100 text-blue-600" : "text-gray-400 hover:text-gray-600"}`}
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode("kanban")}
              className={`p-1.5 rounded ${viewMode === "kanban" ? "bg-blue-100 text-blue-600" : "text-gray-400 hover:text-gray-600"}`}
            >
              <LayoutDashboard className="w-4 h-4" />
            </button>
          </div>
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="搜索客户名/标签..."
              className="pl-9 pr-4 py-2 border rounded-lg text-sm w-64"
            />
          </div>
          <button
            onClick={() => actions.openAddCustomer()}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold"
          >
            <Plus className="w-4 h-4" /> 新建
          </button>
        </div>
      </div>
      {viewMode === "list" ? renderList() : renderKanban()}
    </div>
  );
};

export default CustomerListView;
