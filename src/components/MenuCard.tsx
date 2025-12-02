import { Card } from "@/components/ui/card";

interface MenuCardProps {
  title: string;
  options?: string[];
  icon?: string;
}

export const MenuCard = ({ title, options, icon }: MenuCardProps) => {
  return (
    <Card className="p-6 bg-card shadow-elevated hover:shadow-spray transition-all duration-300 border-2 border-border hover:border-primary rounded-sm">
      <div className="flex items-start gap-3">
        {icon && <span className="text-2xl">{icon}</span>}
        <div className="flex-1">
          <h3 className="text-xl md:text-2xl font-semibold mb-2 text-foreground tracking-wide">{title}</h3>
          {options && options.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {options.map((option, idx) => (
                <span
                  key={idx}
                  className="text-xs px-3 py-1 bg-secondary text-secondary-foreground rounded-sm font-medium uppercase tracking-wider border border-secondary-foreground/20"
                >
                  {option}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};
