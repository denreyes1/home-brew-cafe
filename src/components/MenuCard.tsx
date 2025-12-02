import { Card } from "@/components/ui/card";

interface MenuCardProps {
  title: string;
  description?: string;
  options?: string[];
  comingSoon?: boolean;
  onSelect?: () => void;
}

export const MenuCard = ({ title, description, options, comingSoon, onSelect }: MenuCardProps) => {
  const isInteractive = !!onSelect && !comingSoon;

  return (
    <Card
      className={`h-full flex flex-col p-6 bg-card transition-all duration-300 border-2 border-border rounded-sm ${
        isInteractive ? "cursor-pointer hover:border-primary hover:bg-card/80" : "opacity-80"
      }`}
      onClick={isInteractive ? onSelect : undefined}
      role={isInteractive ? "button" : undefined}
      tabIndex={isInteractive ? 0 : -1}
    >
      <div className="flex-1 space-y-3">
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-xl md:text-2xl font-semibold text-foreground tracking-wide">
            {title}
          </h3>
          {comingSoon && (
            <span className="text-xs px-3 py-1 rounded-full border border-destructive/40 text-destructive font-semibold uppercase tracking-wider">
              Coming Soon
            </span>
          )}
        </div>
        {description && (
          <p className="text-xs text-muted-foreground leading-relaxed">
            {description}
          </p>
        )}
        {options && options.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {options.map((option, idx) => (
              <span
                key={idx}
                className="text-xs px-3 py-1 bg-secondary text-secondary-foreground rounded-full font-medium uppercase tracking-wider border border-secondary-foreground/20"
              >
                {option}
              </span>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
};
