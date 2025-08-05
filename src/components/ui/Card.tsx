interface CardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  className?: string;
}

export default function Card({ title, value, subtitle, icon, className = "" }: CardProps) {
  return (
    <div className={`bg-white rounded-lg shadow-sm border border-primary/10 p-6 ${className}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-charcoal/60">{title}</p>
          <p className="text-2xl font-bold text-charcoal mt-1">{value}</p>
          {subtitle && (
            <p className="text-sm text-charcoal/50 mt-1">{subtitle}</p>
          )}
        </div>
        {icon && (
          <div className="text-2xl text-primary">
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}