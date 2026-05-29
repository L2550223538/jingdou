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

const AddCustomerModal = ({
  isOpen,
  onClose,
  onSave,
  ALL_TAGS,
  editingCustomer,
}) => {
  const [socialInputs, setSocialInputs] = useState([
    { platform: "WhatsApp", account: "" },
  ]);
  const [selectedTags, setSelectedTags] = useState([]);

  useEffect(() => {
    if (isOpen && editingCustomer) {
      setSocialInputs(
        editingCustomer.socialMedia?.length
          ? editingCustomer.socialMedia
          : [{ platform: "WhatsApp", account: "" }],
      );
      setSelectedTags(editingCustomer.tags || []);
    } else if (isOpen) {
      setSocialInputs([{ platform: "WhatsApp", account: "" }]);
      setSelectedTags([]);
    }
  }, [isOpen, editingCustomer]);

  if (!isOpen) return null;

  const handleAddSocial = () =>
    setSocialInputs([...socialInputs, { platform: "WhatsApp", account: "" }]);
  const handleRemoveSocial = (index) =>
    setSocialInputs(socialInputs.filter((_, i) => i !== index));
  const handleSocialChange = (index, field, value) => {
    const newSocials = [...socialInputs];
    newSocials[index][field] = value;
    setSocialInputs(newSocials);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const socialMedia = socialInputs.filter((s) => s.account.trim() !== "");

    const newCustomer = {
      ...(editingCustomer || {}), // Keep existing ID, createdAt, stage, etc if editing
      name: formData.get("name"),
      country: formData.get("country"),
      website: formData.get("website") || "",
      socialMedia,
      source: formData.get("source"),
      level: formData.get("level"),
      stage: editingCustomer ? editingCustomer.stage : "未联系",
      lastFollowUp: editingCustomer ? editingCustomer.lastFollowUp : "-",
      nextFollowUp: formData.get("nextFollowUp") || "",
      owner: "Admin",
      tags: selectedTags,
    };
    onSave(newCustomer);
    setSocialInputs([{ platform: "WhatsApp", account: "" }]);
    setSelectedTags([]);
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden max-h-[90vh] flex flex-col">
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center shrink-0">
          <h3 className="font-bold text-lg text-gray-800">
            {editingCustomer ? "编辑客户资料" : "新增客户"}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="overflow-y-auto flex-1 p-6">
          <form
            id="addCustomerForm"
            onSubmit={handleSubmit}
            className="space-y-4"
          >
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                客户名称 *
              </label>
              <input
                required
                name="name"
                defaultValue={editingCustomer?.name || ""}
                type="text"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                placeholder="如: AutoParts GmbH"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                企业官网
              </label>
              <input
                name="website"
                defaultValue={editingCustomer?.website || ""}
                type="text"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                placeholder="如: www.example.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                社媒账号
              </label>
              <div className="space-y-2">
                {socialInputs.map((social, index) => (
                  <div key={index} className="flex gap-2">
                    <select
                      value={social.platform}
                      onChange={(e) =>
                        handleSocialChange(index, "platform", e.target.value)
                      }
                      className="w-1/3 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white"
                    >
                      <option value="WhatsApp">WhatsApp</option>
                      <option value="WeChat">WeChat</option>
                      <option value="LinkedIn">LinkedIn</option>
                      <option value="Skype">Skype</option>
                      <option value="其他">其他</option>
                    </select>
                    <input
                      type="text"
                      value={social.account}
                      onChange={(e) =>
                        handleSocialChange(index, "account", e.target.value)
                      }
                      className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      placeholder="账号/链接"
                    />
                    {socialInputs.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveSocial(index)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={handleAddSocial}
                  className="text-sm text-blue-600 font-medium flex items-center gap-1 hover:text-blue-700"
                >
                  <Plus className="w-3.5 h-3.5" /> 添加社媒
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  国家/地区
                </label>
                <input
                  name="country"
                  defaultValue={editingCustomer?.country || ""}
                  type="text"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  客户等级
                </label>
                <select
                  name="level"
                  defaultValue={editingCustomer?.level || "C(普通)"}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white"
                >
                  <option value="A(核心)">A(核心)</option>
                  <option value="B(重点)">B(重点)</option>
                  <option value="C(普通)">C(普通)</option>
                  <option value="D(潜在)">D(潜在)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                客户标签
              </label>
              <div className="flex flex-wrap gap-2">
                {ALL_TAGS.map((tag) => (
                  <button
                    type="button"
                    key={tag}
                    onClick={() =>
                      setSelectedTags((prev) =>
                        prev.includes(tag)
                          ? prev.filter((t) => t !== tag)
                          : [...prev, tag],
                      )
                    }
                    className={`px-2 py-1 rounded text-xs font-medium border ${selectedTags.includes(tag) ? "bg-blue-100 border-blue-200 text-blue-700" : "bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100"}`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  客户来源
                </label>
                <select
                  name="source"
                  defaultValue={editingCustomer?.source || "官网"}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white"
                >
                  <option value="展会">展会</option>
                  <option value="官网">官网</option>
                  <option value="Alibaba">Alibaba</option>
                  <option value="Google开发">Google开发</option>
                  <option value="其他">其他</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  下次提醒
                </label>
                <input
                  name="nextFollowUp"
                  defaultValue={editingCustomer?.nextFollowUp || ""}
                  type="date"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
            </div>
          </form>
        </div>
        <div className="px-6 py-4 border-t border-gray-100 flex gap-3 justify-end shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50"
          >
            取消
          </button>
          <button
            type="submit"
            form="addCustomerForm"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 flex items-center gap-2"
          >
            <Save className="w-4 h-4" /> 保存
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddCustomerModal;
