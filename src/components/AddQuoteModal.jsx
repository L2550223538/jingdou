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
const AddQuoteModal = ({
  isOpen,
  onClose,
  onSave,
  editingQuote,
  customerId,
  customerName,
  CURRENCIES,
}) => {
  if (!isOpen) return null;
  const todayStr = getTodayStr();

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    onSave({
      id: editingQuote?.id,
      customerId: editingQuote ? editingQuote.customerId : customerId,
      customerName: editingQuote ? editingQuote.customerName : customerName,
      type: formData.get("type"),
      currency: formData.get("currency"),
      amount: formData.get("amount"),
      date: formData.get("date"),
      status: formData.get("status"),
      product: formData.get("product"),
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
          <h3 className="font-bold text-lg text-gray-800">
            {editingQuote ? "编辑单据" : "录入单据"}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm mb-1">类型</label>
              <select
                name="type"
                defaultValue={editingQuote?.type || "报价单"}
                className="w-full border rounded-lg px-3 py-2 text-sm bg-white"
              >
                <option>报价单</option>
                <option>样品单</option>
                <option>订单</option>
              </select>
            </div>
            <div>
              <label className="block text-sm mb-1">状态</label>
              <select
                name="status"
                defaultValue={editingQuote?.status || "待客户确认"}
                className="w-full border rounded-lg px-3 py-2 text-sm bg-white"
              >
                <option>待客户确认</option>
                <option>已确认</option>
                <option>生产中</option>
                <option>已发货</option>
                <option>已完结</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm mb-1">关联产品/备注</label>
            <input
              name="product"
              defaultValue={editingQuote?.product || ""}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white shadow-sm"
            />
          </div>

          <div className="flex gap-2">
            <div className="w-1/3">
              <label className="block text-sm mb-1">币种</label>
              <select
                name="currency"
                defaultValue={editingQuote?.currency || "USD"}
                className="w-full border rounded-lg px-3 py-2 text-sm bg-white"
              >
                {CURRENCIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex-1">
              <label className="block text-sm mb-1">金额</label>
              <input
                required
                name="amount"
                defaultValue={editingQuote?.amount || ""}
                type="number"
                step="0.01"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white shadow-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm mb-1">日期</label>
            <input
              required
              name="date"
              type="date"
              defaultValue={editingQuote?.date || todayStr}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white shadow-sm"
            />
          </div>
          <div className="pt-4 flex gap-3 justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border rounded-lg text-sm"
            >
              取消
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm"
            >
              保存
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ==========================================
// VIEWS
// ==========================================

export default AddQuoteModal;
