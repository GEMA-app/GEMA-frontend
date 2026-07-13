interface AccionBadgeProps {
  accion: string;
}

export function AccionBadge({ accion }: AccionBadgeProps) {
  return (
    <span className="inline-block rounded-full bg-[#F5E6C8] text-[#8B5E3C] px-3 py-1 text-xs font-bold">
      {accion}
    </span>
  );
}
