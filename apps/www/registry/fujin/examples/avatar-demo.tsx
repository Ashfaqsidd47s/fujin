import {
  Avatar,
  AvatarFallback,
  AvatarGroup,
  AvatarGroupCount,
  AvatarImage,
} from "@/registry/fujin/ui/avatar"

export default function AvatarDemo() {
  return (
    <div className="flex flex-col items-center gap-6">
      <div className="flex items-center gap-4">
        <Avatar size="sm">
          <AvatarImage src="https://github.com/shadcn.png" alt="shadcn" />
          <AvatarFallback>SC</AvatarFallback>
        </Avatar>
        <Avatar>
          <AvatarImage src="https://github.com/shadcn.png" alt="shadcn" />
          <AvatarFallback>SC</AvatarFallback>
        </Avatar>
        <Avatar size="lg">
          <AvatarImage src="https://github.com/shadcn.png" alt="shadcn" />
          <AvatarFallback>SC</AvatarFallback>
        </Avatar>
        {/* Broken image: the initials take over after 300ms. */}
        <Avatar size="lg">
          <AvatarImage src="/does-not-exist.png" alt="Lena Torres" />
          <AvatarFallback delay={300}>
            <span aria-hidden>LT</span>
            <span className="sr-only">Lena Torres</span>
          </AvatarFallback>
        </Avatar>
      </div>
      <AvatarGroup role="group" aria-label="Assigned to 6 people">
        <Avatar>
          <AvatarImage src="https://github.com/shadcn.png" alt="shadcn" />
          <AvatarFallback>SC</AvatarFallback>
        </Avatar>
        <Avatar>
          <AvatarImage src="https://github.com/vercel.png" alt="Vercel" />
          <AvatarFallback>VC</AvatarFallback>
        </Avatar>
        <Avatar>
          <AvatarFallback>
            <span aria-hidden>MA</span>
            <span className="sr-only">Maya Adams</span>
          </AvatarFallback>
        </Avatar>
        {/* aria-label is ignored on a span, so pair hidden "+3" with sr-only text. */}
        <AvatarGroupCount>
          <span aria-hidden>+3</span>
          <span className="sr-only">and 3 more</span>
        </AvatarGroupCount>
      </AvatarGroup>
    </div>
  )
}
