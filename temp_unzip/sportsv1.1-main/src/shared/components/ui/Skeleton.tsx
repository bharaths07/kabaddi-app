import React from 'react';

interface SkeletonProps {
    className?: string;
    variant?: 'rect' | 'circle' | 'text';
    width?: string | number;
    height?: string | number;
}

export const Skeleton: React.FC<SkeletonProps> = ({
    className = '',
    variant = 'rect',
    width,
    height
}) => {
    const baseClasses = "animate-pulse bg-slate-200 dark:bg-slate-700";
    const variantClasses = {
        rect: "rounded-md",
        circle: "rounded-full",
        text: "rounded h-4 w-full mb-2"
    };

    return (
        <div
            className={`${baseClasses} ${variantClasses[variant]} ${className}`}
            style={{ width, height }}
        />
    );
};
