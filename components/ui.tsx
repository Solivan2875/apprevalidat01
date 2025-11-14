import React, { useState, createContext, useContext, useRef, useEffect, forwardRef, HTMLAttributes } from 'react';
import * as Framer from 'framer-motion';
import { cn } from '../lib/utils';
import { X } from 'lucide-react';

// --- Toast (Sonner Replacement) ---
type Toast = {
  id: number;
  title: string;
  variant: 'default' | 'success' | 'error';
};
type ToastContextType = {
  addToast: (toast: Omit<Toast, 'id'>) => void;
};
const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const addToast = (toast: Omit<Toast, 'id'>) => {
    setToasts((prev) => [...prev, { ...toast, id: Date.now() }]);
  };
  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <Toaster toasts={toasts} setToasts={setToasts} />
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used within a ToastProvider');
  
  const toast = (title: string) => context.addToast({ title, variant: 'default' });
  toast.success = (title: string) => context.addToast({ title, variant: 'success' });
  toast.error = (title: string) => context.addToast({ title, variant: 'error' });
  
  return { toast };
};

const Toaster: React.FC<{ toasts: Toast[], setToasts: React.Dispatch<React.SetStateAction<Toast[]>> }> = ({ toasts, setToasts }) => {
  const removeToast = (id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  useEffect(() => {
    if (toasts.length > 0) {
      const timer = setTimeout(() => removeToast(toasts[0].id), 3000);
      return () => clearTimeout(timer);
    }
  }, [toasts]);

  const variantClasses = {
    default: 'bg-white border-gray-200 text-gray-800',
    success: 'bg-green-50 border-green-200 text-green-800',
    error: 'bg-red-50 border-red-200 text-red-800',
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 w-80 space-y-2">
      <Framer.AnimatePresence>
        {toasts.map((toast) => (
          // Fix: Use Framer.motion.div to ensure correct type resolution
          <Framer.motion.div
            key={toast.id}
            layout
            initial={{ opacity: 0, y: 50, scale: 0.3 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.2 } }}
            className={cn('relative p-4 rounded-lg shadow-lg border', variantClasses[toast.variant])}
          >
            {toast.title}
            <button onClick={() => removeToast(toast.id)} className="absolute top-2 right-2 p-1 rounded-full hover:bg-gray-200/50">
                <X className="w-4 h-4" />
            </button>
          </Framer.motion.div>
        ))}
      </Framer.AnimatePresence>
    </div>
  );
};


// --- Card ---
export const Card = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("rounded-lg border bg-card text-card-foreground shadow-sm", className)} {...props} />
));
Card.displayName = "Card";

export const CardContent = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
));
CardContent.displayName = "CardContent";

// --- Button ---
export const Button = forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'default' | 'outline', size?: 'default' | 'sm' | 'icon' }>(({ className, variant = 'default', size = 'default', ...props }, ref) => {
  const variants = {
    default: "bg-gray-900 text-white hover:bg-gray-900/90",
    outline: "border border-gray-200 bg-transparent hover:bg-gray-100",
  };
  const sizes = {
    default: "h-10 px-4 py-2",
    sm: "h-9 rounded-md px-3",
    icon: "h-10 w-10",
  };
  return (
    <button className={cn("inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50", variants[variant], sizes[size], className)} ref={ref} {...props} />
  );
});
Button.displayName = "Button";

// --- Input ---
export const Input = forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(({ className, type, ...props }, ref) => {
  return (
    <input type={type} className={cn("flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50", className)} ref={ref} {...props} />
  );
});
Input.displayName = "Input";

// --- Label ---
export const Label = forwardRef<HTMLLabelElement, React.LabelHTMLAttributes<HTMLLabelElement>>(({ className, ...props }, ref) => (
  <label ref={ref} className={cn("text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70", className)} {...props} />
));
Label.displayName = "Label";

// --- Progress ---
export const Progress = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement> & { value?: number }>(({ className, value, ...props }, ref) => (
  <div ref={ref} className={cn("relative h-4 w-full overflow-hidden rounded-full bg-gray-100", className)} {...props}>
    <div className="h-full w-full flex-1 bg-gray-900 transition-all" style={{ transform: `translateX(-${100 - (value || 0)}%)` }} />
  </div>
));
Progress.displayName = "Progress";

// --- Switch ---
export const Switch = forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement> & { checked?: boolean, onCheckedChange?: (checked: boolean) => void }>(({ className, checked, onCheckedChange, ...props }, ref) => {
  const [internalChecked, setInternalChecked] = useState(props.defaultChecked || false);
  const isControlled = checked !== undefined;
  const currentChecked = isControlled ? checked : internalChecked;
  
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (onCheckedChange) {
      onCheckedChange(!currentChecked);
    }
    if (!isControlled) {
      setInternalChecked(!currentChecked);
    }
    props.onClick?.(e);
  };
  
  return (
  <button
    type="button"
    role="switch"
    aria-checked={currentChecked}
    onClick={handleClick}
    ref={ref}
    className={cn(
      'peer inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
      currentChecked ? 'bg-gray-900' : 'bg-gray-200',
      className
    )}
    {...props}
  >
    <span
      className={cn(
        'pointer-events-none block h-5 w-5 rounded-full bg-white shadow-lg ring-0 transition-transform',
        currentChecked ? 'translate-x-5' : 'translate-x-0'
      )}
    />
  </button>
  );
});
Switch.displayName = "Switch";

// --- Tabs ---
const TabsContext = createContext<{ activeTab: string; setActiveTab: (value: string) => void; }>({ activeTab: '', setActiveTab: () => {} });
export const Tabs: React.FC<{ value?: string; defaultValue?: string; children: React.ReactNode; className?: string; onValueChange?: (value: string) => void; }> = ({ value, defaultValue, children, className, onValueChange }) => {
  const [internalActiveTab, setInternalActiveTab] = useState(defaultValue);

  const isControlled = value !== undefined;
  const activeTab = isControlled ? value : internalActiveTab;
  
  const handleTabChange = (tabValue: string) => {
    if (!isControlled) {
      setInternalActiveTab(tabValue);
    }
    if (onValueChange) {
      onValueChange(tabValue);
    }
  };

  return <TabsContext.Provider value={{ activeTab: activeTab ?? '', setActiveTab: handleTabChange }}><div className={className}>{children}</div></TabsContext.Provider>;
};
export const TabsList: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => <div className={cn("inline-flex h-10 items-center justify-center rounded-md bg-gray-100 p-1 text-gray-500", className)}>{children}</div>;
export const TabsTrigger: React.FC<{ value: string; children: React.ReactNode; className?: string }> = ({ value, children, className }) => {
  const { activeTab, setActiveTab } = useContext(TabsContext);
  return <button onClick={() => setActiveTab(value)} className={cn("inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50", activeTab === value && "bg-white text-gray-900 shadow-sm", className)}>{children}</button>;
};
export const TabsContent: React.FC<{ value: string; children: React.ReactNode; className?: string }> = ({ value, children, className }) => {
  const { activeTab } = useContext(TabsContext);
  return activeTab === value ? <div className={cn("mt-2", className)}>{children}</div> : null;
};

// --- Tooltip ---
export const TooltipProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => <>{children}</>;
const TooltipContext = createContext<{ open: boolean; setOpen: (open: boolean) => void; }>({ open: false, setOpen: () => {} });
export const Tooltip: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [open, setOpen] = useState(false);
  return <TooltipContext.Provider value={{ open, setOpen }}>{children}</TooltipContext.Provider>;
};
export const TooltipTrigger: React.FC<{ children: React.ReactNode; asChild?: boolean }> = ({ children, asChild }) => {
  const { setOpen } = useContext(TooltipContext);
  const triggerRef = useRef<HTMLElement>(null);
  
  const handleMouseEnter = () => setOpen(true);
  const handleMouseLeave = () => setOpen(false);

  if (asChild) {
    // Fix: Cast props to `any` to bypass TypeScript's strict checking for props
    // that may not exist on the child component's inferred type. This is a common
    // pattern for components with `asChild` props.
    return React.cloneElement(children as React.ReactElement, {
      ref: triggerRef,
      onMouseEnter: handleMouseEnter,
      onMouseLeave: handleMouseLeave,
    } as any);
  }
  
  return <span ref={triggerRef} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>{children}</span>;
};
export const TooltipContent: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => {
  const { open } = useContext(TooltipContext);
  return open ? <div className={cn("z-50 overflow-hidden rounded-md border bg-white px-3 py-1.5 text-sm text-gray-900 shadow-md animate-in fade-in-0 zoom-in-95", className)}>{children}</div> : null;
};


// --- Dialog ---
const DialogContext = createContext<{ open: boolean; setOpen: (open: boolean) => void; }>({ open: false, setOpen: () => {} });
export const Dialog: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [open, setOpen] = useState(false);
  return <DialogContext.Provider value={{ open, setOpen }}>{children}</DialogContext.Provider>;
};
export const DialogTrigger: React.FC<{ children: React.ReactNode; asChild?: boolean }> = ({ children, asChild }) => {
  const { setOpen } = useContext(DialogContext);
  const handleOpen = () => setOpen(true);

  if (asChild) {
    // Fix: Cast props to `any` to bypass TypeScript's strict checking for props
    // that may not exist on the child component's inferred type.
    return React.cloneElement(children as React.ReactElement, { onClick: handleOpen } as any);
  }

  return <div onClick={handleOpen}>{children}</div>;
};
export const DialogContent: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => {
  const { open, setOpen } = useContext(DialogContext);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (contentRef.current && !contentRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [open, setOpen]);
  
  return (
    // Fix: Use Framer.AnimatePresence to ensure correct type resolution
    <Framer.AnimatePresence>
      {open && (
        // Fix: Use Framer.motion.div to ensure correct type resolution
        <Framer.motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          {/* Fix: Use Framer.motion.div to ensure correct type resolution */}
          <Framer.motion.div ref={contentRef} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className={cn("relative z-50 grid w-full max-w-lg gap-4 border bg-white p-6 shadow-lg rounded-lg", className)}>
            {children}
            <button onClick={() => setOpen(false)} className="absolute top-4 right-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none">
              <X className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </button>
          </Framer.motion.div>
        </Framer.motion.div>
      )}
    </Framer.AnimatePresence>
  );
};
export const DialogHeader: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => <div className={cn("flex flex-col space-y-1.5 text-center sm:text-left", className)}>{children}</div>;
export const DialogTitle: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => <h2 className={cn("text-lg font-semibold leading-none tracking-tight", className)}>{children}</h2>;