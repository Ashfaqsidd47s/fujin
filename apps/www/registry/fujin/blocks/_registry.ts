import type { RegistryItemInput } from "@fujin/schema"

/*
 * Blocks: finished, drop-in screens and cards. Like composites, behaviour
 * lives in lib/<name>/ (no classNames) and markup in blocks/<name>/ (no
 * business logic).
 */
export const blocks: RegistryItemInput[] = [
  {
    name: "otp-verify-card",
    type: "registry:block",
    title: "OTP Verify Card",
    description:
      "A verification-code card whose slots turn into the loader: they orbit, flip, spin or wave while the code is checked, always completing at least one rotation.",
    categories: ["authentication", "forms", "blocks"],
    dependencies: ["lucide-react"],
    registryDependencies: ["@fujin/utils", "@fujin/button", "@fujin/otp-field"],
    files: [
      {
        path: "registry/fujin/lib/otp-verify/otp-loader-animation.ts",
        type: "registry:lib",
      },
      {
        path: "registry/fujin/lib/otp-verify/use-otp-verify.ts",
        type: "registry:lib",
      },
      {
        path: "registry/fujin/blocks/otp-verify-card/otp-verify-card.tsx",
        type: "registry:component",
      },
    ],
    meta: {
      links: { doc: "/docs/blocks/otp-verify-card" },
      fujin: {
        status: "beta",
        summary:
          "OTP verification card: the code slots become the loading animation (orbit/flip/spin/wave), then pop green or shake red. Auto or manual submit, resend cooldown.",
        whenToUse: [
          "Email/SMS verification, 2FA or magic-code sign-in step where you want a polished, finished screen.",
          "You have an async `verify(code)` call and want loading, success, error and resend handled for you.",
        ],
        whenNotToUse: [
          "You only need the input itself inside your own form layout - use `otp-field`.",
          "Codes longer than ~8 characters (recovery keys) - use `input`; the ring gets crowded.",
          "Server-side form posts with no client JS - the block verifies through `onVerify`, not a form action. Use `otp-field` with `name` inside a plain `<form>`.",
        ],
        anatomy: `<OtpVerifyCard
  length={6}
  submitMode="auto" | "manual"
  onVerify={async (code) => boolean | { ok, message } | throws}
  onSuccess={(code) => router.push("/")}
  onResend={sendCode}
  animation={{ variant: "orbit", duration, minRotations, ... }}
/>

// Or headless: useOtpVerify(options) -> { value, setValue, status, submit, handleComplete, stageRef, ... }`,
        props: [
          {
            owner: "OtpVerifyCard",
            name: "onVerify",
            type: "(code: string) => OtpVerifyResult | Promise<OtpVerifyResult>",
            required: true,
            description:
              "Checks the code. Return `false` or `{ ok: false, message }`, or throw, to reject it; anything else passes.",
          },
          {
            owner: "OtpVerifyCard",
            name: "length",
            type: "number",
            default: "6",
            description: "Number of slots.",
          },
          {
            owner: "OtpVerifyCard",
            name: "submitMode",
            type: '"auto" | "manual"',
            default: '"auto"',
            description:
              "Auto verifies as soon as the last slot is filled or a full code is pasted. Manual waits for the Verify button or Enter.",
          },
          {
            owner: "OtpVerifyCard",
            name: "animation",
            type: "Partial<OtpLoaderOptions>",
            description:
              'variant ("orbit" | "flip" | "spin" | "wave" | "pulse"), duration (ms per rotation, 1100), minRotations (1), stagger (90), easing, enterDuration (650), exitDuration (600), radius ("auto"), orbitScale (0.82), direction (1 | -1), reducedMotion ("user" | "always" | "never").',
          },
          {
            owner: "OtpVerifyCard",
            name: "onSuccess / onError",
            type: "(code) => void / (message, code) => void",
            description:
              "Run once the outcome is shown, after the loader settles.",
          },
          {
            owner: "OtpVerifyCard",
            name: "onResend / resendCooldown",
            type: "() => void | Promise<void> / number",
            default: "- / 30",
            description:
              "Shows a resend action with a countdown (seconds) that starts on mount and after each resend. Omit `onResend` to hide it.",
          },
          {
            owner: "OtpVerifyCard",
            name: "clearOnError",
            type: "boolean",
            default: "false",
            description:
              "Clear the slots after a rejected code. Off so a single typo can be fixed.",
          },
          {
            owner: "OtpVerifyCard",
            name: "groupSize",
            type: "number",
            default: "0",
            description: "Separator every N slots, e.g. 3 for 123-456.",
          },
          {
            owner: "OtpVerifyCard",
            name: "validationType / mask / name",
            type: "OTPField props",
            description: "Passed to the underlying `otp-field`.",
          },
          {
            owner: "OtpVerifyCard",
            name: "title / description / icon / labels / footer",
            type: "ReactNode / Partial<OtpVerifyCardLabels>",
            description:
              "Copy and i18n. `labels` covers the field name, button, status messages, resend text and per-slot names. `icon={null}` hides the badge.",
          },
          {
            owner: "OtpVerifyCard",
            name: "value / defaultValue / onValueChange",
            type: "string",
            description: "Controlled or uncontrolled code.",
          },
        ],
        examples: [
          {
            title: "Auto-verify with resend",
            code: `<OtpVerifyCard
  length={6}
  groupSize={3}
  onVerify={async (code) => {
    const res = await fetch("/api/verify", { method: "POST", body: JSON.stringify({ code }) })
    return res.ok || { ok: false, message: "That code has expired." }
  }}
  onSuccess={() => router.push("/dashboard")}
  onResend={() => fetch("/api/resend", { method: "POST" })}
/>`,
          },
          {
            title: "Manual submit, flip animation, two full turns",
            code: `<OtpVerifyCard
  length={4}
  submitMode="manual"
  animation={{ variant: "flip", minRotations: 2, duration: 900, stagger: 120 }}
  onVerify={verifyPin}
/>`,
          },
          {
            title: "Headless: your own markup, same motion",
            code: `const { stageRef, ...otp } = useOtpVerify({ length: 6, onVerify })

<div ref={stageRef} className="flex items-center justify-center">
  <OTPField length={6} value={otp.value} onValueChange={otp.setValue}
    onValueComplete={otp.handleComplete} readOnly={otp.isLocked}>
    {/* 6 × <OTPFieldSlot /> */}
  </OTPField>
</div>`,
          },
        ],
        pitfalls: [
          "The loader always completes `minRotations` full rotations (at least 1), so the outcome can appear up to one rotation after `onVerify` resolves. Lower `duration` for a snappier feel; don't set `minRotations` to 0 (it is clamped to 1).",
          "`onSuccess` is the place to navigate - it runs after the loader settles. Navigating inside `onVerify` cuts the animation off.",
          "In headless use, destructure the ref out (`const { stageRef, ...otp } = useOtpVerify(...)`). Reading fields of an object that holds a ref trips React Compiler's `react-hooks/refs` lint rule.",
          "In headless use, `stageRef` must wrap only the slots, lay them out in one row and centre them vertically: the orbit measures slot positions from it and grows its padding to fit the ring.",
          '`animation.variant` is ignored under `prefers-reduced-motion` (falls back to `pulse`) unless `reducedMotion: "never"`.',
          "Animations use the Web Animations API. Where it is missing (jsdom) the loader is skipped and verification still works.",
        ],
        a11y: [
          'Status (verifying, verified, error message) is announced through a `role="status"` live region that also describes the field.',
          "Slots are read-only (not disabled) while verifying, so focus stays put; on error focus returns to the first slot with its value selected.",
          "Entered code is kept after an error by default (WCAG 3.3.7); paste and `one-time-code` autofill are never blocked (WCAG 3.3.8).",
          "Honours `prefers-reduced-motion`: rotation becomes an opacity pulse and the error shake becomes a fade.",
          "Resend and submit are 24px+ targets with solid focus rings.",
        ],
        tokens: [
          "--primary",
          "--success",
          "--destructive",
          "--card",
          "--muted-foreground",
        ],
        related: ["otp-field", "button", "input"],
        editing: {
          ui: ["components/otp-verify-card.tsx"],
          logic: [
            "lib/otp-verify/use-otp-verify.ts",
            "lib/otp-verify/otp-loader-animation.ts",
          ],
        },
      },
    },
  },
]
