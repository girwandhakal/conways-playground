import React from 'react';
import { motion } from 'motion/react';
import { cn } from '../../lib/utils';

type MotionButtonProps = React.ComponentProps<typeof motion.button>;

type ButtonVariant = 'primary' | 'danger' | 'secondary' | 'ghost' | 'chip' | 'segment';
type ButtonSize = 'xs' | 'sm' | 'md' | 'lg' | 'icon';
type ButtonTone = 'slate' | 'blue' | 'rose';

interface InteractiveButtonProps extends MotionButtonProps {
  active?: boolean;
  contentClassName?: string;
  size?: ButtonSize;
  tone?: ButtonTone;
  variant?: ButtonVariant;
}

const sizeClasses: Record<ButtonSize, string> = {
  xs: 'min-h-6 px-2 text-[10px] rounded-md',
  sm: 'min-h-8 px-3 py-1.5 text-[10px] rounded-lg',
  md: 'min-h-10 px-4 py-2.5 text-xs rounded-xl',
  lg: 'min-h-12 px-5 py-3.5 text-xs rounded-2xl',
  icon: 'h-10 w-10 rounded-xl',
};

const activeToneClasses: Record<ButtonTone, string> = {
  slate: 'border-slate-950 bg-slate-950 text-white shadow-[0_18px_45px_-22px_rgba(15,23,42,0.85)]',
  blue: 'border-cyan-700 bg-cyan-700 text-white shadow-[0_18px_45px_-22px_rgba(14,116,144,0.82)]',
  rose: 'border-rose-600 bg-rose-600 text-white shadow-[0_18px_45px_-22px_rgba(225,29,72,0.82)]',
};

function getVariantClasses(variant: ButtonVariant, active: boolean, tone: ButtonTone) {
  if (variant === 'primary' || variant === 'danger') {
    return {
      button: activeToneClasses[variant === 'danger' ? 'rose' : tone],
    };
  }

  if (variant === 'chip' || variant === 'segment') {
    return {
      button: active
        ? activeToneClasses[tone]
        : cn(
            'border-slate-200 bg-white/95 text-slate-600 shadow-[0_10px_24px_-18px_rgba(15,23,42,0.22)]',
            tone === 'blue'
              ? 'hover:border-cyan-700 hover:bg-cyan-700 hover:text-white active:border-cyan-800 active:bg-cyan-800 active:text-white'
              : tone === 'rose'
                ? 'hover:border-rose-700 hover:bg-rose-700 hover:text-white active:border-rose-800 active:bg-rose-800 active:text-white'
                : 'hover:border-slate-800 hover:bg-slate-800 hover:text-white active:border-slate-950 active:bg-slate-950 active:text-white'
          ),
    };
  }

  if (variant === 'ghost') {
    return {
      button: cn(
        'border-transparent bg-transparent text-slate-600',
        tone === 'blue'
          ? 'hover:border-cyan-700 hover:bg-cyan-700 hover:text-white active:border-cyan-800 active:bg-cyan-800 active:text-white'
          : tone === 'rose'
            ? 'hover:border-rose-700 hover:bg-rose-700 hover:text-white active:border-rose-800 active:bg-rose-800 active:text-white'
            : 'hover:border-slate-800 hover:bg-slate-800 hover:text-white active:border-slate-950 active:bg-slate-950 active:text-white'
      ),
    };
  }

  return {
    button: cn(
      'border-slate-200 bg-white/96 text-slate-700 shadow-[0_18px_40px_-26px_rgba(15,23,42,0.32)]',
      tone === 'blue'
        ? 'hover:border-cyan-700 hover:bg-cyan-700 hover:text-white active:border-cyan-800 active:bg-cyan-800 active:text-white'
        : tone === 'rose'
          ? 'hover:border-rose-700 hover:bg-rose-700 hover:text-white active:border-rose-800 active:bg-rose-800 active:text-white'
          : 'hover:border-slate-800 hover:bg-slate-800 hover:text-white active:border-slate-950 active:bg-slate-950 active:text-white'
    ),
  };
}

export function InteractiveButton({
  active = false,
  children,
  className,
  contentClassName,
  disabled,
  size = 'md',
  tone = 'slate',
  type = 'button',
  variant = 'secondary',
  ...props
}: InteractiveButtonProps) {
  const styles = getVariantClasses(variant, active, tone);

  return (
    <motion.button
      type={type}
      disabled={disabled}
      whileHover={disabled ? undefined : { y: -1, scale: 1.01 }}
      whileTap={disabled ? undefined : { scale: 0.985, y: 0 }}
      transition={{ type: 'spring', stiffness: 360, damping: 24, mass: 0.7 }}
      className={cn(
        'group relative isolate inline-flex items-center justify-center overflow-hidden border font-sans font-bold outline-none transition-[border-color,background-color,color,box-shadow,transform] duration-300 ease-out',
        'focus-visible:border-blue-400/80 focus-visible:ring-2 focus-visible:ring-blue-200/80 focus-visible:ring-offset-2',
        'disabled:pointer-events-none disabled:opacity-45',
        sizeClasses[size],
        styles.button,
        className
      )}
      {...props}
    >
      <span className={cn('relative z-10 flex items-center justify-center gap-2', contentClassName)}>
        {children}
      </span>
    </motion.button>
  );
}
