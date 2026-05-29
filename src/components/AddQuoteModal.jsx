import React, { useState, useEffect } from "react";
import { X, Save, Upload, Trash2, FileText, CheckCircle2 } from "lucide-react";
import { getTodayStr } from "../utils/helpers";

// Simulated Data Dictionary for Document Types and Cascading Statuses
const DICTIONARY = {
  types: [
    { value: "报价单", label: "报价单", is_default: true, prefix: "QUO" },
    { value: "样品单", label: "样品单", is_default: false, prefix: "SMP" },
    { value: "订单", label: "订单", is_default: false, prefix: "ORD" }
  ],
  statuses: {
    "报价单": [
      { value: "待客户确认", label: "待客户确认", color: "bg-yellow-100 text-yellow-700", is_default: true },
      { value: "已确认", label: "已确认", color: "bg-blue-100 text-blue-700" },
      { value: "已拒绝", label: "已拒绝", color: "bg-red-100 text-red-700" },
      { value: "已过期", label: "已过期", color: "bg-gray-100 text-gray-700" }
    ],
    "样品单": [
      { value: "待寄出", label: "待寄出", color: "bg-yellow-100 text-yellow-700", is_default: true },
      { value: "已寄出", label: "已寄出", color: "bg-blue-100 text-blue-700" },
      { value: "客户已收件", label: "客户已收件", color: "bg-purple-100 text-purple-700" },
      { value: "测试反馈中", label: "测试反馈中", color: "bg-orange-100 text-orange-700" }
    ],
    "订单": [
      { value: "待付定金", label: "待付定金", color: "bg-yellow-100 text-yellow-700", is_default: true },
      { value: "生产中", label: "生产中", color: "bg-blue-100 text-blue-700" },
      { value: "待付尾款", label: "待付尾款", color: "bg-orange-100 text-orange-700" },
      { value: "已发货", label: "已发货", color: "bg-purple-100 text-purple-700" },
      { value: "已完结", label: "已完结", color: "bg-green-100 text-green-700" }
    ]
  }
};

const AddQuoteModal = ({
  isOpen,
  onClose,
  onSave,
  editingQuote,
  customerId,
  customerName,
  CURRENCIES,
}) => {
  const [formData, setFormData] = useState({
    displayId: "",
    date: getTodayStr(),
    type: "",
    status: "",
    currency: "USD",
    amount: "",
    hasExtraFee: false,
    extraFee: "",
    products: "",
    notes: "",
    attachments: [] // List of mock file objects { name, size, type }
  });

  const [availableStatuses, setAvailableStatuses] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isOpen) {
      if (editingQuote) {
        const type = editingQuote.type || DICTIONARY.types.find(t => t.is_default).value;
        const statuses = DICTIONARY.statuses[type] || [];
        setAvailableStatuses(statuses);

        setFormData({
          displayId: editingQuote.displayId || "",
          date: editingQuote.date || getTodayStr(),
          type: type,
          status: editingQuote.status || statuses[0]?.value || "",
          currency: editingQuote.currency || "USD",
          amount: editingQuote.amount || "",
          hasExtraFee: !!editingQuote.extraFee,
          extraFee: editingQuote.extraFee || "",
          products: editingQuote.products || editingQuote.product || "", // Fallback to old key
          notes: editingQuote.notes || "",
          attachments: editingQuote.attachments || []
        });
      } else {
        // Initialize defaults for new quote
        const defaultType = DICTIONARY.types.find(t => t.is_default);
        const typeValue = defaultType ? defaultType.value : "报价单";
        const prefix = defaultType ? defaultType.prefix : "QUO";
        const generatedId = `${prefix}-${getTodayStr().replace(/-/g, '')}-${Math.floor(1000 + Math.random() * 9000)}`;

        const statuses = DICTIONARY.statuses[typeValue] || [];
        const defaultStatus = statuses.find(s => s.is_default) || statuses[0];

        setAvailableStatuses(statuses);
        setFormData({
          displayId: generatedId,
          date: getTodayStr(),
          type: typeValue,
          status: defaultStatus ? defaultStatus.value : "",
          currency: "USD",
          amount: "",
          hasExtraFee: false,
          extraFee: "",
          products: "",
          notes: "",
          attachments: []
        });
      }
      setErrors({});
      setIsSubmitting(false);
    }
  }, [isOpen, editingQuote]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    // Clear error when user types
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }

    if (name === "type") {
      // Cascading logic: Type changes -> Status list changes
      const statuses = DICTIONARY.statuses[value] || [];
      const defaultStatus = statuses.find(s => s.is_default) || statuses[0];
      setAvailableStatuses(statuses);

      // Update prefix for new documents if they haven't explicitly manually changed it heavily
      let newDisplayId = formData.displayId;
      if (!editingQuote) {
        const typeObj = DICTIONARY.types.find(t => t.value === value);
        if (typeObj && newDisplayId) {
          const parts = newDisplayId.split('-');
          if (parts.length >= 2) {
             newDisplayId = `${typeObj.prefix}-${parts[1]}-${parts[2] || Math.floor(1000 + Math.random() * 9000)}`;
          }
        }
      }

      setFormData(prev => ({
        ...prev,
        type: value,
        status: defaultStatus ? defaultStatus.value : "",
        displayId: newDisplayId
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
  };

  const handleAmountChange = (e) => {
    const { name, value } = e.target;
    // Allow empty string, or numbers with up to 2 decimal places
    if (value === '' || /^\d+(\.\d{0,2})?$/.test(value)) {
       setFormData(prev => ({ ...prev, [name]: value }));
       if (errors[name]) setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.displayId.trim()) newErrors.displayId = "单据编号不能为空";
    if (!formData.type) newErrors.type = "请选择单据类型";
    if (!formData.status) newErrors.status = "请选择状态";
    if (!formData.amount || parseFloat(formData.amount) <= 0) newErrors.amount = "金额必须大于0";
    if (formData.hasExtraFee && (!formData.extraFee || parseFloat(formData.extraFee) < 0)) {
        newErrors.extraFee = "附加费不能小于0";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);

    // Simulate network delay to show loading state
    setTimeout(() => {
      onSave({
        id: editingQuote?.id,
        customerId: editingQuote ? editingQuote.customerId : customerId,
        customerName: editingQuote ? editingQuote.customerName : customerName,
        displayId: formData.displayId,
        type: formData.type,
        currency: formData.currency,
        amount: formData.amount,
        hasExtraFee: formData.hasExtraFee,
        extraFee: formData.hasExtraFee ? formData.extraFee : "0",
        date: formData.date,
        status: formData.status,
        products: formData.products,
        notes: formData.notes,
        attachments: formData.attachments
      });
      // Component will be closed by parent onSave
    }, 600);
  };

  const handleMockUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Mock upload delay
    const newAttachment = {
      id: Math.random().toString(36).substr(2, 9),
      name: file.name,
      size: (file.size / 1024).toFixed(1) + ' KB',
      type: file.type || 'unknown'
    };

    setFormData(prev => ({
      ...prev,
      attachments: [...prev.attachments, newAttachment]
    }));
    e.target.value = ''; // reset input
  };

  const removeAttachment = (id) => {
    setFormData(prev => ({
      ...prev,
      attachments: prev.attachments.filter(a => a.id !== id)
    }));
  };

  // Find color config for current status to render dot
  const currentStatusConfig = availableStatuses.find(s => s.value === formData.status);
  const statusColorClass = currentStatusConfig ? currentStatusConfig.color.split(' ')[0] : 'bg-gray-200';

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col my-8">

        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50 shrink-0">
          <h3 className="font-bold text-lg text-gray-800 flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-600" />
            {editingQuote ? "编辑单据" : "录入新单据"}
          </h3>
          <button onClick={!isSubmitting ? onClose : undefined} className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-md hover:bg-gray-200">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="overflow-y-auto p-6 max-h-[75vh]">
          <form id="quote-form" onSubmit={handleSubmit} className="space-y-6">

            {/* 顶部： 单据编号、日期 */}
            <div className="grid grid-cols-2 gap-6 bg-gray-50 p-4 rounded-lg border border-gray-100">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">单据编号 <span className="text-red-500">*</span></label>
                <input
                  name="displayId"
                  value={formData.displayId}
                  onChange={handleChange}
                  className={`w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white ${errors.displayId ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 shadow-sm'}`}
                  placeholder="自动生成或手动输入"
                />
                {errors.displayId && <p className="text-red-500 text-xs mt-1">{errors.displayId}</p>}
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">单据日期 <span className="text-red-500">*</span></label>
                <input
                  required
                  name="date"
                  type="date"
                  value={formData.date}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white shadow-sm"
                />
              </div>
            </div>

            {/* 中间排 1： 类型、状态 */}
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">单据类型 <span className="text-red-500">*</span></label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white shadow-sm"
                >
                  {DICTIONARY.types.map(t => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
                {errors.type && <p className="text-red-500 text-xs mt-1">{errors.type}</p>}
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">当前状态 <span className="text-red-500">*</span></label>
                <div className="relative">
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-md pl-8 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white shadow-sm appearance-none"
                  >
                    {availableStatuses.map(s => (
                      <option key={s.value} value={s.value}>{s.label}</option>
                    ))}
                  </select>
                  {/* Status Color Dot Injection */}
                  <div className={`absolute left-3 top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full ${statusColorClass}`}></div>
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                  </div>
                </div>
                {errors.status && <p className="text-red-500 text-xs mt-1">{errors.status}</p>}
              </div>
            </div>

            {/* 中间排 2： 币种、金额 */}
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">结算币种 <span className="text-red-500">*</span></label>
                <select
                  name="currency"
                  value={formData.currency}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white shadow-sm"
                >
                  {CURRENCIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-3">
                 <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1.5">总金额 <span className="text-red-500">*</span></label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm font-medium">{formData.currency}</span>
                      <input
                        name="amount"
                        value={formData.amount}
                        onChange={handleAmountChange}
                        placeholder="0.00"
                        className={`w-full border rounded-md pl-12 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white ${errors.amount ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 shadow-sm'}`}
                      />
                    </div>
                    {errors.amount && <p className="text-red-500 text-xs mt-1">{errors.amount}</p>}
                 </div>

                 <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="hasExtraFee"
                      name="hasExtraFee"
                      checked={formData.hasExtraFee}
                      onChange={handleChange}
                      className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4"
                    />
                    <label htmlFor="hasExtraFee" className="text-sm text-gray-600 cursor-pointer">包含附加费 (运费/税费等)</label>
                 </div>

                 {formData.hasExtraFee && (
                    <div className="pt-1 animate-in fade-in slide-in-from-top-2 duration-200">
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm font-medium">+ {formData.currency}</span>
                        <input
                          name="extraFee"
                          value={formData.extraFee}
                          onChange={handleAmountChange}
                          placeholder="附加费金额"
                          className={`w-full border rounded-md pl-14 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white ${errors.extraFee ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 shadow-sm'}`}
                        />
                      </div>
                      {errors.extraFee && <p className="text-red-500 text-xs mt-1">{errors.extraFee}</p>}
                    </div>
                 )}
              </div>
            </div>

            {/* 下半部分： 关联产品/服务、备注详情 */}
            <div className="space-y-5 border-t border-gray-100 pt-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">关联产品 / 服务项目</label>
                <textarea
                  name="products"
                  value={formData.products}
                  onChange={handleChange}
                  rows={3}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white shadow-sm resize-none"
                  placeholder="例如：&#10;1. A型零部件 x 1000pcs&#10;2. 定制包装费 x 1项"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">备注详情 (发货要求/特殊约定等)</label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  rows={3}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white shadow-sm resize-none"
                  placeholder="添加仅内部可见的备注信息..."
                />
              </div>
            </div>

            {/* 底部区块： 附件拖拽上传区 */}
            <div className="pt-2">
              <label className="block text-sm font-bold text-gray-700 mb-1.5">附件凭证 (可选)</label>

              <div className="relative border-2 border-dashed border-gray-300 rounded-lg p-6 bg-gray-50 hover:bg-gray-100 transition-colors text-center group cursor-pointer">
                <input
                  type="file"
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  onChange={handleMockUpload}
                  title="点击或拖拽文件上传"
                />
                <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2 group-hover:text-blue-500 transition-colors" />
                <p className="text-sm font-medium text-gray-600">点击或将文件拖拽到这里上传</p>
                <p className="text-xs text-gray-400 mt-1">支持 PDF, Word, Excel, 图片格式</p>
              </div>

              {formData.attachments.length > 0 && (
                <div className="mt-3 space-y-2">
                  {formData.attachments.map((file) => (
                    <div key={file.id} className="flex justify-between items-center bg-white border border-gray-200 p-2 rounded-md shadow-sm">
                      <div className="flex items-center gap-2 overflow-hidden">
                        <FileText className="w-4 h-4 text-blue-500 shrink-0" />
                        <span className="text-sm text-gray-700 truncate">{file.name}</span>
                        <span className="text-xs text-gray-400 shrink-0">({file.size})</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeAttachment(file.id)}
                        className="text-gray-400 hover:text-red-500 p-1 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </form>
        </div>

        {/* 操作区 */}
        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 shrink-0 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="px-5 py-2 border border-gray-300 bg-white text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 disabled:opacity-50 transition-colors"
          >
            取消
          </button>
          <button
            type="submit"
            form="quote-form"
            disabled={isSubmitting}
            className="px-5 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 shadow-sm disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                保存中...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                {editingQuote ? '保存修改' : '保存单据'}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddQuoteModal;
