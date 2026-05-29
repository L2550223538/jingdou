import React, { useState, useMemo } from "react";
import {
  Search,
  Plus,
  List,
  LayoutDashboard,
  Edit2,
  X,
  ChevronDown,
  ChevronUp,
  Trash2,
  Users,
  Clock,
  Filter,
} from "lucide-react";
import { isDormant } from "../utils/helpers";
import { DICTIONARY } from "../utils/dictionary";

// Advanced Debounce Hook
function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  React.useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);
  return debouncedValue;
}

const CustomerListView = ({ data, actions, setSelectedCustomer }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearch = useDebounce(searchQuery, 300);

  const [viewMode, setViewMode] = useState("list"); // 'list' or 'kanban'
  const [filterLevel, setFilterLevel] = useState("");
  const [filterStage, setFilterStage] = useState("");

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Sorting State
  const [sortConfig, setSortConfig] = useState({
    key: "createdAt",
    direction: "desc",
  });

  // Batch Action State
  const [selectedRowIds, setSelectedRowIds] = useState(new Set());

  // Derive primary contacts
  const primaryContacts = useMemo(() => {
    const map = {};
    data.contacts.forEach((c) => {
      if (c.isPrimary || !map[c.customerId]) {
        map[c.customerId] = c;
      }
    });
    return map;
  }, [data.contacts]);

  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filterCountry, setFilterCountry] = useState("");
  const [filterTag, setFilterTag] = useState("");

  // Filtering
  const filtered = useMemo(() => {
    return data.customers.filter((c) => {
      const matchSearch =
        c.name.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        (c.country &&
          c.country.toLowerCase().includes(debouncedSearch.toLowerCase())) ||
        (c.tags &&
          c.tags.some((t) =>
            t.toLowerCase().includes(debouncedSearch.toLowerCase()),
          ));
      const matchLevel = filterLevel ? c.level === filterLevel : true;
      const matchStage = filterStage ? c.stage === filterStage : true;
      const matchCountry = filterCountry
        ? (c.country || "").toLowerCase().includes(filterCountry.toLowerCase())
        : true;
      const matchTag = filterTag ? c.tags && c.tags.includes(filterTag) : true;

      return (
        matchSearch && matchLevel && matchStage && matchCountry && matchTag
      );
    });
  }, [
    data.customers,
    debouncedSearch,
    filterLevel,
    filterStage,
    filterCountry,
    filterTag,
  ]);

  // Sorting
  const sortedAndFiltered = useMemo(() => {
    const sorted = [...filtered].sort((a, b) => {
      let aVal = a[sortConfig.key] || "";
      let bVal = b[sortConfig.key] || "";

      if (sortConfig.key === "createdAt") {
        aVal = new Date(aVal).getTime() || 0;
        bVal = new Date(bVal).getTime() || 0;
      }

      if (aVal < bVal) return sortConfig.direction === "asc" ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === "asc" ? 1 : -1;
      return 0;
    });
    return sorted;
  }, [filtered, sortConfig]);

  // Pagination
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedAndFiltered.slice(start, start + pageSize);
  }, [sortedAndFiltered, currentPage, pageSize]);

  const totalPages = Math.ceil(sortedAndFiltered.length / pageSize) || 1;

  // Handlers
  const handleSort = (key) => {
    let direction = "desc";
    if (sortConfig.key === key && sortConfig.direction === "desc") {
      direction = "asc";
    }
    setSortConfig({ key, direction });
  };

  const toggleRowSelection = (id) => {
    const newSet = new Set(selectedRowIds);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSelectedRowIds(newSet);
  };

  const toggleAllSelection = () => {
    const pageIds = paginatedData.map((c) => c.id);
    const allSelectedOnPage = pageIds.every((id) => selectedRowIds.has(id));
    const newSet = new Set(selectedRowIds);

    if (allSelectedOnPage && pageIds.length > 0) {
      pageIds.forEach((id) => newSet.delete(id));
    } else {
      pageIds.forEach((id) => newSet.add(id));
    }
    setSelectedRowIds(newSet);
  };

  // Batch Actions
  const handleBatchDelete = () => {
    if (
      window.confirm(
        `确定删除选中的 ${selectedRowIds.size} 个客户？此操作不可恢复。`,
      )
    ) {
      selectedRowIds.forEach((id) => actions.deleteCustomer(id));
      setSelectedRowIds(new Set());
      actions.showToast(`成功删除 ${selectedRowIds.size} 个客户`);
    }
  };

  const handleBatchLevel = (level) => {
    selectedRowIds.forEach((id) => actions.updateCustomer(id, { level }));
    setSelectedRowIds(new Set());
    actions.showToast(`批量修改等级成功`);
  };

  const renderTags = (tags) => {
    if (!tags || tags.length === 0) return null;
    return (
      <div className="flex gap-1.5 mt-1.5 flex-wrap">
        {tags.map((t) => (
          <span
            key={t}
            className="text-[10px] bg-blue-50 text-blue-700 border border-blue-100 px-1.5 py-0.5 rounded"
          >
            {t}
          </span>
        ))}
      </div>
    );
  };

  const renderSortIcon = (key) => {
    if (sortConfig.key !== key)
      return <ChevronDown className="w-3 h-3 text-gray-300 inline ml-1" />;
    return sortConfig.direction === "asc" ? (
      <ChevronUp className="w-3 h-3 text-blue-600 inline ml-1" />
    ) : (
      <ChevronDown className="w-3 h-3 text-blue-600 inline ml-1" />
    );
  };

  const getLevelColor = (level) =>
    DICTIONARY.levels.find((l) => l.value === level)?.color ||
    "bg-gray-100 text-gray-700 border-gray-200";
  const getStageColor = (stage) =>
    DICTIONARY.stages.find((s) => s.value === stage)?.color ||
    "bg-gray-100 text-gray-700 border-gray-200";

  const renderList = () => (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm flex-1 overflow-hidden flex flex-col relative">
      {/* Batch Action Floating Header */}
      {selectedRowIds.size > 0 && (
        <div className="absolute top-0 left-0 w-full h-12 bg-blue-50 border-b border-blue-100 z-10 flex items-center justify-between px-6 animate-in slide-in-from-top-2">
          <div className="text-sm font-bold text-blue-800">
            已选择 {selectedRowIds.size} 项
          </div>
          <div className="flex items-center gap-3">
            <select
              onChange={(e) => {
                if (e.target.value) handleBatchLevel(e.target.value);
                e.target.value = "";
              }}
              className="text-sm border border-blue-200 bg-white rounded px-2 py-1 text-blue-700 outline-none"
            >
              <option value="">批量修改等级...</option>
              {DICTIONARY.levels.map((l) => (
                <option key={l.value} value={l.value}>
                  {l.value}
                </option>
              ))}
            </select>
            <button className="text-sm border border-blue-200 bg-white rounded px-3 py-1 text-blue-700 hover:bg-blue-100 transition-colors">
              批量转移
            </button>
            <div className="w-px h-4 bg-blue-200 mx-1"></div>
            <button
              onClick={handleBatchDelete}
              className="text-sm border border-red-200 bg-white rounded px-3 py-1 text-red-600 hover:bg-red-50 flex items-center gap-1 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" /> 批量删除
            </button>
            <button
              onClick={() => setSelectedRowIds(new Set())}
              className="ml-2 text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      <div className="overflow-x-auto flex-1">
        <table className="w-full text-left border-collapse min-w-[1000px]">
          <thead className="bg-gray-50 border-b border-gray-200 sticky top-0 z-0">
            <tr>
              <th className="px-4 py-3 w-10">
                <input
                  type="checkbox"
                  checked={
                    selectedRowIds.size === paginatedData.length &&
                    paginatedData.length > 0
                  }
                  onChange={toggleAllSelection}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                />
              </th>
              <th
                className="px-6 py-3 text-xs font-bold text-gray-500 uppercase cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort("name")}
              >
                客户 / 联系人 {renderSortIcon("name")}
              </th>
              <th
                className="px-6 py-3 text-xs font-bold text-gray-500 uppercase cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort("country")}
              >
                国家 {renderSortIcon("country")}
              </th>
              <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase">
                等级
              </th>
              <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase">
                阶段
              </th>
              <th
                className="px-6 py-3 text-xs font-bold text-gray-500 uppercase cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort("nextFollowUp")}
              >
                下次提醒 {renderSortIcon("nextFollowUp")}
              </th>
              <th
                className="px-6 py-3 text-xs font-bold text-gray-500 uppercase cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort("createdAt")}
              >
                建档时间 {renderSortIcon("createdAt")}
              </th>
              <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase text-right">
                操作
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {paginatedData.length === 0 ? (
              <tr>
                <td
                  colSpan="8"
                  className="text-center py-10 text-gray-400 text-sm"
                >
                  暂无匹配的数据
                </td>
              </tr>
            ) : (
              paginatedData.map((c) => {
                const contact = primaryContacts[c.id];
                return (
                  <tr
                    key={c.id}
                    className={`hover:bg-blue-50/50 transition-colors ${selectedRowIds.has(c.id) ? "bg-blue-50/50" : ""}`}
                  >
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selectedRowIds.has(c.id)}
                        onChange={() => toggleRowSelection(c.id)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                      />
                    </td>
                    <td className="px-6 py-3">
                      <div className="flex flex-col gap-1">
                        <div
                          className="font-bold text-blue-600 flex items-center gap-2 cursor-pointer hover:underline text-sm"
                          onClick={() => setSelectedCustomer(c)}
                        >
                          {c.name}
                          {isDormant(c, data.timeline) && (
                            <span
                              className="bg-red-500 w-2 h-2 rounded-full shadow-sm"
                              title="沉睡高优客户预警"
                            ></span>
                          )}
                        </div>
                        {contact ? (
                          <div className="text-xs text-gray-500 flex items-center gap-1.5">
                            <Users className="w-3 h-3" /> {contact.name}{" "}
                            {contact.email && `· ${contact.email}`}
                          </div>
                        ) : (
                          <div className="text-xs text-gray-400">无联系人</div>
                        )}
                      </div>
                      {renderTags(c.tags)}
                    </td>
                    <td className="px-6 py-3 text-sm text-gray-700 font-medium">
                      {c.country || "-"}
                    </td>
                    <td className="px-6 py-3 text-sm">
                      <select
                        value={c.level}
                        onChange={(e) =>
                          actions.updateCustomer(c.id, {
                            level: e.target.value,
                          })
                        }
                        className={`border px-2 py-1 rounded-md cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors text-xs font-bold shadow-sm appearance-none ${getLevelColor(c.level)}`}
                      >
                        {DICTIONARY.levels.map((l) => (
                          <option key={l.value} value={l.value}>
                            {l.value}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-6 py-3">
                      <select
                        value={c.stage}
                        onChange={(e) =>
                          actions.updateCustomer(c.id, {
                            stage: e.target.value,
                          })
                        }
                        className={`border px-2 py-1 rounded-md cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors text-xs font-bold shadow-sm appearance-none ${getStageColor(c.stage)}`}
                      >
                        {DICTIONARY.stages.map((s) => (
                          <option key={s.value} value={s.value}>
                            {s.value}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-6 py-3 text-sm">
                      <input
                        type="date"
                        value={c.nextFollowUp || ""}
                        onChange={(e) =>
                          actions.updateCustomer(c.id, {
                            nextFollowUp: e.target.value,
                          })
                        }
                        className="bg-transparent hover:bg-white border border-transparent hover:border-gray-300 rounded px-1 py-1 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-xs font-medium text-gray-600 hover:shadow-sm"
                      />
                    </td>
                    <td className="px-6 py-3 text-xs text-gray-500 font-medium">
                      {c.createdAt
                        ? new Date(c.createdAt).toISOString().split("T")[0]
                        : "-"}
                    </td>
                    <td className="px-6 py-3 text-right flex justify-end gap-2">
                      <button
                        onClick={() => actions.openEditCustomer(c)}
                        className="p-1.5 text-gray-400 hover:text-blue-600 rounded-md hover:bg-blue-50 transition-colors"
                        title="编辑客户"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          if (
                            window.confirm("确定删除该客户及其所有相关数据？")
                          )
                            actions.deleteCustomer(c.id);
                        }}
                        className="p-1.5 text-gray-400 hover:text-red-600 rounded-md hover:bg-red-50 transition-colors"
                        title="删除客户"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="px-6 py-3 border-t border-gray-200 bg-gray-50 flex items-center justify-between shrink-0">
        <div className="text-sm text-gray-500 font-medium">
          共 {sortedAndFiltered.length} 条记录
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            每页
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="border border-gray-300 rounded px-1 py-0.5 outline-none bg-white"
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-2.5 py-1 border border-gray-300 rounded bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-50 text-sm"
            >
              上一页
            </button>
            <span className="px-3 text-sm font-medium text-gray-700">
              {currentPage} / {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-2.5 py-1 border border-gray-300 rounded bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-50 text-sm"
            >
              下一页
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  // Format dates gracefully
  const formatTimeAgo = (dateStr) => {
    if (!dateStr) return "无记录";
    const diff = (Date.now() - new Date(dateStr).getTime()) / 1000;
    if (diff < 3600) return Math.floor(diff / 60) + " 分钟前";
    if (diff < 86400) return Math.floor(diff / 3600) + " 小时前";
    if (diff < 86400 * 30) return Math.floor(diff / 86400) + " 天前";
    return dateStr.split("T")[0];
  };

  const onDragStart = (e, customerId) => {
    e.dataTransfer.setData("customerId", customerId);
  };

  const onDragOver = (e) => {
    e.preventDefault(); // allow drop
  };

  const onDrop = (e, newStage) => {
    e.preventDefault();
    const customerId = e.dataTransfer.getData("customerId");
    if (!customerId) return;

    const customer = data.customers.find((c) => c.id === customerId);
    if (customer && customer.stage !== newStage) {
      // Optimistic update wrapper via actions
      actions.updateCustomer(customerId, { stage: newStage });
      actions.showToast(`已移动至 ${newStage}`);

      // Log to timeline implicitly
      actions.addTimeline({
        customerId: customerId,
        type: "system",
        date: new Date().toISOString(),
        title: "系统记录",
        content: `阶段变更为: ${newStage}`,
        user: "Admin",
      });
    }
  };

  const renderKanban = () => {
    return (
      <div className="flex-1 flex gap-5 overflow-x-auto pb-4 items-start h-full">
        {DICTIONARY.stages.map((stageObj) => {
          const stage = stageObj.value;
          const stageCustomers = filtered.filter((c) => c.stage === stage);

          // Estimate value based on quotes logic
          const estAmount = stageCustomers.reduce((acc, c) => {
            const custOrders = data.orders.filter((o) => o.customerId === c.id);
            return (
              acc +
              custOrders.reduce((sum, o) => {
                const num = parseFloat(
                  String(o.amount).replace(/[^0-9.]/g, ""),
                );
                return sum + (isNaN(num) ? 0 : num);
              }, 0)
            );
          }, 0);

          return (
            <div
              key={stage}
              onDragOver={onDragOver}
              onDrop={(e) => onDrop(e, stage)}
              className="bg-gray-100/70 rounded-xl p-3 min-w-[320px] w-[320px] flex flex-col max-h-full border border-gray-200 shadow-inner"
            >
              {/* Column Header */}
              <div className="flex justify-between items-center mb-3 px-1">
                <div>
                  <h4 className="font-bold text-gray-800 text-sm flex items-center gap-2">
                    <div
                      className={`w-2.5 h-2.5 rounded-full ${stageObj.color.split(" ")[0]}`}
                    ></div>
                    {stage}
                  </h4>
                  <div className="text-[10px] text-gray-500 font-medium mt-0.5">
                    预估金额: USD {estAmount.toLocaleString()}
                  </div>
                </div>
                <span className="text-xs font-bold text-gray-600 bg-gray-200/80 px-2 py-0.5 rounded border border-gray-300">
                  {stageCustomers.length}
                </span>
              </div>

              {/* Cards Container */}
              <div className="flex-1 overflow-y-auto space-y-3 pr-1 pb-2">
                {stageCustomers.map((c) => {
                  const levelObj = DICTIONARY.levels.find(
                    (l) => l.value === c.level,
                  );

                  return (
                    <div
                      key={c.id}
                      draggable
                      onDragStart={(e) => onDragStart(e, c.id)}
                      className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 hover:border-blue-300 hover:shadow-md cursor-grab active:cursor-grabbing transition-all group relative"
                    >
                      {/* Hover Quick Action */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedCustomer(c);
                        }}
                        className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 p-1.5 bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100 transition-all shadow-sm"
                        title="快速记录跟进"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>

                      <div
                        className="font-black text-sm text-gray-800 mb-2 truncate pr-8"
                        onClick={() => setSelectedCustomer(c)}
                      >
                        {c.name}
                      </div>

                      <div
                        className="flex justify-between items-center text-xs mb-3"
                        onClick={() => setSelectedCustomer(c)}
                      >
                        <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded border border-gray-200 font-medium truncate max-w-[100px]">
                          {c.country || "未知"}
                        </span>
                        <span
                          className={`font-bold px-2 py-0.5 rounded border ${levelObj?.color || "bg-gray-100 text-gray-700 border-gray-200"}`}
                        >
                          {c.level}
                        </span>
                      </div>

                      <div
                        className="flex justify-between items-center text-[11px] text-gray-500 pt-2 border-t border-gray-100"
                        onClick={() => setSelectedCustomer(c)}
                      >
                        <span className="flex items-center gap-1 font-medium">
                          <Clock className="w-3 h-3" />{" "}
                          {formatTimeAgo(
                            c.lastFollowUp !== "-"
                              ? c.lastFollowUp
                              : c.createdAt,
                          )}
                        </span>
                        {isDormant(c, data.timeline) && (
                          <span className="text-red-500 font-bold flex items-center gap-1">
                            预警
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}

                {stageCustomers.length === 0 && (
                  <div className="border-2 border-dashed border-gray-300 rounded-xl h-24 flex items-center justify-center text-gray-400 text-sm font-medium">
                    拖拽卡片至此
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="p-6 h-full flex flex-col max-w-[1400px] mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">我的客户</h1>
        <div className="flex gap-3">
          <div className="flex gap-2">
            <select
              value={filterLevel}
              onChange={(e) => setFilterLevel(e.target.value)}
              className="border border-gray-300 rounded-lg text-sm px-3 py-2 bg-white text-gray-700 font-medium outline-none shadow-sm focus:ring-2 focus:ring-blue-500"
            >
              <option value="">全部等级</option>
              {DICTIONARY.levels.map((l) => (
                <option key={l.value} value={l.value}>
                  {l.value}
                </option>
              ))}
            </select>
            <select
              value={filterStage}
              onChange={(e) => setFilterStage(e.target.value)}
              className="border border-gray-300 rounded-lg text-sm px-3 py-2 bg-white text-gray-700 font-medium outline-none shadow-sm focus:ring-2 focus:ring-blue-500"
            >
              <option value="">全部阶段</option>
              {DICTIONARY.stages.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.value}
                </option>
              ))}
            </select>
          </div>
          <div className="flex bg-white border border-gray-300 rounded-lg p-1 shadow-sm">
            <button
              onClick={() => setViewMode("list")}
              className={`p-1.5 rounded-md transition-colors ${viewMode === "list" ? "bg-blue-100 text-blue-600 shadow-sm" : "text-gray-400 hover:text-gray-600 hover:bg-gray-50"}`}
              title="列表视图"
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode("kanban")}
              className={`p-1.5 rounded-md transition-colors ${viewMode === "kanban" ? "bg-blue-100 text-blue-600 shadow-sm" : "text-gray-400 hover:text-gray-600 hover:bg-gray-50"}`}
              title="看板视图"
            >
              <LayoutDashboard className="w-4 h-4" />
            </button>
          </div>
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="搜索客户名/标签/国家..."
              className="pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm w-64 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="relative">
            <button
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className={`flex items-center gap-2 px-4 py-2 border rounded-lg text-sm font-bold shadow-sm transition-all ${isFilterOpen ? "bg-blue-50 border-blue-200 text-blue-700" : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"}`}
            >
              <Filter className="w-4 h-4" /> 筛选
              {(filterCountry || filterTag) && (
                <span className="w-2 h-2 rounded-full bg-red-500"></span>
              )}
            </button>

            {isFilterOpen && (
              <div className="absolute right-0 top-full mt-2 w-72 bg-white border border-gray-200 rounded-xl shadow-xl z-50 p-5 animate-in fade-in slide-in-from-top-2">
                <h3 className="font-bold text-gray-800 mb-4 border-b border-gray-100 pb-2">
                  高级筛选
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1">
                      国家 / 地区
                    </label>
                    <input
                      type="text"
                      value={filterCountry}
                      onChange={(e) => setFilterCountry(e.target.value)}
                      placeholder="输入国家名"
                      className="w-full border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1">
                      特定标签
                    </label>
                    <input
                      type="text"
                      value={filterTag}
                      onChange={(e) => setFilterTag(e.target.value)}
                      placeholder="精确匹配标签名"
                      className="w-full border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                <div className="mt-6 flex justify-end gap-2">
                  <button
                    onClick={() => {
                      setFilterCountry("");
                      setFilterTag("");
                      setFilterLevel("");
                      setFilterStage("");
                    }}
                    className="px-3 py-1.5 text-sm text-gray-500 hover:text-gray-700 font-medium"
                  >
                    重置
                  </button>
                  <button
                    onClick={() => setIsFilterOpen(false)}
                    className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700"
                  >
                    完成
                  </button>
                </div>
              </div>
            )}
          </div>
          <button
            onClick={() => actions.openAddCustomer()}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold shadow-sm hover:bg-blue-700 transition-all hover:shadow-md"
          >
            <Plus className="w-4 h-4" /> 新建客户
          </button>
        </div>
      </div>
      {viewMode === "list" ? renderList() : renderKanban()}
    </div>
  );
};

export default CustomerListView;
