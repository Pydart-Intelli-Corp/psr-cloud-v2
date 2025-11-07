'use client';

import React from 'react';
import { Folder, FolderOpen, ChevronRight, ChevronDown } from 'lucide-react';

interface FolderViewProps<T> {
  items: T[];
  groupByKey: keyof T;
  groupByLabel: string;
  groups: Array<{
    id: number;
    name: string;
    identifier?: string;
  }>;
  expandedGroups: Set<number>;
  selectedGroups: Set<number>;
  onToggleExpand: (groupId: number) => void;
  onToggleGroupSelection: (groupId: number, itemIds: number[]) => void;
  renderItem: (item: T) => React.ReactNode;
  getItemId: (item: T) => number;
  getGroupStats?: (groupId: number, items: T[]) => {
    activeCount: number;
    inactiveCount: number;
    totalCount: number;
  };
  emptyMessage?: string;
}

/**
 * Reusable folder/grouped view component
 * Groups items by a specified key and displays in expandable folders
 */
function FolderView<T extends Record<string, unknown>>({
  items,
  groupByKey,
  groups,
  expandedGroups,
  selectedGroups,
  onToggleExpand,
  onToggleGroupSelection,
  renderItem,
  getItemId,
  getGroupStats,
  emptyMessage = 'No items in this group'
}: FolderViewProps<T>) {
  // Group items by the specified key
  const itemsByGroup = items.reduce((acc, item) => {
    const groupId = (item[groupByKey] as number) || 0;
    if (!acc[groupId]) {
      acc[groupId] = [];
    }
    acc[groupId].push(item);
    return acc;
  }, {} as Record<number, T[]>);

  return (
    <div className="space-y-4">
      {groups.map(group => {
        const groupItems = itemsByGroup[group.id] || [];
        const isExpanded = expandedGroups.has(group.id);
        const isGroupSelected = selectedGroups.has(group.id);
        const itemIds = groupItems.map(getItemId);

        // Get stats if available
        const stats = getGroupStats?.(group.id, groupItems);

        return (
          <div
            key={group.id}
            className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden transition-all hover:shadow-md"
          >
            {/* Folder Header */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/30">
              <div className="flex items-center space-x-3">
                {/* Group Checkbox */}
                <div
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleGroupSelection(group.id, itemIds);
                  }}
                  className="flex items-center mr-3 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={isGroupSelected}
                    onChange={() => {}} // Handled by parent div
                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600 cursor-pointer"
                  />
                </div>

                {/* Expandable Header */}
                <button
                  onClick={() => onToggleExpand(group.id)}
                  className="flex-1 flex items-center justify-between"
                >
                  <div className="flex items-center space-x-3">
                    {isExpanded ? (
                      <ChevronDown className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                    ) : (
                      <ChevronRight className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                    )}
                    {isExpanded ? (
                      <FolderOpen className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    ) : (
                      <Folder className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    )}
                    <div className="text-left">
                      <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
                        {group.name}
                      </h3>
                      {group.identifier && (
                        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                          ID: {group.identifier}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    {stats && (
                      <div className="flex items-center space-x-2">
                        <div className="text-right">
                          <div className="flex items-center space-x-2 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                            <span className="flex items-center space-x-1">
                              <div className="w-2 h-2 rounded-full bg-green-500"></div>
                              <span>{stats.activeCount}</span>
                            </span>
                            <span className="flex items-center space-x-1">
                              <div className="w-2 h-2 rounded-full bg-red-500"></div>
                              <span>{stats.inactiveCount}</span>
                            </span>
                          </div>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {stats.totalCount} {stats.totalCount === 1 ? 'item' : 'items'}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </button>
              </div>
            </div>

            {/* Items Grid - Shown when expanded */}
            {isExpanded && (
              <div className="border-t border-gray-200 dark:border-gray-700 p-4 bg-gray-50 dark:bg-gray-900/30">
                {groupItems.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {groupItems.map(item => renderItem(item))}
                  </div>
                ) : (
                  <p className="text-center text-gray-500 dark:text-gray-400 py-8">
                    {emptyMessage}
                  </p>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default FolderView;
