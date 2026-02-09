"use client";

import { useOthers, useSelf } from "@/lib/liveblocks.config";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export function PresenceAvatars() {
  const others = useOthers();
  const self = useSelf();

  return (
    <TooltipProvider delayDuration={200}>
      <div className="flex items-center gap-0.5">
        {others.map(({ connectionId, info }) => (
          <Tooltip key={connectionId}>
            <TooltipTrigger asChild>
              <button
                type="button"
                className="rounded-full p-0.5 hover:bg-[#f1f3f4] transition-colors focus:outline-none focus:ring-2 focus:ring-[#1a73e8] focus:ring-offset-1"
              >
                <Avatar
                  className="h-6 w-6 border-2 border-white shadow-sm"
                  style={{ borderColor: info.color }}
                >
                  <AvatarImage src={info.avatar} alt={info.name} />
                  <AvatarFallback
                    className="text-[10px] font-medium"
                    style={{ backgroundColor: info.color, color: "#fff" }}
                  >
                    {info.name.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </button>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="text-xs">
              {info.name}
            </TooltipContent>
          </Tooltip>
        ))}
        {self && (
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                className="rounded-full p-0.5 hover:bg-[#f1f3f4] transition-colors focus:outline-none focus:ring-2 focus:ring-[#1a73e8] focus:ring-offset-1 ring-1 ring-[#dadce0]"
              >
                <Avatar
                  className="h-6 w-6 border-2 border-white shadow-sm"
                  style={{ borderColor: self.info.color }}
                >
                  <AvatarImage src={self.info.avatar} alt={self.info.name} />
                  <AvatarFallback
                    className="text-[10px] font-medium"
                    style={{ backgroundColor: self.info.color, color: "#fff" }}
                  >
                    {self.info.name.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </button>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="text-xs">
              You — {self.info.name}
            </TooltipContent>
          </Tooltip>
        )}
      </div>
    </TooltipProvider>
  );
}
