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
const SettingsView = ({ data, actions }) => {
  const handleExport = () => {
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `GlobalTradeCRM_Backup_${getTodayStr()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    actions.showToast("数据已导出为 JSON 文件");
  };

  const handleImport = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target.result);
        if (json.customers) {
          actions.importData(json);
          actions.showToast("数据导入成功");
        } else {
          actions.showToast("无效的数据格式", "error");
        }
      } catch (err) {
        actions.showToast("解析 JSON 失败", "error");
      }
    };
    reader.readAsText(file);
  };

  const handleClear = () => {
    if (
      window.confirm("确定要清空所有本地数据吗？此操作不可逆！建议先导出备份。")
    ) {
      actions.clearData();
      actions.showToast("系统数据已清空");
    }
  };

  return (
    <div className="p-6 max-w-3xl mx-auto h-full">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">
        系统设置与数据管理
      </h1>
      <div className="bg-white rounded-xl border shadow-sm p-6 space-y-8">
        <div>
          <h3 className="font-bold text-lg mb-2 flex items-center gap-2">
            <Download className="w-5 h-5 text-blue-600" /> 数据备份 (导出)
          </h3>
          <p className="text-sm text-gray-500 mb-4">
            将当前所有的客户、订单、跟进记录导出为纯文本 JSON
            文件，方便你在其他电脑恢复或永久存档。
          </p>
          <button
            onClick={handleExport}
            className="px-4 py-2 bg-blue-50 text-blue-700 border border-blue-200 rounded-lg font-medium hover:bg-blue-100 transition-colors"
          >
            导出 data.json
          </button>
        </div>

        <div className="border-t pt-6">
          <h3 className="font-bold text-lg mb-2 flex items-center gap-2">
            <Upload className="w-5 h-5 text-green-600" /> 数据恢复 (导入)
          </h3>
          <p className="text-sm text-gray-500 mb-4">
            从本地 JSON 文件中恢复数据。注意：这将覆盖当前系统内的所有数据。
          </p>
          <label className="px-4 py-2 bg-green-50 text-green-700 border border-green-200 rounded-lg font-medium hover:bg-green-100 cursor-pointer transition-colors inline-block">
            选择文件并导入
            <input
              type="file"
              accept=".json"
              onChange={handleImport}
              className="hidden"
            />
          </label>
        </div>

        <div className="border-t pt-6">
          <h3 className="font-bold text-lg mb-2 flex items-center gap-2 text-red-600">
            <Trash2 className="w-5 h-5" /> 危险操作
          </h3>
          <p className="text-sm text-gray-500 mb-4">
            清除浏览器的所有本地缓存数据。如果你的系统由于脏数据卡死，可以使用此功能。
          </p>
          <button
            onClick={handleClear}
            className="px-4 py-2 bg-red-50 text-red-700 border border-red-200 rounded-lg font-medium hover:bg-red-100 transition-colors"
          >
            清空所有数据
          </button>
        </div>
      </div>
    </div>
  );
};

// ==========================================
// MAIN APP
// ==========================================
export default SettingsView;
