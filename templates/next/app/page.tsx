import { SubscribeForm } from "@/app/subscribe-form"

export default function Page() {
  return (
    <main className="mx-auto flex min-h-svh max-w-md flex-col justify-center gap-8 p-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold tracking-tight">Project ready</h1>
        <p className="text-sm text-muted-foreground">
          Add components with{" "}
          <code className="font-mono">npx @fujin/cli add</code>. Press{" "}
          <kbd className="font-mono">d</kbd> to toggle dark mode.
        </p>
      </div>
      <SubscribeForm />
    </main>
  )
}
