import React from 'react';
import { FixedSizeList as List } from 'react-window';
import InfiniteLoader from 'react-window-infinite-loader';
import AutoSizer from 'react-virtualized-auto-sizer';
import styles from './InfinityScroller.module.css';

export default function InfinityScroller({
  itemCount,
  itemSize,
  isItemLoaded,
  rowTemplate,
  loadMoreItems,
}) {
  return (
    <AutoSizer>
      {({ height, width }) => (
        <>
          <InfiniteLoader
            isItemLoaded={isItemLoaded}
            itemCount={itemCount}
            loadMoreItems={loadMoreItems}
          >
            {({ onItemsRendered, ref }) => (
              <List
                height={height}
                itemCount={itemCount}
                itemSize={itemSize}
                onItemsRendered={onItemsRendered}
                ref={ref}
                width={width}
                className={styles.infinityScroller}
              >
                {rowTemplate}
              </List>
            )}
          </InfiniteLoader>
        </>
      )}
    </AutoSizer>
  );
}
