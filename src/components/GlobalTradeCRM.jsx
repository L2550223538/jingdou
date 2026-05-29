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

import Toast from "./Toast";
import SettingsView from "./SettingsView";
import CustomerDetailView from "./CustomerDetailView";
import StatsView from "./StatsView";
import QuotesOrdersView from "./QuotesOrdersView";
import CustomerListView from "./CustomerListView";
import DashboardView from "./DashboardView";
import AddQuoteModal from "./AddQuoteModal";
import AddContactModal from "./AddContactModal";
import AddCustomerModal from "./AddCustomerModal";
import { useCRMData } from "../hooks/useCRMData";

const ALL_TAGS = ["VIP", "重点跟进", "展会客户", "高风险", "需打样"];
const CURRENCIES = ["USD", "EUR", "CNY", "GBP"];
const GlobalTradeCRM = () => {
  const { data, ...dataActions } = useCRMData();
  const [activeMenu, setActiveMenu] = useState("dashboard");
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [toast, setToast] = useState(null);

  // Modal states
  const [isAddCustOpen, setAddCustOpen] = useState(false);
  const [contactModalArgs, setContactModalArgs] = useState(null); // null means closed
  const [quoteModalArgs, setQuoteModalArgs] = useState(null);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const [editingCustomer, setEditingCustomer] = useState(null);
  const actions = {
    ...dataActions,
    showToast,
    openAddCustomer: () => {
      setEditingCustomer(null);
      setAddCustOpen(true);
    },
    openEditCustomer: (c) => {
      setEditingCustomer(c);
      setAddCustOpen(true);
    },
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Toast toast={toast} />

      <AddCustomerModal
        isOpen={isAddCustOpen}
        onClose={() => setAddCustOpen(false)}
        ALL_TAGS={ALL_TAGS}
        editingCustomer={editingCustomer}
        onSave={(c) => {
          if (c.id) {
            actions.updateCustomer(c.id, c);
            showToast("客户资料已更新");
          } else {
            actions.addCustomer(c);
            showToast("客户录入成功");
          }
          setAddCustOpen(false);
        }}
      />
      <AddContactModal
        isOpen={!!contactModalArgs}
        onClose={() => setContactModalArgs(null)}
        customerId={contactModalArgs}
        onSave={(c) => {
          actions.addContact(c);
          setContactModalArgs(null);
          showToast("联系人已保存");
        }}
      />
      <AddQuoteModal
        isOpen={!!quoteModalArgs}
        onClose={() => setQuoteModalArgs(null)}
        CURRENCIES={CURRENCIES}
        editingQuote={quoteModalArgs?.quote}
        customerId={quoteModalArgs?.customer?.id}
        customerName={quoteModalArgs?.customer?.name}
        onSave={(q) => {
          if (q.id) {
            actions.updateOrder(q.id, q);
          } else {
            actions.addOrder({ ...q });
          }

          // Sync to timeline
          actions.addTimeline({
            customerId: q.customerId,
            type: "system",
            date: new Date().toISOString(),
            title: q.id
              ? `修改${q.type}: ${q.displayId}`
              : `录入${q.type}: ${q.displayId}`,
            content: `总金额: ${q.currency} ${q.amount} ${q.hasExtraFee ? "(含附加费: " + q.extraFee + ")" : ""}
状态: ${q.status}
关联产品: ${q.products || "无"}
${q.notes ? "备注: " + q.notes : ""}`,
            attachments: q.attachments || [],
            user: "Admin",
          });

          actions.updateCustomer(q.customerId, {
            stage:
              q.type === "报价单"
                ? "已报价"
                : q.type === "订单"
                  ? "已成交"
                  : "样品阶段",
          });

          // If viewing this customer, update local ref
          setSelectedCustomer((prev) =>
            prev && prev.id === q.customerId
              ? {
                  ...prev,
                  stage:
                    q.type === "报价单"
                      ? "已报价"
                      : q.type === "订单"
                        ? "已成交"
                        : "样品阶段",
                }
              : prev,
          );

          setQuoteModalArgs(null);
          showToast("单据已保存并同步至跟进动态");
        }}
      />

      <div className="w-64 bg-white border-r flex flex-col shrink-0 z-20 shadow-sm">
        <div className="p-5 flex items-center gap-3 border-b">
          <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center">
            <Globe className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-xl">GlobalTrade</span>
        </div>
        <div className="flex-1 py-4 space-y-1 px-3">
          {[
            { id: "dashboard", label: "工作台", icon: LayoutDashboard },
            { id: "customers", label: "我的客户", icon: Users },
            { id: "quotes", label: "报价与订单", icon: Briefcase },
            { id: "stats", label: "数据看板", icon: BarChart2 },
            { id: "settings", label: "系统设置", icon: Settings },
          ].map((item) => (
            <div
              key={item.id}
              onClick={() => {
                setActiveMenu(item.id);
                setSelectedCustomer(null);
              }}
              className={`flex items-center px-4 py-3 cursor-pointer rounded-lg transition-colors ${activeMenu === item.id && !selectedCustomer ? "bg-blue-50 text-blue-600 font-bold" : "text-gray-600 hover:bg-gray-100"}`}
            >
              <item.icon className="w-5 h-5 mr-3" />{" "}
              <span className="text-sm">{item.label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="flex-1 flex flex-col overflow-hidden relative">
        <header className="bg-white h-16 border-b flex items-center justify-end px-6 shrink-0 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center font-bold text-sm">
              A
            </div>
            <span className="text-sm font-bold">Admin</span>
          </div>
        </header>
        <main className="flex-1 overflow-hidden relative">
          {selectedCustomer ? (
            <CustomerDetailView
              customer={
                data.customers.find((c) => c.id === selectedCustomer.id) ||
                selectedCustomer
              }
              data={data}
              actions={{
                ...actions,
                updateCustomer: (id, updates) => {
                  actions.updateCustomer(id, updates);
                  setSelectedCustomer((prev) =>
                    prev.id === id ? { ...prev, ...updates } : prev,
                  );
                },
              }}
              onBack={() => setSelectedCustomer(null)}
              openAddQuote={(q, c) =>
                setQuoteModalArgs({ quote: q, customer: c })
              }
              openAddContact={(id) => setContactModalArgs(id)}
            />
          ) : activeMenu === "dashboard" ? (
            <DashboardView
              data={data}
              actions={actions}
              setActiveMenu={setActiveMenu}
              setSelectedCustomer={setSelectedCustomer}
            />
          ) : activeMenu === "customers" ? (
            <CustomerListView
              data={data}
              actions={actions}
              setSelectedCustomer={setSelectedCustomer}
            />
          ) : activeMenu === "quotes" ? (
            <QuotesOrdersView
              data={data}
              setSelectedCustomer={setSelectedCustomer}
              openAddQuote={(q) => setQuoteModalArgs({ quote: q })}
            />
          ) : activeMenu === "stats" ? (
            <StatsView data={data} />
          ) : activeMenu === "settings" ? (
            <SettingsView data={data} actions={actions} />
          ) : null}
        </main>
      </div>
    </div>
  );
};
export default GlobalTradeCRM;
