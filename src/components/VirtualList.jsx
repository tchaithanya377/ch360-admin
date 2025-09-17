import React from 'react';
import { useVirtualizer } from 'react-virtual';
import { useVirtualScroll } from '../hooks/useVirtualScroll';

// Virtual list component for large datasets
export const VirtualList = ({ 
  items, 
  itemHeight = 50,
  renderItem,
  className = '',
  overscan = 5,
  horizontal = false,
  ...props 
}) => {
  const { virtualizer, virtualItems, paddingTop, paddingBottom, parentRef } = useVirtualScroll(
    items,
    { itemHeight, overscan, horizontal }
  );

  return (
    <div
      ref={parentRef}
      className={`overflow-auto ${className}`}
      style={{
        height: `${virtualizer.getTotalSize()}px`,
        width: '100%',
        position: 'relative',
      }}
      {...props}
    >
      <div
        style={{
          height: `${paddingTop}px`,
          width: '100%',
        }}
      />
      {virtualItems.map((virtualItem) => (
        <div
          key={virtualItem.key}
          data-index={virtualItem.index}
          ref={virtualizer.measureElement}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: `${virtualItem.size}px`,
            transform: `translateY(${virtualItem.start}px)`,
          }}
        >
          {renderItem(items[virtualItem.index], virtualItem.index, virtualItem)}
        </div>
      ))}
      <div
        style={{
          height: `${paddingBottom}px`,
          width: '100%',
        }}
      />
    </div>
  );
};

// Virtual grid component
export const VirtualGrid = ({ 
  items, 
  itemWidth = 200,
  itemHeight = 200,
  renderItem,
  className = '',
  overscan = 5,
  columns = 4,
  ...props 
}) => {
  const parentRef = React.useRef();

  const virtualizer = useVirtualizer({
    count: Math.ceil(items.length / columns),
    getScrollElement: () => parentRef.current,
    estimateSize: () => itemHeight,
    overscan,
  });

  const virtualItems = virtualizer.getVirtualItems();
  const totalSize = virtualizer.getTotalSize();
  const paddingTop = virtualItems.length > 0 ? virtualItems[0].start || 0 : 0;
  const paddingBottom = virtualItems.length > 0 
    ? totalSize - (virtualItems[virtualItems.length - 1].end || 0) 
    : 0;

  return (
    <div
      ref={parentRef}
      className={`overflow-auto ${className}`}
      style={{
        height: `${totalSize}px`,
        width: '100%',
        position: 'relative',
      }}
      {...props}
    >
      <div
        style={{
          height: `${paddingTop}px`,
          width: '100%',
        }}
      />
      {virtualItems.map((virtualRow) => {
        const rowStart = virtualRow.index * columns;
        const rowEnd = Math.min(rowStart + columns, items.length);
        
        return (
          <div
            key={virtualRow.key}
            data-index={virtualRow.index}
            ref={virtualizer.measureElement}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: `${virtualRow.size}px`,
              transform: `translateY(${virtualRow.start}px)`,
              display: 'grid',
              gridTemplateColumns: `repeat(${columns}, 1fr)`,
              gap: '1rem',
            }}
          >
            {Array.from({ length: columns }, (_, columnIndex) => {
              const itemIndex = rowStart + columnIndex;
              if (itemIndex >= items.length) return null;
              
              return (
                <div
                  key={columnIndex}
                  style={{
                    width: '100%',
                    height: '100%',
                  }}
                >
                  {renderItem(items[itemIndex], itemIndex, virtualRow)}
                </div>
              );
            })}
          </div>
        );
      })}
      <div
        style={{
          height: `${paddingBottom}px`,
          width: '100%',
        }}
      />
    </div>
  );
};

// Infinite virtual list with loading states
export const InfiniteVirtualList = ({ 
  items, 
  itemHeight = 50,
  renderItem,
  onLoadMore,
  hasNextPage = false,
  isLoading = false,
  className = '',
  overscan = 5,
  ...props 
}) => {
  const { 
    virtualizer, 
    virtualItems, 
    paddingTop, 
    paddingBottom, 
    parentRef 
  } = useVirtualScroll(
    items,
    { itemHeight, overscan, onLoadMore, hasNextPage, isLoading }
  );

  return (
    <div
      ref={parentRef}
      className={`overflow-auto ${className}`}
      style={{
        height: `${virtualizer.getTotalSize()}px`,
        width: '100%',
        position: 'relative',
      }}
      {...props}
    >
      <div
        style={{
          height: `${paddingTop}px`,
          width: '100%',
        }}
      />
      {virtualItems.map((virtualItem) => (
        <div
          key={virtualItem.key}
          data-index={virtualItem.index}
          ref={virtualizer.measureElement}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: `${virtualItem.size}px`,
            transform: `translateY(${virtualItem.start}px)`,
          }}
        >
          {virtualItem.index >= items.length ? (
            <div className="flex items-center justify-center p-4">
              {isLoading ? (
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              ) : (
                <span className="text-gray-500">No more items</span>
              )}
            </div>
          ) : (
            renderItem(items[virtualItem.index], virtualItem.index, virtualItem)
          )}
        </div>
      ))}
      <div
        style={{
          height: `${paddingBottom}px`,
          width: '100%',
        }}
      />
    </div>
  );
};

// Example usage component
export const ExampleVirtualList = () => {
  const [items, setItems] = React.useState([]);
  const [isLoading, setIsLoading] = React.useState(false);

  React.useEffect(() => {
    // Generate sample data
    const sampleItems = Array.from({ length: 10000 }, (_, index) => ({
      id: index,
      name: `Item ${index}`,
      description: `This is item number ${index}`,
    }));
    setItems(sampleItems);
  }, []);

  const renderItem = (item, index) => (
    <div className="p-4 border-b border-gray-200 hover:bg-gray-50">
      <h3 className="font-semibold">{item.name}</h3>
      <p className="text-gray-600">{item.description}</p>
    </div>
  );

  return (
    <div className="h-96 border border-gray-300 rounded">
      <VirtualList
        items={items}
        itemHeight={80}
        renderItem={renderItem}
        className="h-full"
      />
    </div>
  );
};
