import StatusBadge from "./StatusBadge";

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
const CustomerDetailView = ({
  customer,
  data,
  actions,
  onBack,
  openAddQuote,
  openAddContact,
}) => {
  const cTimeline = data.timeline.filter((t) => t.customerId === customer.id);
  const cContacts = data.contacts.filter((c) => c.customerId === customer.id);
  const dormant = isDormant(customer, data.timeline);

  const handleSubmitTimeline = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    if (!formData.get("content").trim()) return;
    // Update local selected customer ref to trigger re-renders

    actions.addTimeline({
      customerId: customer.id,
      type: formData.get("type"),
      date: new Date().toISOString(),
      title: "日常跟进",
      content: formData.get("content"),
      user: "Admin",
    });
    actions.updateCustomer(customer.id, {
      lastFollowUp: getTodayStr(),
      nextFollowUp: formData.get("nextFollowUp") || customer.nextFollowUp,
      stage: formData.get("stage") || customer.stage,
    });
    e.target.reset();
    actions.showToast("跟进发布成功");
  };

  return (
    <div className="h-full flex flex-col bg-gray-50">
      <div className="bg-white px-6 py-4 border-b flex justify-between shrink-0 shadow-sm z-10">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-lg">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-xl font-bold flex items-center gap-2">
              {customer.name}
              {customer.country && (
                <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded text-xs font-normal">
                  {customer.country}
                </span>
              )}
              {dormant && (
                <span className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded text-xs font-bold border border-purple-200">
                  沉睡高优客户
                </span>
              )}
            </h2>
            <div className="flex gap-4 mt-1 text-sm text-gray-500">
              <StatusBadge stage={customer.stage} />{" "}
              <span>等级: {customer.level}</span>
            </div>
          </div>
        </div>
        <button
          onClick={() => openAddQuote(null, customer)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium flex gap-2"
        >
          <Plus className="w-4 h-4" /> 录入单据
        </button>
      </div>
      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="space-y-6">
            <div className="bg-white rounded-xl border p-5 shadow-sm relative group">
              <h3 className="font-bold mb-4 flex justify-between items-center">
                基础信息
                <button
                  onClick={() => actions.openEditCustomer(customer)}
                  className="text-blue-600 hover:bg-blue-50 p-1 rounded text-xs flex items-center gap-1 font-normal transition-colors border border-transparent hover:border-blue-200"
                >
                  编辑资料
                </button>
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">官网</span>
                  <span
                    className="text-blue-600 hover:underline cursor-pointer truncate max-w-[150px]"
                    title={customer.website}
                  >
                    {customer.website || "-"}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">来源</span>
                  <span className="font-medium text-gray-800">
                    {customer.source || "-"}
                  </span>
                </div>

                <div className="pt-1">
                  <span className="text-gray-500 block mb-1.5">标签</span>
                  <div className="flex flex-wrap gap-1.5">
                    {customer.tags?.length ? (
                      customer.tags.map((t) => (
                        <span
                          key={t}
                          className="text-xs font-medium bg-gray-100 text-gray-700 px-2 py-0.5 rounded border border-gray-200"
                        >
                          {t}
                        </span>
                      ))
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </div>
                </div>

                <div className="pt-1">
                  <span className="text-gray-500 block mb-1.5">社媒</span>
                  <div className="space-y-1.5">
                    {customer.socialMedia?.length ? (
                      customer.socialMedia.map((s, i) => (
                        <div
                          key={i}
                          className="font-medium text-gray-800 flex justify-between items-center"
                        >
                          <span className="text-[10px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded border border-gray-200">
                            {s.platform}
                          </span>{" "}
                          <span
                            className="truncate max-w-[150px]"
                            title={s.account}
                          >
                            {s.account}
                          </span>
                        </div>
                      ))
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl border p-5 shadow-sm">
              <h3 className="font-bold mb-4 flex justify-between">
                联系人{" "}
                <button
                  onClick={() => openAddContact(customer.id)}
                  className="text-blue-600 hover:bg-blue-50 p-1 rounded"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </h3>
              <div className="space-y-3">
                {cContacts.length === 0 ? (
                  <div className="text-sm text-gray-500 text-center py-4 border border-dashed border-gray-200 rounded-lg">
                    暂无联系人
                  </div>
                ) : (
                  cContacts.map((c) => (
                    <div
                      key={c.id}
                      className="p-3 bg-gray-50 hover:bg-gray-100 transition-colors rounded-lg border border-gray-100 text-sm"
                    >
                      <div className="flex justify-between items-start mb-1.5">
                        <div className="font-bold text-gray-800 flex items-center gap-1.5">
                          {c.name}
                          {c.isPrimary && (
                            <span className="text-[10px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded font-medium border border-green-200">
                              首要
                            </span>
                          )}
                        </div>
                        <button
                          onClick={() => {
                            if (window.confirm("确定删除联系人?"))
                              actions.deleteContact(c.id);
                          }}
                          className="text-gray-400 hover:text-red-600 p-0.5 rounded hover:bg-red-50 transition-colors"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <div className="text-xs text-gray-500 mb-1">
                        {c.title || "-"}
                      </div>
                      <div className="text-xs text-gray-600 space-y-0.5">
                        <div className="flex items-center gap-1.5">
                          <Mail className="w-3 h-3 text-gray-400" />{" "}
                          {c.email || "-"}
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Phone className="w-3 h-3 text-gray-400" />{" "}
                          {c.phone || "-"}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-xl border p-5 shadow-sm">
              <form onSubmit={handleSubmitTimeline}>
                <textarea
                  name="content"
                  required
                  className="w-full border border-gray-300 rounded-lg p-3 text-sm min-h-[100px] focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
                  placeholder="记录沟通细节..."
                ></textarea>
                <div className="flex justify-between items-center mt-2 flex-wrap gap-2">
                  <div className="flex gap-2">
                    <select
                      name="type"
                      className="text-sm border border-gray-300 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    >
                      <option value="whatsapp">WhatsApp</option>
                      <option value="mail">邮件</option>
                      <option value="meeting">面谈</option>
                    </select>
                    <select
                      name="stage"
                      defaultValue={customer.stage}
                      className="text-sm border border-gray-300 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    >
                      <option value="初步沟通">初步沟通</option>
                      <option value="已报价">已报价</option>
                      <option value="已成交">已成交</option>
                    </select>
                    <input
                      name="nextFollowUp"
                      type="date"
                      defaultValue={customer.nextFollowUp || ""}
                      className="text-sm border border-gray-300 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    />
                  </div>
                  <button
                    type="submit"
                    className="px-4 py-1.5 bg-blue-600 text-white rounded text-sm font-bold"
                  >
                    发布跟进
                  </button>
                </div>
              </form>
            </div>
            <div className="bg-white rounded-xl border p-5 shadow-sm">
              <h3 className="font-bold mb-4">时间轴</h3>
              <div className="space-y-4 border-l-2 border-gray-100 ml-2 pl-4">
                {cTimeline.map((t) => (
                  <div key={t.id} className="relative">
                    <div
                      className={`absolute w-3 h-3 rounded-full -left-[23px] top-1 ${t.type === "system" ? "bg-purple-500" : "bg-blue-500"}`}
                    ></div>
                    <div
                      className={`p-3 rounded border text-sm ${t.type === "system" ? "bg-purple-50 border-purple-100" : "bg-gray-50"}`}
                    >
                      <div className="flex justify-between text-xs text-gray-400 mb-1 font-bold">
                        <span
                          className={
                            t.type === "system"
                              ? "text-purple-600"
                              : "text-blue-600"
                          }
                        >
                          {t.title || t.type}
                        </span>
                        <div className="flex items-center gap-2">
                          <span>{new Date(t.date).toLocaleString()}</span>
                          <button
                            onClick={() => {
                              if (window.confirm("确定删除该记录?"))
                                actions.deleteTimeline(t.id);
                            }}
                            className="hover:text-red-600"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                      <p className="text-gray-800 whitespace-pre-wrap">
                        {t.content}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerDetailView;
