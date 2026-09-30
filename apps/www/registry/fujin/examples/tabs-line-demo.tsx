import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/registry/fujin/ui/tabs"

const sections = [
  {
    value: "overview",
    label: "Overview",
    body: "Traffic is up 12% week over week.",
  },
  {
    value: "analytics",
    label: "Analytics",
    body: "Most visits come from organic search.",
  },
  {
    value: "reports",
    label: "Reports",
    body: "3 scheduled reports run every Monday.",
  },
]

export default function TabsLineDemo() {
  return (
    <div className="flex w-full max-w-lg flex-col gap-10">
      <Tabs defaultValue="overview">
        <TabsList variant="line">
          {sections.map((section) => (
            <TabsTrigger key={section.value} value={section.value}>
              {section.label}
            </TabsTrigger>
          ))}
        </TabsList>
        {sections.map((section) => (
          <TabsContent
            key={section.value}
            value={section.value}
            className="p-2"
          >
            {section.body}
          </TabsContent>
        ))}
      </Tabs>

      <Tabs defaultValue="overview" orientation="vertical">
        <TabsList variant="line" indicator>
          {sections.map((section) => (
            <TabsTrigger key={section.value} value={section.value}>
              {section.label}
            </TabsTrigger>
          ))}
        </TabsList>
        {sections.map((section) => (
          <TabsContent
            key={section.value}
            value={section.value}
            className="p-2"
          >
            {section.body}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}
