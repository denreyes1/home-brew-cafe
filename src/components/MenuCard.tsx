import { Card } from "@/components/ui/card";

interface MenuCardProps {
  title: string;
  options?: string[];
  icon?: string;
}

export const MenuCard = ({ title, options, icon }: MenuCardProps) => {
  return (
    <Card className="p-6 bg-card shadow-soft hover:shadow-elevated transition-all duration-300 border-border/50">
      <div className="flex items-start gap-3">
        {icon && <span className="text-2xl">{icon}</span>}
        <div className="flex-1">
          <h3 className="text-xl font-semibold mb-2 text-foreground">{title}</h3>
          {options && options.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {options.map((option, idx) => (
                <span
                  key={idx}
                  className="text-sm px-3 py-1 bg-secondary/70 text-secondary-foreground rounded-full"
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
