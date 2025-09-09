import React from 'react';

/**
 * 최적화된 이미지 컴포넌트
 * Lighthouse 성능 개선을 위한 이미지 최적화 기능 제공
 */
export default function OptimizedImage({
    src,
    alt,
    width,
    height,
    className = '',
    loading = 'lazy',
    ...props
}) {
    return (
        <img
            src={src}
            alt={alt}
            width={width}
            height={height}
            className={className}
            loading={loading}
            // Layout Shift 방지를 위한 스타일
            style={{
                aspectRatio: width && height ? `${width}/${height}` : undefined,
            }}
            {...props}
        />
    );
}
