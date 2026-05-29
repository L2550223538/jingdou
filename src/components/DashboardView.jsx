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
const DashboardView = ({
  data,
  actions,
  setActiveMenu,
  setSelectedCustomer,
}) => {
  const todayStr = getTodayStr();
  const currentMonthStr = todayStr.substring(0, 7);

  const stats = useMemo(() => {
    let monthOrderTotal = 0;
    data.orders.forEach((o) => {
      if (
        o.date &&
        o.date.startsWith(currentMonthStr) &&
        (o.type === "订单" || o.status === "已完结")
      ) {
        // Convert to roughly USD for display if needed, but we keep simple addition for now
        monthOrderTotal += parseFloat(o.amount.toString().replace(/[^0-9.-]/g, "")) || 0;
      }
    });

    return {
      todayTasks: data.customers.filter(
        (c) => c.nextFollowUp === todayStr && c.stage !== "已成交",
      ).length,
      overdue: data.customers.filter((c) => isOverdue(c.nextFollowUp, c.stage))
        .length,
      newLeads: data.customers.filter(
        (c) => c.createdAt && c.createdAt.startsWith(currentMonthStr),
      ).length,
      thisMonthOrders: monthOrderTotal,
    };
  }, [data, todayStr, currentMonthStr]);

  const actionTasks = data.customers.filter(
    (c) =>
      c.nextFollowUp === todayStr ||
      isOverdue(c.nextFollowUp, c.stage) ||
      isDormant(c, data.timeline),
  );

  return (
    <div className="p-6 max-w-7xl mx-auto h-full overflow-auto">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">工作台</h1>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm flex justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500 mb-1">今日待联系</p>
            <h3 className="text-3xl font-bold text-blue-600">
              {stats.todayTasks}
            </h3>
          </div>
          <div className="p-3 rounded-lg bg-blue-50">
            <Clock className="w-6 h-6 text-blue-600" />
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm flex justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500 mb-1">
              逾期/风险客户
            </p>
            <h3 className="text-3xl font-bold text-red-600">{stats.overdue}</h3>
          </div>
          <div className="p-3 rounded-lg bg-red-50">
            <AlertCircle className="w-6 h-6 text-red-600" />
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm flex justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500 mb-1">本月新增</p>
            <h3 className="text-3xl font-bold text-green-600">
              {stats.newLeads}
            </h3>
          </div>
          <div className="p-3 rounded-lg bg-green-50">
            <Users className="w-6 h-6 text-green-600" />
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm flex justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500 mb-1">
              本月成交估算
            </p>
            <h3 className="text-3xl font-bold text-purple-600">
              {stats.thisMonthOrders.toLocaleString()}
            </h3>
          </div>
          <div className="p-3 rounded-lg bg-purple-50">
            <CheckCircle2 className="w-6 h-6 text-purple-600" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-xl border shadow-sm flex flex-col">
          <div className="p-5 border-b flex justify-between items-center">
            <h3 className="font-bold flex items-center gap-2">
              <Bell className="w-4 h-4 text-orange-500" /> 待办与预警
            </h3>
          </div>
          <div className="divide-y overflow-y-auto max-h-[500px]">
            {actionTasks.length === 0 ? (
              <div className="p-8 text-center text-gray-500 text-sm">
                暂无任务，干得漂亮！🎉
              </div>
            ) : (
              actionTasks.map((c) => {
                const overdue = isOverdue(c.nextFollowUp, c.stage);
                const dormant = isDormant(c, data.timeline);
                return (
                  <div
                    key={c.id}
                    className="p-4 flex justify-between items-center hover:bg-gray-50 cursor-pointer"
                    onClick={() => setSelectedCustomer(c)}
                  >
                    <div>
                      <p className="font-bold text-sm flex items-center gap-2">
                        {c.name}
                        {dormant && (
                          <span className="bg-purple-100 text-purple-700 text-[10px] px-1.5 py-0.5 rounded border border-purple-200">
                            沉睡预警 Zzz
                          </span>
                        )}
                      </p>
                      <p className="text-xs text-gray-500 mt-1 flex items-center gap-2">
                        <StatusBadge stage={c.stage} />
                        上次跟进: {c.lastFollowUp}
                      </p>
                    </div>
                    {overdue ? (
                      <span className="text-xs text-red-600 bg-red-50 px-2 py-1 rounded-full border">
                        逾期风险
                      </span>
                    ) : (
                      <span className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded-full border">
                        今日跟进
                      </span>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
        <div className="bg-white rounded-xl border shadow-sm p-5 h-fit">
          <h3 className="font-bold mb-4">快捷入口</h3>
          <div className="space-y-3">
            <button
              onClick={() => actions.openAddCustomer()}
              className="w-full flex justify-center gap-2 py-3 bg-blue-600 text-white rounded-lg text-sm font-bold"
            >
              <Plus className="w-4 h-4" />
              录入客户
            </button>
            <button
              onClick={() => setActiveMenu("customers")}
              className="w-full flex justify-center gap-2 py-3 border text-gray-700 rounded-lg text-sm font-medium"
            >
              <Search className="w-4 h-4" />
              查找客户
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardView;
