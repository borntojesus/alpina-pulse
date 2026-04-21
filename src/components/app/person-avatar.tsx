import { cn, initials } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function PersonAvatar({
  name,
  src,
  size = 32,
  className,
}: {
  name: string;
  src?: string;
  size?: number;
  className?: string;
}) {
  return (
    <Avatar
      className={cn("border border-border/60 bg-muted", className)}
      style={{ width: size, height: size }}
    >
      {src ? (
        <AvatarImage
          src={src}
          alt={name}
          className="object-cover [object-position:50%_28%]"
        />
      ) : null}
      <AvatarFallback className="text-[10px]">{initials(name)}</AvatarFallback>
    </Avatar>
  );
}

export function AvatarStack({
  people,
  max = 4,
  size = 24,
  className,
}: {
  people: { name: string; src?: string }[];
  max?: number;
  size?: number;
  className?: string;
}) {
  const shown = people.slice(0, max);
  const overflow = people.length - shown.length;
  return (
    <div className={cn("flex items-center", className)}>
      {shown.map((p, i) => (
        <PersonAvatar
          key={p.name + i}
          name={p.name}
          src={p.src}
          size={size}
          className={cn("ring-2 ring-background", i > 0 && "-ml-1.5")}
        />
      ))}
      {overflow > 0 ? (
        <span
          className="-ml-1.5 flex items-center justify-center rounded-full border border-border/60 bg-muted text-[10px] font-medium text-muted-foreground ring-2 ring-background"
          style={{ width: size, height: size }}
        >
          +{overflow}
        </span>
      ) : null}
    </div>
  );
}
