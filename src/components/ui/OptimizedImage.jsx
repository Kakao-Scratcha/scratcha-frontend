import React from 'react';

/**
 * 최적화된 이미지 컴포넌트
 * 반응형 크기와 적절한 포맷으로 이미지를 최적화합니다.
 */
export default function OptimizedImage({
    src,
    alt,
    width,
    height,
    className = '',
    loading = 'lazy',
    fetchPriority = 'auto',
    sizes = '100vw',
    ...props
}) {
    // vite-imagetools와 호환되도록 단순화된 접근
    // 이미지는 이미 import 시점에서 최적화됨
    return (
        <img
            src={src}
            alt={alt}
            width={width}
            height={height}
            className={`${className} object-contain`}
            loading={loading}
            fetchPriority={fetchPriority}
            sizes={sizes}
            draggable={false}
            style={{
                maxWidth: '100%',
                maxHeight: '100%',
                objectFit: 'contain',
                userSelect: 'none'
            }}
            {...props}
        />
    );
}