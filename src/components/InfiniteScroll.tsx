/* eslint-disable react/prop-types */
import React from 'react';

export interface InfiniteScrollProps
  extends React.HTMLAttributes<HTMLDivElement> {
  onLoadMore: () => void;
  threshold?: number;
}

export const InfiniteScroll: React.FC<InfiniteScrollProps> = ({
  onLoadMore,
  threshold = -1,
  children,
  ...props
}) => {
  return (
    <div
      {...props}
      onScroll={(e) => {
        const el = e.target as HTMLDivElement;
        const thresholdReal = threshold >= 0 ? threshold : el.clientHeight;
        if (el.scrollHeight - el.scrollTop <= el.clientHeight + thresholdReal) {
          onLoadMore();
        }
      }}
    >
      {children}
    </div>
  );
};
