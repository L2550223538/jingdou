import StatusBadge from "./StatusBadge";
import React, { useState } from "react";
import {
  ChevronLeft,
  Plus,
  Mail,
  Phone,
  X,
  Briefcase,
  Users,
  MessageCircle,
  Copy,
  ExternalLink,
  ShoppingCart,
  Settings as SettingsIcon,
  Paperclip,
  FileText,
  Upload,
  Trash2
} from "lucide-react";
import { getTodayStr, isDormant } from "../utils/helpers";

const DICTIONARY = {
  platforms: [
    { value: "whatsapp", label: "💬 WhatsApp" },
    { value: "mail", label: "📧 邮件" },
    { value: "phone", label: "📞 电话" },
    { value: "meeting", label: "🤝 面谈" },
  ],
  stages: ["未联系", "初步沟通", "已报价", "样品阶段", "已成交", "已流失"],
};

const CustomerDetailView = ({
  customer,
  data,
  actions,
  onBack,
  openAddQuote,
  openAddContact,
}) => {
  const [activeTab, setActiveTab] = useState("全部动态");
  const [attachments, setAttachments] = useState([]);

  const cTimeline = data.timeline.filter((t) => t.customerId === customer.id);
  const cContacts = data.contacts.filter((c) => c.customerId === customer.id);
  const dormant = isDormant(customer, data.timeline);

  const getTimelineTitle = (type) => {
    if (type === "whatsapp") return "WhatsApp 沟通";
    if (type === "mail") return "邮件沟通";
    if (type === "phone") return "电话沟通";
    if (type === "meeting") return "面谈沟通";
    if (type === "system") return "系统记录";
    return "日常跟进";
  };

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    actions.showToast("已复制到剪贴板");
  };

  const handleMockUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const newAttachment = {
      id: Math.random().toString(36).substr(2, 9),
      name: file.name,
      size: (file.size / 1024).toFixed(1) + " KB",
      type: file.type || "unknown",
      url: URL.createObjectURL(file) // Mock URL for preview
    };
    setAttachments((prev) => [...prev, newAttachment]);
    e.target.value = "";
  };

  const removeAttachment = (id) => {
    setAttachments((prev) => prev.filter((a) => a.id !== id));
  };

  const handleSubmitTimeline = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    if (!formData.get("content").trim() && attachments.length === 0) return;

    actions.addTimeline({
      customerId: customer.id,
      type: formData.get("type"),
      date: new Date().toISOString(),
      title: getTimelineTitle(formData.get("type")),
      content: formData.get("content"),
      attachments: attachments,
      user: "Admin",
    });

    actions.updateCustomer(customer.id, {
      lastFollowUp: getTodayStr(),
      nextFollowUp: formData.get("nextFollowUp") || customer.nextFollowUp,
      stage: formData.get("stage") || customer.stage,
    });

    e.target.reset();
    setAttachments([]);
    actions.showToast("跟进发布成功");
  };

  // Filter timeline based on active tab
  const filteredTimeline = cTimeline.filter((t) => {
    if (activeTab === "全部动态") return true;
    if (activeTab === "跟进记录") return t.type !== "system";
    if (activeTab === "交易单据") return t.type === "system" && t.title.includes("单"); // 录入订单, 录入报价单
    if (activeTab === "附件档案库") return t.attachments && t.attachments.length > 0;
    return true;
  });

  // Render Document Links in text
  const renderContentWithLinks = (content) => {
    const docRegex = /(QUO|SMP|ORD)-\d{8}-\d{4}/g;
    if (!content || typeof content !== "string") return content;

    const parts = content.split(docRegex);
    const matches = content.match(docRegex) || [];

    if (matches.length === 0) return content;

    return (
      <>
        {parts.map((part, i) => {
           if (matches.includes(part)) {
              return (
                 <span
                    key={i}
                    className="text-blue-600 hover:underline cursor-pointer font-medium"
                    onClick={() => {
                        const order = data.orders.find(o => o.displayId === part);
                        if (order) openAddQuote(order, customer);
                        else actions.showToast("未找到该单据详情", "error");
                    }}
                 >
                    {part}
                 </span>
              )
           }
           return <span key={i}>{part}</span>;
        })}
      </>
    );
  };

  const getTimelineIconAndColor = (type, title) => {
     if (type === 'system') {
        if (title && title.includes('订单')) return { icon: ShoppingCart, colorClass: 'bg-green-500', bgClass: 'bg-green-50 border-green-100', textClass: 'text-green-700' };
        if (title && (title.includes('报价') || title.includes('样品'))) return { icon: Briefcase, colorClass: 'bg-purple-500', bgClass: 'bg-purple-50 border-purple-100', textClass: 'text-purple-700' };
        return { icon: SettingsIcon, colorClass: 'bg-gray-400', bgClass: 'bg-gray-50 border-gray-200', textClass: 'text-gray-600' };
     }
     return { icon: MessageCircle, colorClass: 'bg-blue-500', bgClass: 'bg-white border-gray-200', textClass: 'text-blue-600' };
  };

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Detail Header */}
      <div className="bg-white px-6 py-4 border-b border-gray-200 flex justify-between shrink-0 shadow-sm z-10">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              {customer.name}
              {customer.country && (
                <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded text-xs font-normal border border-gray-200">
                  {customer.country}
                </span>
              )}
              {dormant && (
                 <span className="bg-red-100 text-red-600 px-2 py-0.5 rounded text-xs font-bold border border-red-200 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> 沉睡预警
                 </span>
              )}
            </h2>
            <div className="flex gap-4 mt-1.5 text-sm text-gray-500 items-center">
              <StatusBadge stage={customer.stage} />
              <span className="bg-blue-50 text-blue-700 border border-blue-100 px-2 rounded-full text-xs font-medium">等级: {customer.level}</span>
              <span className="text-xs">负责人: {customer.owner}</span>
            </div>
          </div>
        </div>
        <div className="flex gap-2 items-center">
          <button
            onClick={() => openAddQuote(null, customer)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium flex items-center gap-2 shadow-sm transition-colors"
          >
            <Plus className="w-4 h-4" /> 录入单据
          </button>
        </div>
      </div>

      {/* Detail Body */}
      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Left Column: Info & Contacts */}
          <div className="space-y-6">

            {/* Info Card */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
              <h3 className="font-bold text-gray-800 mb-4 flex justify-between items-center border-b border-gray-100 pb-3">
                基础信息
                <button
                  onClick={() => actions.openEditCustomer(customer)}
                  className="text-blue-600 hover:bg-blue-50 p-1.5 rounded-md text-xs flex items-center gap-1 font-medium transition-colors"
                >
                  <Edit2 className="w-3.5 h-3.5" /> 编辑资料
                </button>
              </h3>
              <div className="space-y-4 text-sm">
                <div className="flex justify-between items-center group">
                   <span className="text-gray-500">官网</span>
                   <div className="flex items-center gap-1">
                      {customer.website ? (
                        <>
                           <a href={customer.website.startsWith('http') ? customer.website : `https://${customer.website}`} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline truncate max-w-[150px]" title={customer.website}>{customer.website}</a>
                           <ExternalLink className="w-3 h-3 text-gray-400 group-hover:text-blue-500 cursor-pointer" />
                        </>
                      ) : <span className="text-gray-400">-</span>}
                   </div>
                </div>
                <div className="flex justify-between items-center">
                   <span className="text-gray-500">来源</span>
                   <span className="font-medium text-gray-800 bg-gray-50 px-2 py-0.5 rounded border border-gray-200">{customer.source || "-"}</span>
                </div>

                <div>
                  <span className="text-gray-500 block mb-2">标签</span>
                  <div className="flex flex-wrap gap-1.5">
                    {customer.tags?.length ? (
                      customer.tags.map((t) => (
                        <span
                          key={t}
                          className="text-xs font-medium bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full border border-blue-100"
                        >
                          {t}
                        </span>
                      ))
                    ) : (
                      <span className="text-gray-400 text-xs">-</span>
                    )}
                  </div>
                </div>

                <div>
                  <span className="text-gray-500 block mb-2">社媒账号</span>
                  <div className="space-y-2">
                    {customer.socialMedia?.length ? (
                      customer.socialMedia.map((s, i) => (
                        <div key={i} className="font-medium text-gray-800 flex justify-between items-center group">
                          <span className="text-xs bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded border border-gray-200 w-16 text-center">
                            {s.platform}
                          </span>
                          <div className="flex items-center gap-1.5">
                             <span className="truncate max-w-[120px]" title={s.account}>{s.account}</span>
                             <button onClick={() => handleCopy(s.account)} className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-blue-600 transition-all" title="复制">
                                <Copy className="w-3 h-3" />
                             </button>
                             {s.platform.toLowerCase() === 'whatsapp' && (
                                <a href={`https://wa.me/${s.account.replace(/[^0-9]/g, '')}`} target="_blank" rel="noreferrer" className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-green-500 transition-all" title="WhatsApp 网页版">
                                  <MessageCircle className="w-3 h-3" />
                                </a>
                             )}
                          </div>
                        </div>
                      ))
                    ) : (
                      <span className="text-gray-400 text-xs">-</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Contacts Card */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
              <h3 className="font-bold text-gray-800 mb-4 flex justify-between items-center border-b border-gray-100 pb-3">
                联系人
                <button
                  onClick={() => openAddContact(customer.id)}
                  className="text-blue-600 hover:bg-blue-50 p-1.5 rounded-md transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </h3>
              <div className="space-y-3">
                {cContacts.length === 0 ? (
                  <div className="text-sm text-gray-500 text-center py-6 border border-dashed border-gray-200 rounded-lg bg-gray-50">
                    暂无联系人
                  </div>
                ) : (
                  cContacts.map((c) => (
                    <div
                      key={c.id}
                      className="p-3 bg-white hover:bg-blue-50/30 transition-colors rounded-lg border border-gray-200 text-sm shadow-sm group"
                    >
                      <div className="flex justify-between items-start mb-1.5">
                        <div className="font-bold text-gray-800 flex items-center gap-1.5">
                          {c.name}
                          {c.isPrimary && (
                            <span className="text-[10px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded font-bold border border-green-200">
                              首要
                            </span>
                          )}
                        </div>
                        <button
                          onClick={() => {
                            if (window.confirm("确定删除联系人?"))
                              actions.deleteContact(c.id);
                          }}
                          className="text-gray-400 hover:text-red-600 p-1 rounded hover:bg-red-50 transition-colors opacity-0 group-hover:opacity-100"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <div className="text-xs text-gray-500 mb-2 font-medium">{c.title || "-"}</div>
                      <div className="text-xs text-gray-600 space-y-1.5">
                        <div className="flex items-center gap-1.5 group/item">
                          <Mail className="w-3.5 h-3.5 text-gray-400" />
                          <span className="flex-1 truncate" title={c.email}>{c.email || "-"}</span>
                          {c.email && (
                            <>
                              <button onClick={() => handleCopy(c.email)} className="opacity-0 group-hover/item:opacity-100 text-gray-400 hover:text-blue-600 transition-all"><Copy className="w-3 h-3"/></button>
                              <a href={`mailto:${c.email}`} className="opacity-0 group-hover/item:opacity-100 text-gray-400 hover:text-blue-600 transition-all"><ExternalLink className="w-3 h-3"/></a>
                            </>
                          )}
                        </div>
                        <div className="flex items-center gap-1.5 group/item">
                          <Phone className="w-3.5 h-3.5 text-gray-400" />
                          <span className="flex-1 truncate" title={c.phone}>{c.phone || "-"}</span>
                          {c.phone && (
                            <>
                              <button onClick={() => handleCopy(c.phone)} className="opacity-0 group-hover/item:opacity-100 text-gray-400 hover:text-blue-600 transition-all"><Copy className="w-3 h-3"/></button>
                              <a href={`tel:${c.phone}`} className="opacity-0 group-hover/item:opacity-100 text-gray-400 hover:text-blue-600 transition-all"><ExternalLink className="w-3 h-3"/></a>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Timeline & Interactions */}
          <div className="lg:col-span-2 space-y-6 flex flex-col h-full">

            {/* Add Record Box */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 shrink-0">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center font-bold text-sm">A</div>
                <span className="font-bold text-gray-800 text-sm">发布跟进动态</span>
              </div>
              <form onSubmit={handleSubmitTimeline}>
                <textarea
                  name="content"
                  className="w-full border border-gray-300 rounded-lg p-3 text-sm min-h-[100px] focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm transition-all"
                  placeholder="记录沟通细节..."
                ></textarea>

                {/* Upload Area inside input */}
                <div className="mt-3">
                   <div className="flex flex-wrap gap-2 mb-2">
                     {attachments.map((file) => (
                        <div key={file.id} className="flex items-center gap-1.5 bg-gray-100 border border-gray-200 px-2 py-1 rounded-md text-xs group">
                           <Paperclip className="w-3 h-3 text-gray-500" />
                           <span className="max-w-[100px] truncate text-gray-700 font-medium" title={file.name}>{file.name}</span>
                           <button type="button" onClick={() => removeAttachment(file.id)} className="text-gray-400 hover:text-red-500 ml-1"><X className="w-3 h-3"/></button>
                        </div>
                     ))}
                   </div>
                </div>

                <div className="flex justify-between items-center mt-3 pt-3 border-t border-gray-100 flex-wrap gap-3">
                  <div className="flex gap-2 items-center">
                    <select
                      name="type"
                      className="text-sm border border-gray-300 rounded-md px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white shadow-sm font-medium text-gray-700"
                    >
                      {DICTIONARY.platforms.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
                    </select>
                    <select
                      name="stage"
                      defaultValue={customer.stage}
                      className="text-sm border border-gray-300 rounded-md px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white shadow-sm font-medium text-gray-700"
                    >
                      {DICTIONARY.stages.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>

                    <div className="relative cursor-pointer ml-2">
                       <input
                         type="file"
                         className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                         onChange={handleMockUpload}
                       />
                       <button type="button" className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-blue-600 font-medium px-2 py-1 rounded hover:bg-gray-100 transition-colors">
                          <Paperclip className="w-4 h-4" /> 附件
                       </button>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 text-sm text-gray-600 font-medium">
                       下次提醒:
                       <input
                          name="nextFollowUp"
                          type="date"
                          defaultValue={customer.nextFollowUp || ""}
                          className="text-sm border border-gray-300 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white shadow-sm"
                       />
                    </div>
                    <button
                      type="submit"
                      className="px-5 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold shadow-sm hover:bg-blue-700 transition-all hover:shadow-md"
                    >
                      发布跟进
                    </button>
                  </div>
                </div>
              </form>
            </div>

            {/* Timeline Tabs & List */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm flex-1 flex flex-col overflow-hidden">
              <div className="flex border-b border-gray-100 px-2 pt-2 shrink-0">
                 {['全部动态', '跟进记录', '交易单据', '附件档案库'].map(tab => (
                    <button
                       key={tab}
                       onClick={() => setActiveTab(tab)}
                       className={`px-4 py-3 text-sm font-bold border-b-2 transition-colors ${activeTab === tab ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-800'}`}
                    >
                       {tab}
                    </button>
                 ))}
              </div>

              <div className="p-6 overflow-y-auto flex-1">
                <div className="space-y-6 border-l-2 border-gray-100 ml-4 pl-6 relative">
                  {filteredTimeline.length === 0 ? (
                    <div className="text-sm text-gray-400 py-8 text-center bg-gray-50 rounded-lg border border-dashed border-gray-200 -ml-6 mt-4">
                       暂无匹配的数据记录
                    </div>
                  ) : (
                    filteredTimeline.map((t) => {
                      const style = getTimelineIconAndColor(t.type, t.title);
                      const Icon = style.icon;
                      return (
                      <div key={t.id} className="relative group">
                        <div className={`absolute w-8 h-8 rounded-full border-4 border-white -left-[43px] -top-1 flex items-center justify-center shadow-sm ${style.colorClass}`}>
                           <Icon className="w-3.5 h-3.5 text-white" />
                        </div>
                        <div className={`p-4 rounded-xl border ${style.bgClass} shadow-sm hover:shadow-md transition-shadow`}>
                          <div className="flex justify-between items-start mb-2">
                            <span className={`font-bold text-sm ${style.textClass}`}>
                              {renderContentWithLinks(t.title || t.type)}
                            </span>
                            <div className="flex items-center gap-3">
                              <span className="text-xs text-gray-400 font-medium">{new Date(t.date).toLocaleString()}</span>
                              <button
                                onClick={() => {
                                  if (window.confirm("确定删除该记录?"))
                                    actions.deleteTimeline(t.id);
                                }}
                                className="text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all p-1"
                                title="删除记录"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>

                          {t.content && (
                             <p className="text-gray-700 text-sm whitespace-pre-wrap leading-relaxed">
                                {renderContentWithLinks(t.content)}
                             </p>
                          )}

                          {/* Attachments rendering */}
                          {t.attachments && t.attachments.length > 0 && (
                             <div className="mt-4 pt-3 border-t border-gray-200/60 flex flex-wrap gap-3">
                                {t.attachments.map(att => (
                                   <div key={att.id} className="flex items-center gap-2 bg-white border border-gray-200 p-2 rounded-lg shadow-sm cursor-pointer hover:border-blue-300 transition-colors group/att">
                                      <div className="w-8 h-8 bg-blue-50 rounded flex items-center justify-center text-blue-500 group-hover/att:bg-blue-100 transition-colors">
                                         <FileText className="w-4 h-4" />
                                      </div>
                                      <div className="flex flex-col">
                                         <span className="text-xs font-bold text-gray-700 max-w-[120px] truncate">{att.name}</span>
                                         <span className="text-[10px] text-gray-400">{att.size}</span>
                                      </div>
                                      <Download className="w-3.5 h-3.5 text-gray-300 ml-2 group-hover/att:text-blue-500" />
                                   </div>
                                ))}
                             </div>
                          )}

                        </div>
                      </div>
                    )})
                  )}
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerDetailView;
