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

const QuotesOrdersView = ({ data, setSelectedCustomer, openAddQuote }) => (
  <div className="p-6 h-full flex flex-col max-w-7xl mx-auto">
    <div className="flex justify-between items-center mb-6">
      <h1 className="text-2xl font-bold text-gray-800">报价与订单</h1>
    </div>
    <div className="bg-white rounded-xl border shadow-sm flex-1 overflow-hidden flex flex-col">
      <div className="overflow-x-auto flex-1">
        <table className="w-full text-left border-collapse min-w-[800px]">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase">
                编号
              </th>
              <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase">
                类型
              </th>
              <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase">
                客户
              </th>
              <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase">
                金额
              </th>
              <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase">
                日期
              </th>
              <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase">
                状态
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {data.orders.map((order) => (
              <tr
                key={order.id}
                className="hover:bg-blue-50 cursor-pointer"
                onClick={() => openAddQuote(order)}
              >
                <td className="px-6 py-4 font-bold">{order.displayId}</td>
                <td className="px-6 py-4 text-sm">{order.type}</td>
                <td
                  className="px-6 py-4 text-sm text-blue-600 hover:underline"
                  onClick={(e) => {
                    e.stopPropagation();
                    const c = data.customers.find(
                      (x) => x.id === order.customerId,
                    );
                    if (c) setSelectedCustomer(c);
                  }}
                >
                  {order.customerName}
                </td>
                <td className="px-6 py-4 text-sm font-bold">
                  {order.currency} {order.amount}
                </td>
                <td className="px-6 py-4 text-sm">{order.date}</td>
                <td className="px-6 py-4">
                  <span
                    className={`px-2 py-1 rounded text-xs font-bold ${order.type === "订单" ? "bg-blue-100 text-blue-700" : "bg-yellow-100 text-yellow-700"}`}
                  >
                    {order.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  </div>
);

export default QuotesOrdersView;
