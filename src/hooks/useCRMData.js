import { useState, useEffect } from "react";
import { generateId } from "../utils/helpers";

export const useCRMData = () => {
  const [data, setData] = useState(() => {
    const stored = localStorage.getItem("crm_data_v2");
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (e) {
        console.error("Failed to parse local data", e);
      }
    }
    return { customers: [], contacts: [], orders: [], timeline: [] };
  });

  useEffect(() => {
    localStorage.setItem("crm_data_v2", JSON.stringify(data));
  }, [data]);

  const addCustomer = (customer) => {
    const newCustomer = {
      id: generateId(),
      createdAt: new Date().toISOString(),
      tags: [],
      ...customer,
    };
    setData((prev) => ({
      ...prev,
      customers: [newCustomer, ...prev.customers],
    }));
    return newCustomer;
  };

  const updateCustomer = (id, updates) => {
    setData((prev) => ({
      ...prev,
      customers: prev.customers.map((c) =>
        c.id === id ? { ...c, ...updates } : c,
      ),
    }));
  };

  const deleteCustomer = (id) => {
    setData((prev) => ({
      ...prev,
      customers: prev.customers.filter((c) => c.id !== id),
      contacts: prev.contacts.filter((c) => c.customerId !== id),
      orders: prev.orders.filter((o) => o.customerId !== id),
      timeline: prev.timeline.filter((t) => t.customerId !== id),
    }));
  };

  const addContact = (contact) => {
    setData((prev) => ({
      ...prev,
      contacts: [
        { id: generateId(), createdAt: new Date().toISOString(), ...contact },
        ...prev.contacts,
      ],
    }));
  };

  const addOrder = (order) => {
    const newOrder = {
      id: generateId(),
      createdAt: new Date().toISOString(),
      ...order,
    };
    setData((prev) => ({ ...prev, orders: [newOrder, ...prev.orders] }));
    return newOrder;
  };

  const updateOrder = (id, updates) => {
    setData((prev) => ({
      ...prev,
      orders: prev.orders.map((o) => (o.id === id ? { ...o, ...updates } : o)),
    }));
  };

  const addTimeline = (timelineItem) => {
    setData((prev) => {
      const newTimeline = [
        {
          id: generateId(),
          createdAt: new Date().toISOString(),
          ...timelineItem,
        },
        ...prev.timeline,
      ];
      // Sort desc by date
      newTimeline.sort((a, b) => new Date(b.date) - new Date(a.date));
      return { ...prev, timeline: newTimeline };
    });
  };

  const importData = (jsonData) => setData(jsonData);
  const clearData = () =>
    setData({ customers: [], contacts: [], orders: [], timeline: [] });

  const deleteContact = (id) =>
    setData((prev) => ({
      ...prev,
      contacts: prev.contacts.filter((c) => c.id !== id),
    }));
  const deleteTimeline = (id) =>
    setData((prev) => ({
      ...prev,
      timeline: prev.timeline.filter((t) => t.id !== id),
    }));

  return {
    data,
    addCustomer,
    updateCustomer,
    deleteCustomer,
    addContact,
    deleteContact,
    addOrder,
    updateOrder,
    addTimeline,
    deleteTimeline,
    importData,
    clearData,
  };
};
