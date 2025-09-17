import { useVirtualizer } from 'react-virtual';
import { useRef, useMemo } from 'react';

export const useVirtualScroll = (items, options = {}) => {
  const parentRef = useRef();
  
  const {
    itemHeight = 50,
    overscan = 5,
    horizontal = false,
    ...restOptions
  } = options;

  const virtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => itemHeight,
    overscan,
    horizontal,
    ...restOptions,
  });

  const virtualItems = virtualizer.getVirtualItems();
  
  const totalSize = virtualizer.getTotalSize();
  const paddingTop = virtualItems.length > 0 ? virtualItems[0].start || 0 : 0;
  const paddingBottom = virtualItems.length > 0 
    ? totalSize - (virtualItems[virtualItems.length - 1].end || 0) 
    : 0;

  return {
    virtualizer,
    virtualItems,
    totalSize,
    paddingTop,
    paddingBottom,
    parentRef,
  };
};

// Hook for infinite scrolling with virtualization
export const useInfiniteVirtualScroll = (items, options = {}) => {
  const {
    itemHeight = 50,
    overscan = 5,
    onLoadMore,
    hasNextPage = false,
    isLoading = false,
    ...restOptions
  } = options;

  const parentRef = useRef();

  const virtualizer = useVirtualizer({
    count: hasNextPage ? items.length + 1 : items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => itemHeight,
    overscan,
    ...restOptions,
  });

  const virtualItems = virtualizer.getVirtualItems();
  
  // Check if we need to load more items
  const lastItem = virtualItems[virtualItems.length - 1];
  if (lastItem && lastItem.index >= items.length - 1 && hasNextPage && !isLoading) {
    onLoadMore?.();
  }

  const totalSize = virtualizer.getTotalSize();
  const paddingTop = virtualItems.length > 0 ? virtualItems[0].start || 0 : 0;
  const paddingBottom = virtualItems.length > 0 
    ? totalSize - (virtualItems[virtualItems.length - 1].end || 0) 
    : 0;

  return {
    virtualizer,
    virtualItems,
    totalSize,
    paddingTop,
    paddingBottom,
    parentRef,
    isLoading,
    hasNextPage,
  };
};
