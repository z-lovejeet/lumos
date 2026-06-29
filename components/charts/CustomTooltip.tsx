export function CustomTooltip({ active, payload, label }: any) {
  if (active && payload && payload.length) {
    // For pie charts, label might be empty but name is inside payload
    const displayLabel = label || (payload[0] && payload[0].payload && payload[0].payload.name) || payload[0].name;
    
    return (
      <div className="bg-background/80 backdrop-blur-md border border-border/50 p-3.5 rounded-xl shadow-2xl flex flex-col gap-2">
        {displayLabel && (
          <p className="font-semibold text-foreground text-sm border-b border-border/50 pb-1">
            {displayLabel}
          </p>
        )}
        <div className="flex flex-col gap-1.5 mt-0.5">
          {payload.map((entry: any, index: number) => {
            const color = entry.color || entry.payload?.fill || 'var(--primary)';
            // Ensure we handle custom formatting if it was passed via dataKey or something
            let name = entry.name;
            let value = entry.value;

            // Format numbers slightly nicer if they are raw floats
            if (typeof value === 'number' && !Number.isInteger(value)) {
               value = value.toFixed(2);
            }

            return (
              <div key={index} className="flex items-center gap-3 text-sm">
                <div 
                  className="w-2.5 h-2.5 rounded-full shadow-sm" 
                  style={{ backgroundColor: color }}
                />
                <span className="text-muted-foreground capitalize">
                  {name}:
                </span>
                <span className="font-medium text-foreground">
                  {value}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    );
  }
  return null;
}
