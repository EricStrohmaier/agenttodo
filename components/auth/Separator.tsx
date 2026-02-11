interface SeparatorProps {
  text: string;
}

export default function Separator({ text }: SeparatorProps) {
  return (
    <div className="relative">
      <div className="relative flex items-center">
        <div className="grow border-t border-stone-400"></div>
        <span className="mx-3 shrink text-xs leading-8 text-stone-400">
          {text}
        </span>
        <div className="grow border-t border-stone-400"></div>
      </div>
    </div>
  );
}
