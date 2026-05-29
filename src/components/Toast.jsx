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

export const Toast = ({ toast }) => {
  if (!toast) return null;
  return (
    <div
      className={`fixed top-4 right-4 z-[999] px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 transform transition-all duration-300 ${toast.type === "error" ? "bg-red-600 text-white" : "bg-gray-800 text-white"}`}
    >
      {toast.type === "error" ? (
        <AlertCircle className="w-5 h-5" />
      ) : (
        <CheckCircle2 className="w-5 h-5" />
      )}
      <span className="font-medium text-sm">{toast.message}</span>
    </div>
  );
};
export default Toast;
