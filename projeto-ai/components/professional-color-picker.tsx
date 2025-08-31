import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ProfessionalColorPickerProps {
  selectedColor: string;
  onSelectColor: (color: string) => void;
}

const colors = [
  "bg-red-500", "bg-blue-500", "bg-green-500", "bg-yellow-500",
  "bg-purple-500", "bg-pink-500", "bg-indigo-500", "bg-teal-500",
  "bg-orange-500", "bg-cyan-500", "bg-lime-500", "bg-fuchsia-500",
];

export function ProfessionalColorPicker({ selectedColor, onSelectColor }: ProfessionalColorPickerProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className="w-full justify-start text-left font-normal"
        >
          <div className={cn("w-4 h-4 rounded-full mr-2", selectedColor)}></div>
          <span>Cor</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-2">
        <div className="grid grid-cols-4 gap-2">
          {colors.map((color) => (
            <div
              key={color}
              className={cn(
                "w-8 h-8 rounded-full cursor-pointer",
                color,
                selectedColor === color && "ring-2 ring-offset-2 ring-primary"
              )}
              onClick={() => onSelectColor(color)}
            />
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}
