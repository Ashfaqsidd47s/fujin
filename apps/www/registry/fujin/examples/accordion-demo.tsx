import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/registry/fujin/ui/accordion"

const faqs = [
  {
    value: "shipping",
    question: "How long does shipping take?",
    answer:
      "Orders ship within 2 business days. Delivery takes 3-5 days in the EU and 5-8 days elsewhere.",
  },
  {
    value: "returns",
    question: "What is your return policy?",
    answer:
      "Return any unused item within 30 days for a full refund. We cover the restocking fee.",
  },
  {
    value: "warranty",
    question: "Is there a warranty?",
    answer:
      "Every product has a 2-year warranty covering manufacturing defects.",
  },
]

export default function AccordionDemo() {
  return (
    <Accordion defaultValue={["shipping"]} className="max-w-md">
      {faqs.map((faq) => (
        <AccordionItem key={faq.value} value={faq.value}>
          <AccordionTrigger>{faq.question}</AccordionTrigger>
          <AccordionContent>{faq.answer}</AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  )
}
