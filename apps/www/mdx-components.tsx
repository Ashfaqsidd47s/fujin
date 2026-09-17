import type { MDXComponents } from "mdx/types"
import defaultMdxComponents from "fumadocs-ui/mdx"
import { Step, Steps } from "fumadocs-ui/components/steps"
import { Tab, Tabs } from "fumadocs-ui/components/tabs"
import { TypeTable } from "fumadocs-ui/components/type-table"

import { ComponentPreview } from "@/components/component-preview"
import { ComponentSource } from "@/components/component-source"

export function getMDXComponents(components?: MDXComponents): MDXComponents {
  return {
    ...defaultMdxComponents,
    Steps,
    Step,
    Tabs,
    Tab,
    TypeTable,
    ComponentPreview,
    ComponentSource,
    ...components,
  }
}
