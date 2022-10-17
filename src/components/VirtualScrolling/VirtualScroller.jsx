import React, { useEffect, useRef, useState } from 'react';

function VirtualScroller({ settings, get, rowTemplate, onScrollEnd }) {
  const [data, setData] = useState([]);
  const scrollTopRef = useRef(0);
  const totalHeight =
    (settings.maxIndex - settings.minIndex + 1) * settings.itemHeight;
  const viewportHeight = settings.amount * settings.itemHeight;
  const toleranceHeight = settings.tolerance * settings.itemHeight;
  const bufferedItems = settings.amount + 2 * settings.tolerance;
  const itemsAbove =
    settings.startIndex - settings.tolerance - settings.minIndex;
  const [topPaddingHeight, setTopPaddingHeight] = useState(
    itemsAbove * settings.itemHeight
  );
  const [bottomPaddingHeight, setBottomPaddingHeight] = useState(
    totalHeight - topPaddingHeight
  );

  useEffect(() => {
    if (scrollTopRef.current && scrollTopRef.current > 0) {
      handleScroll({ target: { scrollTop: scrollTopRef.current } });
    }
  }, [settings.maxIndex]);

  const viewPortRef = useRef();

  useEffect(() => {
    if (!viewPortRef) {
      return;
    }
    const initialPosition = topPaddingHeight + toleranceHeight;
    if (!initialPosition) {
      handleScroll({ target: { scrollTop: 0 } });
    }
    viewPortRef.current.scrollTop = initialPosition;
  }, []);

  const handleScroll = ({ target: { scrollTop } }) => {
    const itemHeight = settings.itemHeight;
    const minIndex = settings.minIndex;
    const index =
      minIndex +
      Math.floor((scrollTop - toleranceHeight) / settings.itemHeight);
    const limit = bufferedItems;
    const offset = index;
    const startIndex = Math.max(settings.minIndex, offset);

    const endIndex = Math.min(offset + limit - 1, settings.maxIndex);
    const data = get(startIndex, endIndex);
    const topPaddingHeight = Math.max((index - minIndex) * itemHeight, 0);
    const bottomPaddingHeight = Math.max(
      totalHeight - topPaddingHeight - data.length * itemHeight,
      0
    );
    if (endIndex === settings.maxIndex) {
      onScrollEnd();
    }
    setTopPaddingHeight(topPaddingHeight);
    setBottomPaddingHeight(bottomPaddingHeight);
    setData(data);
    scrollTopRef.current = scrollTop;
    console.log(scrollTopRef.current);
  };
  return (
    <div
      ref={viewPortRef}
      style={{ height: viewportHeight, width: '100%', overflowY: 'auto' }}
      onScroll={handleScroll}
    >
      <div style={{ height: topPaddingHeight }}></div>
      {data.map(rowTemplate)}
      <div style={{ height: bottomPaddingHeight }}></div>
    </div>
  );
}

export default VirtualScroller;
