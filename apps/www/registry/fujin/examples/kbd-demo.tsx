import { Kbd, KbdGroup } from "@/registry/fujin/ui/kbd"

export default function KbdDemo() {
  return (
    <div className="flex flex-col items-center gap-4 text-sm text-muted-foreground">
      <p>
        Press{" "}
        <KbdGroup>
          <Kbd>
            <span aria-hidden>⌘</span>
            <span className="sr-only">Command</span>
          </Kbd>
          <Kbd>K</Kbd>
        </KbdGroup>{" "}
        to open the command menu.
      </p>
      <p>
        <KbdGroup>
          <Kbd>Ctrl</Kbd>+<Kbd>Shift</Kbd>+<Kbd>P</Kbd>
        </KbdGroup>{" "}
        opens the palette on Windows and Linux.
      </p>
      <p>
        Close with <Kbd>Esc</Kbd>.
      </p>
    </div>
  )
}
